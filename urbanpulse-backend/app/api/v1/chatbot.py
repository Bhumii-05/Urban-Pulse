from fastapi import APIRouter, HTTPException

from app.schemas.chatbot import (
    ChatbotAskRequest,
    ChatbotAskResponse,
)
from app.services.chatbot_service import ChatbotService


router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"],
)


@router.post(
    "/ask",
    response_model=ChatbotAskResponse,
    operation_id="chatbot_ask",
)
def ask_chatbot(
    request: ChatbotAskRequest,
) -> ChatbotAskResponse:
    """
    Forward a user's question to the UrbanPulse
    chatbot AI service.
    """

    service = ChatbotService()

    try:
        result = service.ask(request.question)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    return ChatbotAskResponse(
        answer=result["answer"],
        sources=result["sources"],
    )