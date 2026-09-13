from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.complaint import ComplaintRequest, ComplaintResponse
from app.services.complaint_service import ComplaintService
from app.api.dependencies import get_complaint_service  # Adjust import path as needed

router = APIRouter(prefix="/ai", tags=["Complaint"])


@router.post("/complaint", response_model=ComplaintResponse)
def analyze_complaint(
    payload: ComplaintRequest,
    service: ComplaintService = Depends(get_complaint_service),
):
    try:
        return service.analyze(payload.complaint)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI processing failed: {str(e)}",
        )