from datetime import datetime
from uuid import UUID

from geoalchemy2.elements import WKTElement
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.collection_point import CollectionPoint
from app.models.collection_route import (
    CollectionRoute,
    RouteStatus,
)
from app.models.user import User
from app.models.waste_bin import (
    WasteBin,
    WasteBinStatus,
)


def _collection_point_response(
    db: Session,
    collection_point: CollectionPoint,
) -> dict:
    coordinates = db.execute(
        select(
            func.ST_Y(CollectionPoint.location),
            func.ST_X(CollectionPoint.location),
        ).where(
            CollectionPoint.id == collection_point.id,
        )
    ).one()

    latitude, longitude = coordinates

    return {
        "id": collection_point.id,
        "route_id": collection_point.route_id,
        "waste_bin_id": collection_point.waste_bin_id,
        "latitude": float(latitude),
        "longitude": float(longitude),
        "sequence_order": collection_point.sequence_order,
        "status": collection_point.status,
        "collected_at": collection_point.collected_at,
    }


def create_collection_point(
    db: Session,
    route_id: int,
    waste_bin_id: UUID,
    latitude: float,
    longitude: float,
    sequence_order: int,
) -> dict:
    route = db.scalar(
        select(CollectionRoute).where(
            CollectionRoute.id == route_id,
        )
    )

    if route is None:
        raise ValueError("Collection route not found")

    if route.status != RouteStatus.ACTIVE:
        raise ValueError(
            "Collection points can only be added to active routes"
        )

    waste_bin = db.scalar(
        select(WasteBin).where(
            WasteBin.id == waste_bin_id,
        )
    )

    if waste_bin is None:
        raise ValueError("Waste bin not found")

    if waste_bin.status != WasteBinStatus.ACTIVE:
        raise ValueError("Waste bin is inactive")

    existing_bin = db.scalar(
        select(CollectionPoint).where(
            CollectionPoint.route_id == route_id,
            CollectionPoint.waste_bin_id == waste_bin_id,
        )
    )

    if existing_bin is not None:
        raise ValueError(
            "Waste bin is already part of this collection route"
        )

    existing_sequence = db.scalar(
        select(CollectionPoint).where(
            CollectionPoint.route_id == route_id,
            CollectionPoint.sequence_order == sequence_order,
        )
    )

    if existing_sequence is not None:
        raise ValueError(
            "Sequence order is already used in this collection route"
        )

    collection_point = CollectionPoint(
        route_id=route_id,
        waste_bin_id=waste_bin_id,
        location=WKTElement(
            f"POINT({longitude} {latitude})",
            srid=4326,
        ),
        sequence_order=sequence_order,
        status="pending",
    )

    db.add(collection_point)
    db.commit()
    db.refresh(collection_point)

    return _collection_point_response(
        db=db,
        collection_point=collection_point,
    )


def get_collection_point_by_id(
    db: Session,
    point_id: int,
) -> CollectionPoint | None:
    return db.scalar(
        select(CollectionPoint).where(
            CollectionPoint.id == point_id,
        )
    )


def get_collection_point_response(
    db: Session,
    collection_point: CollectionPoint,
) -> dict:
    return _collection_point_response(
        db=db,
        collection_point=collection_point,
    )


def get_all_collection_points(
    db: Session,
) -> list[dict]:
    collection_points = db.scalars(
        select(CollectionPoint)
        .order_by(
            CollectionPoint.route_id,
            CollectionPoint.sequence_order,
        )
    ).all()

    return [
        _collection_point_response(
            db=db,
            collection_point=collection_point,
        )
        for collection_point in collection_points
    ]


def get_route_collection_points(
    db: Session,
    route_id: int,
) -> list[dict]:
    collection_points = db.scalars(
        select(CollectionPoint)
        .where(
            CollectionPoint.route_id == route_id,
        )
        .order_by(
            CollectionPoint.sequence_order,
        )
    ).all()

    return [
        _collection_point_response(
            db=db,
            collection_point=collection_point,
        )
        for collection_point in collection_points
    ]


def update_collection_point(
    db: Session,
    collection_point: CollectionPoint,
    latitude: float | None,
    longitude: float | None,
    sequence_order: int | None,
) -> CollectionPoint:
    if collection_point.status != "pending":
        raise ValueError(
            "Only pending collection points can be updated"
        )

    route = db.scalar(
        select(CollectionRoute).where(
            CollectionRoute.id == collection_point.route_id,
        )
    )

    if route is None:
        raise ValueError("Collection route not found")

    if route.status != RouteStatus.ACTIVE:
        raise ValueError(
            "Collection points can only be updated on active routes"
        )

    if latitude is not None or longitude is not None:
        current_coordinates = db.execute(
            select(
                func.ST_Y(CollectionPoint.location),
                func.ST_X(CollectionPoint.location),
            ).where(
                CollectionPoint.id == collection_point.id,
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

        collection_point.location = WKTElement(
            f"POINT({new_longitude} {new_latitude})",
            srid=4326,
        )

    if sequence_order is not None:
        existing_sequence = db.scalar(
            select(CollectionPoint).where(
                CollectionPoint.route_id
                == collection_point.route_id,
                CollectionPoint.sequence_order
                == sequence_order,
                CollectionPoint.id
                != collection_point.id,
            )
        )

        if existing_sequence is not None:
            raise ValueError(
                "Sequence order is already used in this collection route"
            )

        collection_point.sequence_order = sequence_order

    db.commit()
    db.refresh(collection_point)

    return collection_point


def mark_collection_point_collected(
    db: Session,
    collection_point: CollectionPoint,
    current_user: User,
) -> CollectionPoint:
    route = db.scalar(
        select(CollectionRoute).where(
            CollectionRoute.id == collection_point.route_id,
        )
    )

    if route is None:
        raise ValueError("Collection route not found")

    if route.worker_id != current_user.id:
        raise PermissionError(
            "You can only collect points from your own routes"
        )

    if route.status != RouteStatus.ACTIVE:
        raise ValueError(
            "Collection points can only be collected on active routes"
        )

    if collection_point.status == "collected":
        raise ValueError(
            "Collection point is already collected"
        )

    if collection_point.status != "pending":
        raise ValueError(
            "Collection point cannot be marked as collected"
        )

    collection_point.status = "collected"
    collection_point.collected_at = datetime.utcnow()

    # SessionLocal uses autoflush=False, so explicitly flush the
    # collection point update before checking for remaining pending points.
    db.flush()

    pending_point_exists = db.scalar(
        select(CollectionPoint.id)
        .where(
            CollectionPoint.route_id == route.id,
            CollectionPoint.status == "pending",
        )
        .limit(1)
    )

    if pending_point_exists is None:
        route.status = RouteStatus.COMPLETED

    db.commit()
    db.refresh(collection_point)

    return collection_point