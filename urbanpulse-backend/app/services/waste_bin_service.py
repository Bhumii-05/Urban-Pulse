from __future__ import annotations

from uuid import UUID

from geoalchemy2.elements import WKTElement
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.waste_bin import (
    WasteBin,
    WasteBinStatus,
)


def _waste_bin_response(
    db: Session,
    waste_bin: WasteBin,
) -> dict:
    coordinates = db.execute(
        select(
            func.ST_Y(WasteBin.location),
            func.ST_X(WasteBin.location),
        ).where(
            WasteBin.id == waste_bin.id,
        )
    ).one()

    latitude, longitude = coordinates

    return {
        "id": waste_bin.id,
        "bin_code": waste_bin.bin_code,
        "latitude": float(latitude),
        "longitude": float(longitude),
        "capacity": float(waste_bin.capacity),
        "fill_level": float(waste_bin.fill_level),
        "status": waste_bin.status,
    }


def create_waste_bin(
    db: Session,
    bin_code: str,
    latitude: float,
    longitude: float,
    capacity: float,
    fill_level: float,
) -> dict:
    if fill_level > capacity:
        raise ValueError(
            "Fill level cannot be greater than bin capacity"
        )

    existing_bin = db.scalar(
        select(WasteBin).where(
            WasteBin.bin_code == bin_code,
        )
    )

    if existing_bin is not None:
        raise ValueError(
            "Waste bin with this bin code already exists"
        )

    waste_bin = WasteBin(
        bin_code=bin_code,
        location=WKTElement(
            f"POINT({longitude} {latitude})",
            srid=4326,
        ),
        capacity=capacity,
        fill_level=fill_level,
        status=WasteBinStatus.ACTIVE,
    )

    db.add(waste_bin)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError(
            "Waste bin with this bin code already exists"
        )

    db.refresh(waste_bin)

    return _waste_bin_response(
        db=db,
        waste_bin=waste_bin,
    )


def get_waste_bin_by_id(
    db: Session,
    waste_bin_id: UUID,
) -> WasteBin | None:
    return db.scalar(
        select(WasteBin).where(
            WasteBin.id == waste_bin_id,
        )
    )


def get_waste_bin_response(
    db: Session,
    waste_bin: WasteBin,
) -> dict:
    return _waste_bin_response(
        db=db,
        waste_bin=waste_bin,
    )


def get_all_waste_bins(
    db: Session,
) -> list[dict]:
    waste_bins = db.scalars(
        select(WasteBin).order_by(
            WasteBin.created_at.desc(),
        )
    ).all()

    return [
        _waste_bin_response(
            db=db,
            waste_bin=waste_bin,
        )
        for waste_bin in waste_bins
    ]


def update_waste_bin(
    db: Session,
    waste_bin: WasteBin,
    bin_code: str | None,
    latitude: float | None,
    longitude: float | None,
    capacity: float | None,
) -> dict:
    if bin_code is not None:
        existing_bin = db.scalar(
            select(WasteBin).where(
                WasteBin.bin_code == bin_code,
                WasteBin.id != waste_bin.id,
            )
        )

        if existing_bin is not None:
            raise ValueError(
                "Waste bin with this bin code already exists"
            )

        waste_bin.bin_code = bin_code

    if capacity is not None:
        if waste_bin.fill_level > capacity:
            raise ValueError(
                "New capacity cannot be less than current fill level"
            )

        waste_bin.capacity = capacity

    if latitude is not None or longitude is not None:
        current_coordinates = db.execute(
            select(
                func.ST_Y(WasteBin.location),
                func.ST_X(WasteBin.location),
            ).where(
                WasteBin.id == waste_bin.id,
            )
        ).one()

        current_latitude, current_longitude = current_coordinates

        new_latitude = (
            latitude
            if latitude is not None
            else float(current_latitude)
        )

        new_longitude = (
            longitude
            if longitude is not None
            else float(current_longitude)
        )

        waste_bin.location = WKTElement(
            f"POINT({new_longitude} {new_latitude})",
            srid=4326,
        )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError(
            "Waste bin with this bin code already exists"
        )

    db.refresh(waste_bin)

    return _waste_bin_response(
        db=db,
        waste_bin=waste_bin,
    )


def update_waste_bin_fill_level(
    db: Session,
    waste_bin: WasteBin,
    fill_level: float,
) -> dict:
    if fill_level > waste_bin.capacity:
        raise ValueError(
            "Fill level cannot be greater than bin capacity"
        )

    waste_bin.fill_level = fill_level

    db.commit()
    db.refresh(waste_bin)

    return _waste_bin_response(
        db=db,
        waste_bin=waste_bin,
    )


def activate_waste_bin(
    db: Session,
    waste_bin: WasteBin,
) -> dict:
    if waste_bin.status == WasteBinStatus.ACTIVE:
        raise ValueError(
            "Waste bin is already active"
        )

    waste_bin.status = WasteBinStatus.ACTIVE

    db.commit()
    db.refresh(waste_bin)

    return _waste_bin_response(
        db=db,
        waste_bin=waste_bin,
    )


def deactivate_waste_bin(
    db: Session,
    waste_bin: WasteBin,
) -> dict:
    if waste_bin.status == WasteBinStatus.INACTIVE:
        raise ValueError(
            "Waste bin is already inactive"
        )

    waste_bin.status = WasteBinStatus.INACTIVE

    db.commit()
    db.refresh(waste_bin)

    return _waste_bin_response(
        db=db,
        waste_bin=waste_bin,
    )