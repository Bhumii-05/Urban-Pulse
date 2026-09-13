"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines the AI question-answering route that invokes the RAG service and returns the generated answer and retrieved sources.
"""
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


@router.post(
    "/ask",
    response_model=AIAskResponse,
)
def ask_ai(
    request: AIAskRequest,
    rag_service: RAGService = Depends(
        get_rag_service
    ),
) -> AIAskResponse:

    result = rag_service.answer(
        request.question
    )

    return AIAskResponse(
        answer=result["answer"],
        sources=result["sources"],
    )