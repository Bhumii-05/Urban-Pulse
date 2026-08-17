from fastapi import Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole

# implementing rbac
def require_role(required_role: UserRole):
    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

        return current_user

    return role_checker
