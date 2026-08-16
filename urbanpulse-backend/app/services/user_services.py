from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.refresh_token import RefreshToken
from app.models.user import User, UserRole
from app.schemas.user import AdminUserCreate, UserUpdateRequest
from app.schemas.user import (
    ChangePasswordRequest,
    ProfileUpdateRequest,
)

# for all users listing


def get_users(db: Session) -> list[User]:
    return db.scalars(select(User)).all()


# for getting user by id


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    return db.scalar(select(User).where(User.id == user_id))


def create_admin_user(
    db: Session,
    user_data: AdminUserCreate,
) -> User:
    existing_user = db.scalar(
        select(User).where(
            (User.email == user_data.email)
            | (User.phone_number == user_data.phone_number)
        )
    )

    if existing_user:
        raise ValueError("Email or phone number already registered")

    if user_data.role not in {
        UserRole.WORKER,
        UserRole.ADMIN,
    }:
        raise ValueError("Admin can only create Worker or Admin accounts")

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone_number=user_data.phone_number,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user(
    db: Session,
    user_id: int,
    user_data: UserUpdateRequest,
) -> User | None:
    user = get_user_by_id(db, user_id)

    if user is None:
        return None

    if user_data.email is not None:
        existing_user = db.scalar(
            select(User).where(
                User.email == user_data.email,
                User.id != user_id,
            )
        )

        if existing_user:
            raise ValueError("Email already registered")

        user.email = user_data.email

    if user_data.phone_number is not None:
        existing_user = db.scalar(
            select(User).where(
                User.phone_number == user_data.phone_number,
                User.id != user_id,
            )
        )

        if existing_user:
            raise ValueError("Phone number already registered")

        user.phone_number = user_data.phone_number

    if user_data.full_name is not None:
        user.full_name = user_data.full_name

    if user_data.role is not None:
        if user_data.role == UserRole.CITIZEN:
            raise ValueError("Admin user management cannot assign the citizen role")

        user.role = user_data.role

    db.commit()
    db.refresh(user)

    return user


def update_user_status(
    db: Session,
    user_id: int,
    is_active: bool,
) -> User | None:
    user = get_user_by_id(db, user_id)

    if user is None:
        return None

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user


def delete_user(
    db: Session,
    user_id: int,
) -> User | None:
    user = get_user_by_id(db, user_id)

    if user is None:
        return None

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


def update_user_profile(
    db: Session,
    user: User,
    profile_data: ProfileUpdateRequest,
) -> User:
    if profile_data.full_name is not None:
        user.full_name = profile_data.full_name

    if profile_data.phone_number is not None:
        existing_user = db.scalar(
            select(User).where(
                User.phone_number == profile_data.phone_number,
                User.id != user.id,
            )
        )

        if existing_user:
            raise ValueError("Phone number already registered")

        user.phone_number = profile_data.phone_number

    db.commit()
    db.refresh(user)

    return user


def change_user_password(
    db: Session,
    user: User,
    password_data: ChangePasswordRequest,
) -> None:
    if not verify_password(
        password_data.current_password,
        user.hashed_password,
    ):
        raise ValueError("Current password is incorrect")

    if password_data.current_password == password_data.new_password:
        raise ValueError("New password must be different from current password")

    user.hashed_password = hash_password(password_data.new_password)

    # Invalidate all existing refresh tokens.
    db.execute(
        RefreshToken.__table__.update()
        .where(
            RefreshToken.user_id == user.id,
            RefreshToken.revoked.is_(False),
        )
        .values(revoked=True)
    )

    db.commit()
