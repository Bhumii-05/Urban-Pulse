from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.concern import Concern, ConcernStatus
from app.models.suggestion import Suggestion
from app.models.user import User, UserRole
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    WorkerAnalyticsResponse,
)


def get_overview(db: Session) -> AnalyticsOverviewResponse:
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

    total_suggestions = db.scalar(select(func.count(Suggestion.id))) or 0

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
        select(User).where(User.role == UserRole.WORKER).order_by(User.id)
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
                    Assignment.status == AssignmentStatus.COMPLETED,
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
