from typing import Optional
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
    Request,
)

from app.api.dependencies import (
    get_complaint_repository,
    get_complaint_service,
    get_complaint_status_service,
)
from app.repositories.complaint_repository import ComplaintRepository
from app.schemas.complaint import (
    ComplaintListResponse,
    ComplaintResponse,
    ComplaintStatusUpdateRequest,
)
from app.services.complaint_service import ComplaintService
from app.services.complaint_status_service import ComplaintStatusService

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
)


def _format_status(status_obj) -> str:
    """Helper to safely extract string value from status enum or string."""
    return status_obj.value if hasattr(status_obj, "value") else str(status_obj)


# ============================================================
# Create Complaint Route
# ============================================================
@router.post("", include_in_schema=False, status_code=status.HTTP_201_CREATED)
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ComplaintResponse,
)
async def create_complaint(
    request: Request,
    complaint: Optional[str] = Form(None),
    category: str = Form(...),
    severity: str = Form(...),
    description: str = Form(...),
    recommended_action: str = Form(...),
    confidence: str = Form(...),
    image: Optional[UploadFile] = File(None),
    service: ComplaintService = Depends(get_complaint_service),
) -> ComplaintResponse:
    
    # Extract raw form keys to verify field presence vs value content
    form_data = await request.form()
    
    # 1. Field key completely omitted -> 422 Unprocessable Content
    if "complaint" not in form_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Field 'complaint' is required.",
        )

    # 2. Key exists but value is empty "" or whitespace "   " -> 400 Bad Request
    if complaint is None or not complaint.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint text cannot be empty.",
        )

    # 3. Confidence numeric parsing & range validation -> 422
    try:
        conf_float = float(confidence)
        if conf_float < 0.0 or conf_float > 1.0:
            raise ValueError()
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Confidence score must be between 0.0 and 1.0.",
        )

    # 4. Extract optional image bytes
    image_data = None
    mime_type = None
    image_filename = None
    if image is not None:
        image_data = await image.read()
        mime_type = image.content_type
        image_filename = image.filename

    # 5. Delegate execution to service layer using .create(...) to match tests
    try:
        record = service.create(
            complaint=complaint,
            category=category,
            severity=severity,
            description=description,
            recommended_action=recommended_action,
            confidence=conf_float,
            image_data=image_data,
            mime_type=mime_type,
            image_filename=image_filename,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    # 6. Format returned response schema
    if isinstance(record, dict):
        return ComplaintResponse(
            id=record["id"],
            category=record["category"],
            severity=record["severity"],
            description=record["description"],
            recommended_action=record["recommended_action"],
            confidence=record["confidence"],
            status=_format_status(record["status"]),
            image_reference=record.get("image_reference"),
        )

    return ComplaintResponse(
        id=record.id,
        category=record.category,
        severity=record.severity,
        description=record.description,
        recommended_action=record.recommended_action,
        confidence=record.confidence,
        status=_format_status(record.status),
        image_reference=getattr(record, "image_reference", None),
    )


# ============================================================
# List Complaints Route
# ============================================================
@router.get("", response_model=ComplaintListResponse)
@router.get("/", response_model=ComplaintListResponse)
def list_complaints(
    repository: ComplaintRepository = Depends(get_complaint_repository),
) -> ComplaintListResponse:
    complaints = repository.list_all()

    results = [
        ComplaintResponse(
            id=complaint.id,
            category=complaint.category,
            severity=complaint.severity,
            description=complaint.description,
            recommended_action=complaint.recommended_action,
            confidence=complaint.confidence,
            status=_format_status(complaint.status),
            image_reference=getattr(complaint, "image_reference", None),
        ).model_dump()
        for complaint in complaints
    ]

    return ComplaintListResponse(
        complaints=results,
        total=len(results),
    )


# ============================================================
# Get Single Complaint Route
# ============================================================
@router.get("/{complaint_id}", include_in_schema=False)
@router.get(
    "/{complaint_id}/",
    response_model=ComplaintResponse,
)
def get_complaint(
    complaint_id: UUID,
    repository: ComplaintRepository = Depends(get_complaint_repository),
) -> ComplaintResponse:
    complaint = repository.get_by_id(complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found.",
        )

    return ComplaintResponse(
        id=complaint.id,
        category=complaint.category,
        severity=complaint.severity,
        description=complaint.description,
        recommended_action=complaint.recommended_action,
        confidence=complaint.confidence,
        status=_format_status(complaint.status),
    )


# ============================================================
# Update Status Route
# ============================================================
@router.patch("/{complaint_id}/status", include_in_schema=False)
@router.patch(
    "/{complaint_id}/status/",
    response_model=ComplaintResponse,
)
def update_complaint_status(
    complaint_id: UUID,
    request: ComplaintStatusUpdateRequest,
    status_service: ComplaintStatusService = Depends(
        get_complaint_status_service
    ),
) -> ComplaintResponse:
    try:
        complaint = status_service.update_status(
            complaint_id=complaint_id,
            new_status=request.status,
        )

    except ValueError as exc:
        if str(exc) == "Complaint not found.":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(exc),
            ) from exc

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return ComplaintResponse(
        id=complaint.id,
        category=complaint.category,
        severity=complaint.severity,
        description=complaint.description,
        recommended_action=complaint.recommended_action,
        confidence=complaint.confidence,
        status=_format_status(complaint.status),
    )