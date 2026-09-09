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
    PublicImpactMetricsResponse,
    CategoryShare,
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

def get_public_impact_metrics(db: Session) -> PublicImpactMetricsResponse:
    # 1. Concerns Statistics
    total_concerns = (
        db.scalar(
            select(func.count(Concern.id)).where(Concern.is_deleted.is_(False))
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
    resolution_rate = (
        round((resolved_concerns / total_concerns) * 100, 1)
        if total_concerns > 0
        else 0.0
    )

    # 2. Collection Route Statistics
    total_routes = db.scalar(select(func.count(CollectionRoute.id))) or 0
    completed_routes = (
        db.scalar(
            select(func.count(CollectionRoute.id)).where(
                CollectionRoute.status == RouteStatus.COMPLETED
            )
        )
        or 0
    )
    route_efficiency = (
        round((completed_routes / total_routes) * 100, 1)
        if total_routes > 0
        else 0.0
    )

    # 3. Bin Operational Health Rate
    total_bins = db.scalar(select(func.count(WasteBin.id))) or 0
    active_bins = (
        db.scalar(
            select(func.count(WasteBin.id)).where(
                WasteBin.status == WasteBinStatus.ACTIVE
            )
        )
        or 0
    )
    bin_health_rate = (
        round((active_bins / total_bins) * 100, 1) if total_bins > 0 else 0.0
    )

    # 4. Solved Issues Distribution by Category
    category_rows = db.execute(
        select(Concern.category, func.count(Concern.id))
        .where(
            Concern.is_deleted.is_(False),
            Concern.status == ConcernStatus.RESOLVED,
        )
        .group_by(Concern.category)
    ).all()

    category_sum = sum(count for _, count in category_rows) or 1
    category_distribution = [
        CategoryShare(
            category=str(cat).replace("_", " ").title(),
            percentage=round((count / category_sum) * 100, 1),
        )
        for cat, count in category_rows
    ]

    # 5. Dynamic Environmental Indicators
    fuel_saved = (
        round((completed_routes / total_routes) * 35.0, 1)
        if total_routes > 0
        else 0.0
    )

    co2_reduction = (
        round(
            (
                (route_efficiency * 0.6)
                + (
                    (min(resolved_concerns, 100) / 100 * 100) * 0.4
                    if total_concerns > 0
                    else 0.0
                )
            )
            * 0.45,
            1,
        )
        if (total_routes > 0 or total_concerns > 0)
        else 0.0
    )

    landfill_diversion = (
        round(
            (
                (bin_health_rate * 0.5)
                + (
                    (resolved_concerns / total_concerns * 100) * 0.5
                    if total_concerns > 0
                    else 0.0
                )
            )
            * 0.75,
            1,
        )
        if (total_bins > 0 or total_concerns > 0)
        else 0.0
    )

    return PublicImpactMetricsResponse(
        resolution_rate=resolution_rate,
        total_resolved=resolved_concerns,
        route_efficiency_rate=route_efficiency,
        bin_health_rate=bin_health_rate,
        co2_reduction_percentage=co2_reduction,
        landfill_diversion_percentage=landfill_diversion,
        fuel_saved_percentage=fuel_saved,
        category_distribution=category_distribution,
    )