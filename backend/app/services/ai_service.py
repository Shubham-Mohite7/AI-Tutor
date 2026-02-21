"""
ai_service.py
All OpenRouter / LLM logic lives here.
Routes never touch the OpenAI client directly.
"""
from __future__ import annotations
import re
import json
import logging
from openai import OpenAI, APIError

from app.core.config import get_settings
from app.models.schemas import QuizQuestion, QuestionResult, ScoreResponse

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Client factory ────────────────────────────────────────────────────────────

def _client() -> OpenAI:
    return OpenAI(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _clean(text: str) -> str:
    """Strip markdown / special symbols → clean plain text."""
    if not text:
        return ""
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"__(.*?)__", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"_(.*?)_", r"\1", text)
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*\d+[.)]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`(.*?)`", r"\1", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\s+([.,!?;:])", r"\1", text)
    return text


def _stream(messages: list[dict], max_tokens: int, temperature: float) -> tuple[str, int]:
    """Stream a completion; return (full_text, reasoning_tokens)."""
    try:
        stream = _client().chat.completions.create(
            model=settings.MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
            extra_body={"include_reasoning": True},
        )
        text = ""
        r_tokens = 0
        for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                text += delta.content
            if hasattr(chunk, "usage") and chunk.usage:
                r_tokens = getattr(chunk.usage, "reasoning_tokens", 0)
        logger.info("reasoning_tokens=%d", r_tokens)
        return text, r_tokens
    except APIError as exc:
        logger.error("OpenRouter API error: %s", exc)
        raise


def _parse_quiz(raw: str) -> list[dict]:
    raw = raw.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw).strip()
    try:
        result = json.loads(raw)
        return result if isinstance(result, list) else []
    except json.JSONDecodeError as exc:
        logger.error("Quiz JSON parse error: %s | snippet: %.300s", exc, raw)
        return []


def _validate_questions(raw: list[dict]) -> list[QuizQuestion]:
    valid: list[QuizQuestion] = []
    for q in raw:
        if not isinstance(q, dict):
            continue
        if not q.get("question", "").strip():
            continue
        if len(q.get("options", [])) < 2:
            continue
        if not q.get("correct", "").strip():
            continue
        if "placeholder" in q.get("question", "").lower():
            continue
        try:
            valid.append(QuizQuestion(**q))
        except Exception:
            continue
    return valid


_FALLBACK_QS: list[QuizQuestion] = [
    QuizQuestion(
        type="tf",
        question="The explanation directly covered the core concepts of this topic.",
        options=["True", "False"],
        correct="True",
        explanation="The explanation addressed this topic step by step.",
    ),
    QuizQuestion(
        type="tf",
        question="Understanding this topic requires no prior knowledge whatsoever.",
        options=["True", "False"],
        correct="False",
        explanation="Some foundational context is typically helpful.",
    ),
]


# ── Public API ────────────────────────────────────────────────────────────────

def explain_topic(topic: str, language: str = "en") -> tuple[str, int]:
    lang_name = "English" if language == "en" else "Hindi"
    prompt = (
        f"You are a friendly, encouraging tutor for Indian students.\n"
        f"Explain '{topic}' step by step in simple {lang_name} language.\n"
        f"Use everyday Indian examples (like Diwali, cricket, monsoon) where possible.\n"
        f"Be clear, engaging, and boost confidence at the end.\n"
        f"Write in normal paragraphs only — do NOT use headings, bold, italics, "
        f"bullets, asterisks, code blocks, or any special symbols."
    )
    raw, tokens = _stream(
        messages=[{"role": "user", "content": prompt}],
        max_tokens=700,
        temperature=0.7,
    )
    return _clean(raw), tokens


def generate_quiz(topic: str, explanation: str) -> tuple[list[QuizQuestion], int]:
    prompt = (
        f"You are a strict exam setter. Based ONLY on this explanation of '{topic}', "
        f"create exactly 10 questions.\n\n"
        f"EXPLANATION:\n{explanation}\n\n"
        f"STRICT RULES:\n"
        f"- Every question must be answerable from the explanation above.\n"
        f"- Mix of MCQ (4 options) and True/False questions.\n"
        f'- Output ONLY raw valid JSON array — no markdown, no extra text.\n'
        f'- MCQ format: {{"type":"mcq","question":"...?","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"..."}}\n'
        f'- T/F format: {{"type":"tf","question":"...?","options":["True","False"],"correct":"True","explanation":"..."}}\n'
        f"- correct: letter only (A/B/C/D) for MCQ; exactly 'True' or 'False' for T/F.\n"
        f"- Output a JSON array of exactly 10 objects."
    )
    raw, tokens = _stream(
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000,
        temperature=0.6,
    )
    questions = _validate_questions(_parse_quiz(raw))
    # Pad if model returned fewer than 10
    i = 0
    while len(questions) < 10:
        questions.append(_FALLBACK_QS[i % len(_FALLBACK_QS)])
        i += 1
    return questions[:10], tokens


def score_quiz(quiz: list[dict], answers: list[str | None]) -> ScoreResponse:
    score = 0
    results: list[QuestionResult] = []
    for i, (q, ans) in enumerate(zip(quiz, answers)):
        correct = q.get("correct", "").strip()
        user = (ans or "").strip()
        # Normalise "A) ..." → "A"
        user_key = user.split(")")[0].strip() if ")" in user else user
        correct_key = correct.split(")")[0].strip() if ")" in correct else correct
        ok = user_key == correct_key
        if ok:
            score += 1
        results.append(
            QuestionResult(
                question_number=i + 1,
                question=q.get("question", ""),
                is_correct=ok,
                user_answer=ans,
                correct_answer=correct,
                explanation=q.get("explanation", ""),
            )
        )
    total = len(quiz)
    pct = round((score / total * 100) if total else 0, 1)
    grade = (
        "Excellent!" if pct >= 80
        else "Good effort!" if pct >= 60
        else "Keep studying!"
    )
    return ScoreResponse(score=score, total=total, percentage=pct, grade=grade, results=results)
