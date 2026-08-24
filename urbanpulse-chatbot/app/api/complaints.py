from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_complaint_repository
from app.repositories.complaint_repository import ComplaintRepository
from app.schemas.complaint import (
    ComplaintListResponse,
    ComplaintResponse,
)

from app.api.dependencies import (
    get_complaint_repository,
    get_complaint_status_service,
)

from app.schemas.complaint import (
    ComplaintResponse,
    ComplaintStatusUpdateRequest,
)

from app.services.complaint_status_service import (
    ComplaintStatusService,
)


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
)


def _format_status(status_obj) -> str:
    """Helper to safely extract string value from status enum or string."""
    return status_obj.value if hasattr(status_obj, "value") else str(status_obj)


@router.get(
    "",
    response_model=ComplaintListResponse,
)
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
        )
        for complaint in complaints
    ]

    return ComplaintListResponse(
        complaints=results,
        total=len(results),
    )


@router.get(
    "/{complaint_id}",
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

@router.patch(
    "/{complaint_id}/status",
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
                status_code=404,
                detail=str(exc),
            ) from exc

        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc

    return ComplaintResponse(
        id=complaint.id,
        category=complaint.category,
        severity=complaint.severity,
        description=complaint.description,
        recommended_action=(
            complaint.recommended_action
        ),
        confidence=complaint.confidence,
        status=complaint.status.value,
    )