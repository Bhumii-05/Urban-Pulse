from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)

from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest
from app.models.refresh_token import RefreshToken


def register_user(
    db: Session,
    user_data: RegisterRequest,
) -> User:
    existing_user = db.scalar(select(User).where(User.email == user_data.email))

    if existing_user:
        raise ValueError("Email already registered")

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone_number=user_data.phone_number,
        hashed_password=hash_password(user_data.password),
        role=UserRole.CITIZEN,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = db.scalar(select(User).where(User.email == email))

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_user_tokens(
    db: Session,
    user: User,
) -> tuple[str, str]:
    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role.value,
        }
    )

    refresh_token = create_refresh_token()

    refresh_token_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )

    db.add(refresh_token_record)
    db.commit()

    return access_token, refresh_token


def refresh_user_tokens(
    db: Session,
    raw_refresh_token: str,
) -> tuple[str, str]:
    token_hash = hash_refresh_token(raw_refresh_token)

    record = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked.is_(False),
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
    )

    if not record:
        raise ValueError("Invalid or expired refresh token")

    user = db.scalar(select(User).where(User.id == record.user_id))

    if not user or not user.is_active:
        raise ValueError("User not found or inactive")

    # Rotate the refresh token
    record.revoked = True

    new_access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role.value,
        }
    )

    new_refresh_token = create_refresh_token()

    new_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(new_refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )

    db.add(new_record)
    db.commit()

    return new_access_token, new_refresh_token


def revoke_user_refresh_token(
    db: Session,
    raw_refresh_token: str,
) -> None:
    token_hash = hash_refresh_token(raw_refresh_token)

    record = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked.is_(False),
        )
    )

    if record:
        record.revoked = True
        db.commit()
