from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SuggestionStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class SuggestionType(str, enum.Enum):
    GENERAL = "general"
    WASTE_PICKUP = "waste_pickup"
    ADD_BIN = "add_bin"
    OTHER = "other"


class Suggestion(Base):
    __tablename__ = "suggestions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    submitted_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    suggestion_type: Mapped[SuggestionType] = mapped_column(
        Enum(SuggestionType),
        default=SuggestionType.GENERAL,
        nullable=False,
        index=True,
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    status: Mapped[SuggestionStatus] = mapped_column(
        Enum(SuggestionStatus),
        default=SuggestionStatus.PENDING,
        nullable=False,
        index=True,
    )

    admin_reply: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reviewed_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    submitter: Mapped["User"] = relationship(
        "User",
        back_populates="submitted_suggestions",
        foreign_keys=[submitted_by],
    )

    reviewer: Mapped["User | None"] = relationship(
        "User",
        back_populates="reviewed_suggestions",
        foreign_keys=[reviewed_by],
    )
