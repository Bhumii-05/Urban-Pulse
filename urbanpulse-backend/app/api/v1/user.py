from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.user import User, UserRole
from app.schemas.user import UserResponse
from app.services.user_service import get_users

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