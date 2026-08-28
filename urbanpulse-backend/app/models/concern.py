from __future__ import annotations

import enum
from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConcernStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class ConcernPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Concern(Base):
    __tablename__ = "concerns"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    reported_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    location: Mapped[object] = mapped_column(
        Geometry(
            geometry_type="POINT",
            srid=4326,
            spatial_index=True,
        ),
        nullable=False,
    )

    status: Mapped[ConcernStatus] = mapped_column(
        Enum(ConcernStatus),
        default=ConcernStatus.OPEN,
        nullable=False,
        index=True,
    )

    priority: Mapped[ConcernPriority] = mapped_column(
        Enum(ConcernPriority),
        default=ConcernPriority.MEDIUM,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
       DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    reporter: Mapped["User"] = relationship(
        "User",
        back_populates="concerns",
        foreign_keys=[reported_by],
    )

    images: Mapped[list["ConcernImage"]] = relationship(
        "ConcernImage",
        back_populates="concern",
        cascade="all, delete-orphan",
    )

    supports: Mapped[list["ConcernSupport"]] = relationship(
        "ConcernSupport",
        back_populates="concern",
        cascade="all, delete-orphan",
    )

    history: Mapped[list["ConcernHistory"]] = relationship(
        "ConcernHistory",
        back_populates="concern",
        cascade="all, delete-orphan",
    )

    assignments: Mapped[list["Assignment"]] = relationship(
        "Assignment",
        back_populates="concern",
        cascade="all, delete-orphan",
    )