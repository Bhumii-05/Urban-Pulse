from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    WORKER = "worker"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    phone_number: Mapped[str] = mapped_column(
        String(15),
        unique=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        default=UserRole.CITIZEN,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    concerns: Mapped[list["Concern"]] = relationship(
        "Concern",
        back_populates="reporter",
        foreign_keys="Concern.reported_by",
    )

    concern_supports: Mapped[list["ConcernSupport"]] = relationship(
        "ConcernSupport",
        back_populates="user",
    )

    concern_histories: Mapped[list["ConcernHistory"]] = relationship(
        "ConcernHistory",
        back_populates="changed_by_user",
    )

    worker_assignments: Mapped[list["Assignment"]] = relationship(
        "Assignment",
        back_populates="worker",
        foreign_keys="Assignment.worker_id",
    )

    created_assignments: Mapped[list["Assignment"]] = relationship(
        "Assignment",
        back_populates="assigner",
        foreign_keys="Assignment.assigned_by",
    )

    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="recipient",
    )

    collection_routes: Mapped[list["CollectionRoute"]] = relationship(
        "CollectionRoute",
        back_populates="worker",
    )

    submitted_suggestions: Mapped[list["Suggestion"]] = relationship(
        "Suggestion",
        back_populates="submitter",
        foreign_keys="Suggestion.submitted_by",
    )

    reviewed_suggestions: Mapped[list["Suggestion"]] = relationship(
        "Suggestion",
        back_populates="reviewer",
        foreign_keys="Suggestion.reviewed_by",
    )