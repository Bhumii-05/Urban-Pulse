from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.concern import ConcernStatus


class ConcernHistory(Base):
    __tablename__ = "concern_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    concern_id: Mapped[int] = mapped_column(
        ForeignKey("concerns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    changed_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    old_status: Mapped[ConcernStatus | None] = mapped_column(
        Enum(ConcernStatus),
        nullable=True,
    )

    new_status: Mapped[ConcernStatus] = mapped_column(
        Enum(ConcernStatus),
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships
    concern: Mapped["Concern"] = relationship(
        "Concern",
        back_populates="history",
    )

    changed_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="concern_histories",
    )