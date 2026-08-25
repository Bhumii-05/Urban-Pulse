from datetime import date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.collection_point import CollectionPoint
from app.models.collection_route import CollectionRoute
from app.models.concern import Concern, ConcernStatus
from app.models.notification import Notification
from app.models.user import User, UserRole
from app.schemas.dashboard import (
    AdminDashboardResponse,
    CollectionProgressResponse,
    WorkerDashboardResponse,
    WorkerRouteResponse,
    CitizenDashboardResponse,
)

from app.models.suggestion import Suggestion


def get_admin_dashboard(db: Session) -> AdminDashboardResponse:
    total_users = db.scalar(select(func.count(User.id))) or 0

    total_workers = (
        db.scalar(select(func.count(User.id)).where(User.role == UserRole.WORKER)) or 0
    )

    total_concerns = (
        db.scalar(select(func.count(Concern.id)).where(Concern.is_deleted.is_(False)))
        or 0
    )

    pending_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.is_deleted.is_(False),
                Concern.status.in_(
                    [
                        ConcernStatus.OPEN,
                        ConcernStatus.IN_PROGRESS,
                    ]
                ),
            )
        )
        or 0
    )

    resolved_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.is_deleted.is_(False),
                Concern.status == ConcernStatus.RESOLVED,
            )
        )
        or 0
    )

    today = date.today()

    start_of_day = datetime.combine(
        today,
        time.min,
    )

    start_of_next_day = start_of_day + timedelta(days=1)

    todays_collections = (
        db.scalar(
            select(func.count(CollectionPoint.id)).where(
                CollectionPoint.collected_at >= start_of_day,
                CollectionPoint.collected_at < start_of_next_day,
            )
        )
        or 0
    )

    return AdminDashboardResponse(
        total_users=total_users,
        total_workers=total_workers,
        total_concerns=total_concerns,
        pending_concerns=pending_concerns,
        resolved_concerns=resolved_concerns,
        todays_collections=todays_collections,
        most_reported_area=None,
    )


def get_worker_dashboard(
    db: Session,
    worker_id: int,
) -> WorkerDashboardResponse:

    today = date.today()

    start_of_day = datetime.combine(
        today,
        time.min,
    )

    start_of_next_day = start_of_day + timedelta(days=1)

    # Get today's route for this worker.
    route = db.scalar(
        select(CollectionRoute)
        .where(
            CollectionRoute.worker_id == worker_id,
            CollectionRoute.route_date >= start_of_day,
            CollectionRoute.route_date < start_of_next_day,
        )
        .order_by(CollectionRoute.route_date.asc())
    )

    today_route = None

    if route is not None:
        today_route = WorkerRouteResponse(
            id=route.id,
            route_name=route.route_name,
            route_date=route.route_date.isoformat(),
            status=route.status.value,
        )

    # Pending worker assignments.
    pending_assignments = (
        db.scalar(
            select(func.count(Assignment.id)).where(
                Assignment.worker_id == worker_id,
                Assignment.status.in_(
                    [
                        AssignmentStatus.PENDING,
                        AssignmentStatus.ASSIGNED,
                        AssignmentStatus.IN_PROGRESS,
                    ]
                ),
            )
        )
        or 0
    )

    # Completed worker assignments.
    completed_assignments = (
        db.scalar(
            select(func.count(Assignment.id)).where(
                Assignment.worker_id == worker_id,
                Assignment.status == AssignmentStatus.COMPLETED,
            )
        )
        or 0
    )

    # Collection points belonging to today's route.
    if route is not None:
        total_points = (
            db.scalar(
                select(func.count(CollectionPoint.id)).where(
                    CollectionPoint.route_id == route.id
                )
            )
            or 0
        )

        completed_points = (
            db.scalar(
                select(func.count(CollectionPoint.id)).where(
                    CollectionPoint.route_id == route.id,
                    CollectionPoint.status == "collected",
                )
            )
            or 0
        )
    else:
        total_points = 0
        completed_points = 0

    collection_progress = CollectionProgressResponse(
        total=total_points,
        completed=completed_points,
    )

    # Unread notifications.
    unread_notifications = (
        db.scalar(
            select(func.count(Notification.id)).where(
                Notification.recipient_id == worker_id,
                Notification.is_read.is_(False),
            )
        )
        or 0
    )

    return WorkerDashboardResponse(
        today_route=today_route,
        pending_assignments=pending_assignments,
        completed_assignments=completed_assignments,
        collection_progress=collection_progress,
        unread_notifications=unread_notifications,
    )


def get_citizen_dashboard(
    db: Session,
    citizen_id: int,
) -> CitizenDashboardResponse:

    total_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.reported_by == citizen_id,
                Concern.is_deleted.is_(False),
            )
        )
        or 0
    )

    pending_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.reported_by == citizen_id,
                Concern.is_deleted.is_(False),
                Concern.status.in_(
                    [
                        ConcernStatus.OPEN,
                        ConcernStatus.IN_PROGRESS,
                    ]
                ),
            )
        )
        or 0
    )

    resolved_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.reported_by == citizen_id,
                Concern.is_deleted.is_(False),
                Concern.status == ConcernStatus.RESOLVED,
            )
        )
        or 0
    )

    total_suggestions = (
        db.scalar(
            select(func.count(Suggestion.id)).where(
                Suggestion.submitted_by == citizen_id,
            )
        )
        or 0
    )

    unread_notifications = (
        db.scalar(
            select(func.count(Notification.id)).where(
                Notification.recipient_id == citizen_id,
                Notification.is_read.is_(False),
            )
        )
        or 0
    )

    return CitizenDashboardResponse(
        total_concerns=total_concerns,
        pending_concerns=pending_concerns,
        resolved_concerns=resolved_concerns,
        total_suggestions=total_suggestions,
        unread_notifications=unread_notifications,
    )
