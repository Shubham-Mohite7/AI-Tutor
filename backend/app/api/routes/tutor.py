import asyncio
import logging
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import LearnRequest, LearnResponse, ScoreRequest, ScoreResponse
from app.services import ai_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/learn", response_model=LearnResponse)
async def learn(req: LearnRequest):
    """
    One-shot: generates explanation + 10-question quiz.
    Runs two sequential LLM calls in a thread pool (non-blocking).
    Expected duration: 30–60 s.
    """
    try:
        explanation, explain_tokens = await asyncio.to_thread(
            ai_service.explain_topic, req.topic, req.language
        )
        questions, quiz_tokens = await asyncio.to_thread(
            ai_service.generate_quiz, req.topic, explanation
        )
        return LearnResponse(
            topic=req.topic,
            language=req.language,
            explanation=explanation,
            questions=questions,
            total_reasoning_tokens=explain_tokens + quiz_tokens,
        )
    except Exception as exc:
        logger.error("learn error: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))


@router.post("/score", response_model=ScoreResponse)
async def score(req: ScoreRequest):
    """
    Score a completed quiz. No LLM call — instant.
    """
    if len(req.answers) != len(req.quiz):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"answers length {len(req.answers)} != quiz length {len(req.quiz)}",
        )
    try:
        return ai_service.score_quiz(req.quiz, req.answers)
    except Exception as exc:
        logger.error("score error: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
