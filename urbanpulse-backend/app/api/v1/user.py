from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.user import User, UserRole
from app.schemas.user import AdminUserCreate, UserResponse, UserUpdateRequest, UserStatusUpdate
from app.services.user_services import (
    create_admin_user,
    delete_user,
    get_user_by_id,
    get_users,
    update_user,
    update_user_status
)


router = APIRouter(
    prefix="/admin/users",
    tags=["User Management"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def get_all_users(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_users(db)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    user = get_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user_data: AdminUserCreate,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    try:
        return create_admin_user(db, user_data)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
)
def update_user_details(
    user_id: int,
    user_data: UserUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    try:
        user = update_user(
            db,
            user_id,
            user_data,
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return user

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
)
def update_user_status_route(
    user_id: int,
    status_data: UserStatusUpdate,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    user = update_user_status(
        db,
        user_id,
        status_data.is_active,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user

@router.delete(
    "/{user_id}",
    response_model=UserResponse,
)
def delete_user_route(
    user_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    user = delete_user(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user