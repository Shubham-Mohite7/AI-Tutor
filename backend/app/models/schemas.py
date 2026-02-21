from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field


# ── Enums / literals ──────────────────────────────────────────────────────────

Language = Literal["en", "hi"]


# ── Request models ────────────────────────────────────────────────────────────

class LearnRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=300)
    language: Language = "en"


class ScoreRequest(BaseModel):
    quiz: list[dict]
    answers: list[str | None]


# ── Shared sub-models ─────────────────────────────────────────────────────────

class QuizQuestion(BaseModel):
    type: Literal["mcq", "tf"]
    question: str
    options: list[str]
    correct: str
    explanation: str


class QuestionResult(BaseModel):
    question_number: int
    question: str
    is_correct: bool
    user_answer: str | None
    correct_answer: str
    explanation: str


# ── Response models ───────────────────────────────────────────────────────────

class LearnResponse(BaseModel):
    topic: str
    language: str
    explanation: str
    questions: list[QuizQuestion]
    total_reasoning_tokens: int


class ScoreResponse(BaseModel):
    score: int
    total: int
    percentage: float
    grade: str
    results: list[QuestionResult]
