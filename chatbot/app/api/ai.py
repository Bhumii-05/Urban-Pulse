from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.api.dependencies import (
    get_complaint_service,
    get_rag_service,
)
from app.rag.rag_service import RAGService
from app.schemas.ai import (
    AIAskRequest,
    AIAskResponse,
)
from app.schemas.complaint import (
    ComplaintResponse,
)
from app.services.complaint_service import ComplaintService

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

    return AIAskResponse(
        answer=result["answer"],
        sources=result["sources"],
    )


# ============================================================
# COMPLAINT ANALYSIS (TEXT + OPTIONAL IMAGE)
# ============================================================

@router.post(
    "/complaint",
    response_model=ComplaintResponse,
    operation_id="ai_analyze_complaint",
)
async def analyze_ai_complaint(
    complaint: str = Form(..., min_length=1),
    image: UploadFile | None = File(None),
    complaint_service: ComplaintService = Depends(get_complaint_service),
) -> ComplaintResponse:

    # --------------------------------------------------------
    # Validate whitespace-only complaints
    # --------------------------------------------------------

    clean_complaint = complaint.strip()
    if not clean_complaint:
        raise HTTPException(
            status_code=400,
            detail="Prompt cannot be empty.",
        )

    # --------------------------------------------------------
    # Read optional image payload safely
    # --------------------------------------------------------

    image_data = None
    mime_type = None

    if image is not None and image.filename:
        content = await image.read()
        if len(content) > 0:
            image_data = content
            mime_type = image.content_type or "image/jpeg"

    # --------------------------------------------------------
    # Analyze complaint (multimodal or text-only)
    # --------------------------------------------------------

    try:
        result = complaint_service.analyze(
            complaint=clean_complaint,
            image_data=image_data,
            mime_type=mime_type,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    # --------------------------------------------------------
    # Return validated response
    # --------------------------------------------------------

    return ComplaintResponse(
        category=result["category"],
        severity=result["severity"],
        description=result["description"],
        recommended_action=result["recommended_action"],
        confidence=result["confidence"],
    )