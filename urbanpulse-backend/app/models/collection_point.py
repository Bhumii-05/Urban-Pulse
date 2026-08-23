from __future__ import annotations

import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CollectionPoint(Base):
    __tablename__ = "collection_points"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    route_id: Mapped[int] = mapped_column(
        ForeignKey("collection_routes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    waste_bin_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("waste_bins.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    location: Mapped[object] = mapped_column(
        Geometry(
            geometry_type="POINT",
            srid=4326,
            spatial_index=True,
        ),
        nullable=False,
    )

    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False,
        index=True,
    )

    collected_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    # Relationships
    route: Mapped["CollectionRoute"] = relationship(
        "CollectionRoute",
        back_populates="collection_points",
    )

    waste_bin: Mapped["WasteBin"] = relationship(
        "WasteBin",
        back_populates="collection_points",
    )