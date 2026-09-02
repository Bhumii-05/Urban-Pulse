import json

from fastapi import APIRouter, Depends

from app.api.dependencies import get_rag_service
from app.rag.rag_service import RAGService
from app.schemas.ai import (
    AIAskRequest,
    AIAskResponse,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


# ============================================================
# RAG / AI ASK
# ============================================================

@router.post(
    "/ask",
    response_model=AIAskResponse,
    operation_id="ai_ask_question",
)
def ask_ai(
    request: AIAskRequest,
    rag_service: RAGService = Depends(get_rag_service),
) -> AIAskResponse:

    result = rag_service.answer(request.question)

    raw_answer = result.get("answer", "")
    raw_sources = result.get("sources", [])
    raw_follow_ups = result.get("follow_up_questions", [])

    # Parse JSON string if the LLM returned escaped JSON
    clean_answer = raw_answer

    if isinstance(raw_answer, str):
        try:
            parsed_json = json.loads(raw_answer)

            if isinstance(parsed_json, dict) and "answer" in parsed_json:
                clean_answer = parsed_json["answer"]

        except (json.JSONDecodeError, TypeError):
            clean_answer = raw_answer

    # Deduplicate sources while preserving order
    unique_sources = []

    for source in raw_sources:
        if source not in unique_sources:
            unique_sources.append(source)

    return AIAskResponse(
        answer=clean_answer,
        follow_up_questions=raw_follow_ups,
        sources=unique_sources,
    )