from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.collection_point import CollectionPoint
from app.models.collection_route import CollectionRoute, RouteStatus
from app.models.concern import (
    Concern,
    ConcernPriority,
    ConcernStatus,
)
from app.models.suggestion import Suggestion
from app.models.user import User, UserRole
from app.models.waste_bin import WasteBin, WasteBinStatus

from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    WorkerAnalyticsResponse,
    ConcernStatusAnalyticsResponse,
    ConcernCategoryAnalyticsResponse,
    ConcernPriorityAnalyticsResponse,
    RouteStatusAnalyticsResponse,
    CollectionPointAnalyticsResponse,
    WasteBinStatusAnalyticsResponse,
)


def get_overview(db: Session) -> AnalyticsOverviewResponse:
    total_users = (
        db.scalar(
            select(func.count(User.id))
        )
        or 0
    )

    total_workers = (
        db.scalar(
            select(func.count(User.id)).where(
                User.role == UserRole.WORKER
            )
        )
        or 0
    )

    total_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.is_deleted.is_(False)
            )
        )
        or 0
    )

    pending_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.status.in_(
                    [
                        ConcernStatus.OPEN,
                        ConcernStatus.IN_PROGRESS,
                    ]
                ),
                Concern.is_deleted.is_(False),
            )
        )
        or 0
    )

    resolved_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(
                Concern.status == ConcernStatus.RESOLVED,
                Concern.is_deleted.is_(False),
            )
        )
        or 0
    )

    total_suggestions = (
        db.scalar(
            select(func.count(Suggestion.id))
        )
        or 0
    )

    return AnalyticsOverviewResponse(
        total_users=total_users,
        total_workers=total_workers,
        total_concerns=total_concerns,
        pending_concerns=pending_concerns,
        resolved_concerns=resolved_concerns,
        total_suggestions=total_suggestions,
    )


def get_worker_analytics(
    db: Session,
) -> list[WorkerAnalyticsResponse]:

    workers = db.scalars(
        select(User)
        .where(User.role == UserRole.WORKER)
        .order_by(User.id)
    ).all()

    result = []

    for worker in workers:

        total_assignments = (
            db.scalar(
                select(func.count(Assignment.id)).where(
                    Assignment.worker_id == worker.id
                )
            )
            or 0
        )

        completed_assignments = (
            db.scalar(
                select(func.count(Assignment.id)).where(
                    Assignment.worker_id == worker.id,
                    Assignment.status
                    == AssignmentStatus.COMPLETED,
                )
            )
            or 0
        )

        pending_assignments = (
            db.scalar(
                select(func.count(Assignment.id)).where(
                    Assignment.worker_id == worker.id,
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

        result.append(
            WorkerAnalyticsResponse(
                worker_id=worker.id,
                worker_name=worker.full_name,
                total_assignments=total_assignments,
                completed_assignments=completed_assignments,
                pending_assignments=pending_assignments,
            )
        )

    return result


def get_concern_status_analytics(
    db: Session,
) -> list[ConcernStatusAnalyticsResponse]:

    rows = db.execute(
        select(
            Concern.status,
            func.count(Concern.id),
        )
        .where(
            Concern.is_deleted.is_(False)
        )
        .group_by(Concern.status)
        .order_by(Concern.status)
    ).all()

    return [
        ConcernStatusAnalyticsResponse(
            status=status.value,
            count=count,
        )
        for status, count in rows
    ]


def get_concern_category_analytics(
    db: Session,
) -> list[ConcernCategoryAnalyticsResponse]:

    rows = db.execute(
        select(
            Concern.category,
            func.count(Concern.id),
        )
        .where(
            Concern.is_deleted.is_(False)
        )
        .group_by(Concern.category)
        .order_by(Concern.category)
    ).all()

    return [
        ConcernCategoryAnalyticsResponse(
            category=category,
            count=count,
        )
        for category, count in rows
    ]


def get_concern_priority_analytics(
    db: Session,
) -> list[ConcernPriorityAnalyticsResponse]:

    rows = db.execute(
        select(
            Concern.priority,
            func.count(Concern.id),
        )
        .where(
            Concern.is_deleted.is_(False)
        )
        .group_by(Concern.priority)
        .order_by(Concern.priority)
    ).all()

    return [
        ConcernPriorityAnalyticsResponse(
            priority=priority.value,
            count=count,
        )
        for priority, count in rows
    ]


def get_route_status_analytics(
    db: Session,
) -> list[RouteStatusAnalyticsResponse]:

    rows = db.execute(
        select(
            CollectionRoute.status,
            func.count(CollectionRoute.id),
        )
        .group_by(CollectionRoute.status)
        .order_by(CollectionRoute.status)
    ).all()

    return [
        RouteStatusAnalyticsResponse(
            status=status.value,
            count=count,
        )
        for status, count in rows
    ]


def get_collection_point_analytics(
    db: Session,
) -> list[CollectionPointAnalyticsResponse]:

    rows = db.execute(
        select(
            CollectionPoint.status,
            func.count(CollectionPoint.id),
        )
        .group_by(CollectionPoint.status)
        .order_by(CollectionPoint.status)
    ).all()

    return [
        CollectionPointAnalyticsResponse(
            status=status,
            count=count,
        )
        for status, count in rows
    ]


def get_waste_bin_status_analytics(
    db: Session,
) -> list[WasteBinStatusAnalyticsResponse]:

    rows = db.execute(
        select(
            WasteBin.status,
            func.count(WasteBin.id),
        )
        .group_by(WasteBin.status)
        .order_by(WasteBin.status)
    ).all()

    return [
        WasteBinStatusAnalyticsResponse(
            status=status.value,
            count=count,
        )
        for status, count in rows
    ]