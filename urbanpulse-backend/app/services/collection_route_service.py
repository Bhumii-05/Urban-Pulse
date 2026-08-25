from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.collection_point import CollectionPoint
from app.models.collection_route import (
    CollectionRoute,
    RouteStatus,
)
from app.models.user import User, UserRole


def create_collection_route(
    db: Session,
    worker_id: int,
    route_name: str,
    route_date: datetime,
) -> CollectionRoute:
    worker = db.scalar(
        select(User).where(
            User.id == worker_id,
            User.role == UserRole.WORKER,
            User.is_active.is_(True),
        )
    )

    if worker is None:
        raise ValueError("Active worker not found")

    route = CollectionRoute(
        worker_id=worker_id,
        route_name=route_name,
        route_date=route_date,
        status=RouteStatus.ACTIVE,
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return route


def get_collection_route_by_id(
    db: Session,
    route_id: int,
) -> CollectionRoute | None:
    return db.scalar(
        select(CollectionRoute).where(
            CollectionRoute.id == route_id,
        )
    )


def get_all_collection_routes(
    db: Session,
) -> list[CollectionRoute]:
    return db.scalars(
        select(CollectionRoute).order_by(
            CollectionRoute.route_date.desc()
        )
    ).all()


def get_worker_collection_routes(
    db: Session,
    worker_id: int,
) -> list[CollectionRoute]:
    return db.scalars(
        select(CollectionRoute)
        .where(
            CollectionRoute.worker_id == worker_id,
        )
        .order_by(
            CollectionRoute.route_date.desc()
        )
    ).all()


def update_collection_route(
    db: Session,
    route: CollectionRoute,
    route_name: str | None,
    route_date: datetime | None,
) -> CollectionRoute:
    if route.status != RouteStatus.ACTIVE:
        raise ValueError(
            "Only active routes can be updated"
        )

    if route_name is not None:
        route.route_name = route_name

    if route_date is not None:
        route.route_date = route_date

    db.commit()
    db.refresh(route)

    return route


def update_collection_route_status(
    db: Session,
    route: CollectionRoute,
    new_status: RouteStatus,
) -> CollectionRoute:
    current_status = route.status

    allowed_transitions = {
        RouteStatus.ACTIVE: {
            RouteStatus.COMPLETED,
            RouteStatus.CANCELLED,
        },
        RouteStatus.COMPLETED: set(),
        RouteStatus.CANCELLED: set(),
    }

    if new_status == current_status:
        raise ValueError(
            "Route is already in the requested status"
        )

    if new_status not in allowed_transitions[current_status]:
        raise ValueError(
            f"Invalid status transition from "
            f"{current_status.value} to {new_status.value}"
        )

    if new_status == RouteStatus.COMPLETED:
        pending_point_exists = db.scalar(
            select(CollectionPoint.id)
            .where(
                CollectionPoint.route_id == route.id,
                CollectionPoint.status == "pending",
            )
            .limit(1)
        )

        if pending_point_exists is not None:
            raise ValueError(
                "Route cannot be completed while collection "
                "points are still pending"
            )

    route.status = new_status

    db.commit()
    db.refresh(route)

    return route