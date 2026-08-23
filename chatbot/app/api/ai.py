import json
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

    raw_answer = result.get("answer", "")
    raw_sources = result.get("sources", [])

    # 1. Parse JSON string if LLM returned escaped JSON (e.g. {"answer": "..."})
    clean_answer = raw_answer
    if isinstance(raw_answer, str):
        try:
            parsed_json = json.loads(raw_answer)
            if isinstance(parsed_json, dict) and "answer" in parsed_json:
                clean_answer = parsed_json["answer"]
        except (json.JSONDecodeError, TypeError):
            clean_answer = raw_answer

    # 2. Deduplicate sources while preserving order
    unique_sources = []
    for source in raw_sources:
        if source not in unique_sources:
            unique_sources.append(source)

    return AIAskResponse(
        answer=clean_answer,
        sources=unique_sources,
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
            image_filename=image.filename if image else None,
        )
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

    # --------------------------------------------------------
    # Return validated response domain model
    # --------------------------------------------------------

    return ComplaintResponse(
        id=result.id,
        category=result.category,
        severity=result.severity,
        description=result.description,
        recommended_action=result.recommended_action,
        confidence=result.confidence,
        status=result.status.value if hasattr(result.status, "value") else str(result.status),
    )