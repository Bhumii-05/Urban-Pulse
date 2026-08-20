from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.concern import ConcernStatus
from app.models.user import User
from app.schemas.concern import (
    ConcernCreate,
    ConcernHistoryResponse,
    ConcernResponse,
    ConcernStatusUpdate,
    ConcernUpdate,
)
from app.services import concern_service


router = APIRouter(
    prefix="/concerns",
    tags=["Concerns"],
)


@router.get("/health")
def concerns_health():
    return {
        "message": "Concern module is working"
    }


@router.get("/db-health")
def database_health(
    db: Session = Depends(get_db),
):
    from sqlalchemy import text

    result = db.execute(
        text("SELECT 1")
    )

    return {
        "database": "connected",
        "test_result": result.scalar(),
    }


@router.post(
    "/",
    response_model=ConcernResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_concern(
    concern_data: ConcernCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = concern_service.create_concern(
        db=db,
        concern_data=concern_data,
        reported_by=current_user.id,
    )

    return concern


@router.get(
    "/",
    response_model=list[ConcernResponse],
)
def get_concerns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return concern_service.get_concerns(db)


@router.get(
    "/{concern_id}",
    response_model=ConcernResponse,
)
def get_concern(
    concern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = concern_service.get_concern_by_id(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    return concern


@router.put(
    "/{concern_id}",
    response_model=ConcernResponse,
)
def update_concern(
    concern_id: int,
    concern_data: ConcernUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = concern_service.get_concern_by_id(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    if concern.reported_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own concerns",
        )

    return concern_service.update_concern(
        db=db,
        concern=concern,
        concern_data=concern_data,
    )


@router.delete(
    "/{concern_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_concern(
    concern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = concern_service.get_concern_by_id(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    if concern.reported_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own concerns",
        )

    concern_service.delete_concern(
        db=db,
        concern=concern,
    )

    return None


@router.patch(
    "/{concern_id}/status",
    response_model=ConcernResponse,
)
def update_concern_status(
    concern_id: int,
    status_data: ConcernStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = concern_service.get_concern_by_id(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    if current_user.role.value not in {"admin", "worker"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and workers can change concern status",
        )

    updated_concern = concern_service.update_concern_status(
        db=db,
        concern=concern,
        new_status=status_data.status,
        changed_by=current_user.id,
        remarks=status_data.remarks,
    )

    if updated_concern is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Concern is already in the requested status",
        )

    return updated_concern


@router.get(
    "/{concern_id}/history",
    response_model=list[ConcernHistoryResponse],
)
def get_concern_history(
    concern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = concern_service.get_concern_by_id(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    return concern_service.get_concern_history(
        db=db,
        concern_id=concern_id,
    )