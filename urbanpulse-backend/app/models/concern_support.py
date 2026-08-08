from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConcernSupport(Base):
    __tablename__ = "concern_supports"

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

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    # Relationships
    concern: Mapped["Concern"] = relationship(
        "Concern",
        back_populates="supports",
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="concern_supports",
    )