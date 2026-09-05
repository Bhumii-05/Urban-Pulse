import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.password_reset_token import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_password_reset_token(
    db: Session,
    identifier: str,
) -> tuple[User | None, str | None]:
    user = db.scalar(
        select(User).where(
            (User.email == identifier) | (User.phone_number == identifier)
        )
    )

    if not user or not user.is_active:
        return None, None

    # Invalidate existing active tokens for this user
    existing_tokens = db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used.is_(False),
        )
    ).all()
    for t in existing_tokens:
        t.used = True

    # Generate an unguessable 256-bit URL-safe token
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_token(raw_token)

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        used=False,
    )

    db.add(reset_record)
    db.commit()

    return user, raw_token


def reset_user_password(
    db: Session,
    raw_token: str,
    new_password: str,
) -> None:
    token_hash = hash_token(raw_token)

    record = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used.is_(False),
            PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
    )

    if not record:
        raise ValueError("Invalid or expired password reset token")

    user = db.scalar(select(User).where(User.id == record.user_id))
    if not user or not user.is_active:
        raise ValueError("User not found or inactive")

    # Update password and mark token used
    user.hashed_password = hash_password(new_password)
    record.used = True

    # Invalidate all active refresh tokens to force re-login everywhere
    db.execute(
        RefreshToken.__table__.update()
        .where(
            RefreshToken.user_id == user.id,
            RefreshToken.revoked.is_(False),
        )
        .values(revoked=True)
    )

    db.commit()