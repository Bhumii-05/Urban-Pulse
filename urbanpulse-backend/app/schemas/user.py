from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    phone_number: str | None = Field(
        default=None,
        min_length=10,
        max_length=15,
    )


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(
        min_length=8,
        max_length=72,
    )


class AdminUserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=8, max_length=72)
    role: UserRole


class UserUpdateRequest(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    email: EmailStr | None = None
    phone_number: str | None = Field(
        default=None,
        min_length=10,
        max_length=15,
    )
    role: UserRole | None = None


class UserStatusUpdate(BaseModel):
    is_active: bool
