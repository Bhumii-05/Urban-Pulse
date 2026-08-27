from geoalchemy2 import Geography
from geoalchemy2.functions import (
    ST_Distance,
    ST_DWithin,
    ST_X,
    ST_Y,
)
from sqlalchemy import cast, select
from sqlalchemy.orm import Session

from app.models.collection_point import CollectionPoint
from app.models.concern import Concern
from app.models.waste_bin import (
    WasteBin,
    WasteBinStatus,
)
from app.utils.geo_utils import create_point


def _geography(column):
    return cast(
        column,
        Geography(
            geometry_type="POINT",
            srid=4326,
        ),
    )


def _user_geography(
    latitude: float,
    longitude: float,
):
    return _geography(
        create_point(
            latitude=latitude,
            longitude=longitude,
        )
    )


def get_nearby_waste_bins(
    db: Session,
    latitude: float,
    longitude: float,
    radius: float,
):
    user_point = _user_geography(
        latitude=latitude,
        longitude=longitude,
    )

    bin_location = _geography(
        WasteBin.location
    )

    distance = ST_Distance(
        bin_location,
        user_point,
    )

    query = (
        select(
            WasteBin.id,
            WasteBin.bin_code,
            ST_Y(WasteBin.location).label(
                "latitude"
            ),
            ST_X(WasteBin.location).label(
                "longitude"
            ),
            WasteBin.capacity,
            WasteBin.fill_level,
            WasteBin.status,
            distance.label(
                "distance_meters"
            ),
        )
        .where(
            WasteBin.status
            == WasteBinStatus.ACTIVE,
            ST_DWithin(
                bin_location,
                user_point,
                radius,
            ),
        )
        .order_by(distance)
    )

    results = db.execute(query).all()

    return [
        {
            "id": row.id,
            "bin_code": row.bin_code,
            "latitude": float(row.latitude),
            "longitude": float(row.longitude),
            "capacity": row.capacity,
            "fill_level": row.fill_level,
            "status": row.status.value,
            "distance_meters": round(
                float(row.distance_meters),
                2,
            ),
        }
        for row in results
    ]


def get_nearby_concerns(
    db: Session,
    latitude: float,
    longitude: float,
    radius: float,
):
    user_point = _user_geography(
        latitude=latitude,
        longitude=longitude,
    )

    concern_location = _geography(
        Concern.location
    )

    distance = ST_Distance(
        concern_location,
        user_point,
    )

    query = (
        select(
            Concern.id,
            Concern.category,
            Concern.description,
            ST_Y(Concern.location).label(
                "latitude"
            ),
            ST_X(Concern.location).label(
                "longitude"
            ),
            Concern.status,
            Concern.priority,
            distance.label(
                "distance_meters"
            ),
        )
        .where(
            Concern.is_deleted.is_(False),
            ST_DWithin(
                concern_location,
                user_point,
                radius,
            ),
        )
        .order_by(distance)
    )

    results = db.execute(query).all()

    return [
        {
            "id": row.id,
            "category": row.category,
            "description": row.description,
            "latitude": float(row.latitude),
            "longitude": float(row.longitude),
            "status": row.status.value,
            "priority": row.priority.value,
            "distance_meters": round(
                float(row.distance_meters),
                2,
            ),
        }
        for row in results
    ]


def get_nearby_collection_points(
    db: Session,
    latitude: float,
    longitude: float,
    radius: float,
):
    user_point = _user_geography(
        latitude=latitude,
        longitude=longitude,
    )

    collection_point_location = _geography(
        CollectionPoint.location
    )

    distance = ST_Distance(
        collection_point_location,
        user_point,
    )

    query = (
        select(
            CollectionPoint.id,
            CollectionPoint.route_id,
            CollectionPoint.waste_bin_id,
            ST_Y(
                CollectionPoint.location
            ).label("latitude"),
            ST_X(
                CollectionPoint.location
            ).label("longitude"),
            CollectionPoint.sequence_order,
            CollectionPoint.status,
            distance.label(
                "distance_meters"
            ),
        )
        .where(
            ST_DWithin(
                collection_point_location,
                user_point,
                radius,
            ),
        )
        .order_by(distance)
    )

    results = db.execute(query).all()

    return [
        {
            "id": row.id,
            "route_id": row.route_id,
            "waste_bin_id": row.waste_bin_id,
            "latitude": float(row.latitude),
            "longitude": float(row.longitude),
            "sequence_order": row.sequence_order,
            "status": row.status,
            "distance_meters": round(
                float(row.distance_meters),
                2,
            ),
        }
        for row in results
    ]