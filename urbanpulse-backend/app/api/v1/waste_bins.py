from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.user import User, UserRole
from app.schemas.waste_bin import (
    WasteBinCreate,
    WasteBinFillLevelUpdate,
    WasteBinResponse,
    WasteBinUpdate,
)
from app.services import waste_bin_service


router = APIRouter(
    prefix="/waste-bins",
    tags=["Waste Bins"],
)


@router.post(
    "",
    response_model=WasteBinResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_waste_bin(
    bin_data: WasteBinCreate,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    try:
        return waste_bin_service.create_waste_bin(
            db=db,
            bin_code=bin_data.bin_code,
            latitude=bin_data.latitude,
            longitude=bin_data.longitude,
            capacity=bin_data.capacity,
            fill_level=bin_data.fill_level,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )


@router.get(
    "",
    response_model=list[WasteBinResponse],
)
def get_waste_bins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in {
        UserRole.ADMIN,
        UserRole.WORKER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view waste bins",
        )

    return waste_bin_service.get_all_waste_bins(
        db=db,
    )


@router.get(
    "/{waste_bin_id}",
    response_model=WasteBinResponse,
)
def get_waste_bin(
    waste_bin_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in {
        UserRole.ADMIN,
        UserRole.WORKER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view waste bins",
        )

    waste_bin = waste_bin_service.get_waste_bin_by_id(
        db=db,
        waste_bin_id=waste_bin_id,
    )

    if waste_bin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste bin not found",
        )

    return waste_bin_service.get_waste_bin_response(
        db=db,
        waste_bin=waste_bin,
    )


@router.patch(
    "/{waste_bin_id}",
    response_model=WasteBinResponse,
)
def update_waste_bin(
    waste_bin_id: UUID,
    bin_data: WasteBinUpdate,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    waste_bin = waste_bin_service.get_waste_bin_by_id(
        db=db,
        waste_bin_id=waste_bin_id,
    )

    if waste_bin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste bin not found",
        )

    try:
        return waste_bin_service.update_waste_bin(
            db=db,
            waste_bin=waste_bin,
            bin_code=bin_data.bin_code,
            latitude=bin_data.latitude,
            longitude=bin_data.longitude,
            capacity=bin_data.capacity,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )


@router.patch(
    "/{waste_bin_id}/fill-level",
    response_model=WasteBinResponse,
)
def update_waste_bin_fill_level(
    waste_bin_id: UUID,
    fill_data: WasteBinFillLevelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in {
        UserRole.ADMIN,
        UserRole.WORKER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update fill levels",
        )

    waste_bin = waste_bin_service.get_waste_bin_by_id(
        db=db,
        waste_bin_id=waste_bin_id,
    )

    if waste_bin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste bin not found",
        )

    try:
        return waste_bin_service.update_waste_bin_fill_level(
            db=db,
            waste_bin=waste_bin,
            fill_level=fill_data.fill_level,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{waste_bin_id}/activate",
    response_model=WasteBinResponse,
)
def activate_waste_bin(
    waste_bin_id: UUID,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    waste_bin = waste_bin_service.get_waste_bin_by_id(
        db=db,
        waste_bin_id=waste_bin_id,
    )

    if waste_bin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste bin not found",
        )

    try:
        return waste_bin_service.activate_waste_bin(
            db=db,
            waste_bin=waste_bin,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{waste_bin_id}/deactivate",
    response_model=WasteBinResponse,
)
def deactivate_waste_bin(
    waste_bin_id: UUID,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    waste_bin = waste_bin_service.get_waste_bin_by_id(
        db=db,
        waste_bin_id=waste_bin_id,
    )

    if waste_bin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste bin not found",
        )

    try:
        return waste_bin_service.deactivate_waste_bin(
            db=db,
            waste_bin=waste_bin,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )