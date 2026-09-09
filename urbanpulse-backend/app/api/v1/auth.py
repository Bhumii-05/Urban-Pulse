from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.services.auth_services import (
    authenticate_user,
    create_user_tokens,
    register_user,
    refresh_user_tokens,
    revoke_user_refresh_token,
)
from app.services.email_service import (
    send_password_reset_email,
    send_password_reset_success_email,
)
from app.services.password_reset_service import (
    create_password_reset_token,
    reset_user_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# =========================
# REGISTER
# =========================

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        user = register_user(db, user_data)

        return {
            "message": "User registered successfully",
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,
        }

    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        login_data.email,
        login_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token, refresh_token = create_user_tokens(
        db,
        user,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
        },
    }


# =========================
# REFRESH TOKEN
# =========================

@router.post("/refresh")
def refresh(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        access_token, refresh_token = refresh_user_tokens(
            db,
            data.refresh_token,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(err),
        )


# =========================
# LOGOUT
# =========================

@router.post("/logout")
def logout(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    revoke_user_refresh_token(
        db,
        data.refresh_token,
    )

    return {
        "detail": "Logged out successfully"
    }


# =========================
# CURRENT USER
# =========================

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
    }


# =========================
# FORGOT PASSWORD
# =========================

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user, raw_token = create_password_reset_token(
        db,
        data.identifier,
    )

    # Always return the same response so that
    # account existence is not revealed.
    if user and raw_token:
        await send_password_reset_email(
            to_email=user.email,
            user_name=user.full_name,
            raw_token=raw_token,
        )

    return {
        "detail": "If an account matches that email or phone number, a password reset link has been sent."
    }


# =========================
# RESET PASSWORD
# =========================

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    try:
        user = reset_user_password(
            db,
            data.token,
            data.new_password,
        )

        # Send confirmation email after successful reset
        await send_password_reset_success_email(
            to_email=user.email,
            user_name=user.full_name,
        )

        return {
            "detail": "Password has been successfully reset."
        }

    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )