from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.concern import Concern
from app.models.notification import NotificationType
from app.models.user import User, UserRole
from app.services.notification_services import create_notification


def create_assignment(
    db: Session,
    concern_id: int,
    worker_id: int,
    assigned_by: int,
) -> Assignment:
    concern = db.scalar(
        select(Concern).where(
            Concern.id == concern_id,
            Concern.is_deleted.is_(False),
        )
    )

    if concern is None:
        raise ValueError("Concern not found")

    worker = db.scalar(
        select(User).where(
            User.id == worker_id,
            User.role == UserRole.WORKER,
            User.is_active.is_(True),
        )
    )

    if worker is None:
        raise ValueError("Active worker not found")

    active_assignment = db.scalar(
        select(Assignment).where(
            Assignment.concern_id == concern_id,
            Assignment.status.in_(
                [
                    AssignmentStatus.PENDING,
                    AssignmentStatus.ASSIGNED,
                    AssignmentStatus.IN_PROGRESS,
                ]
            ),
        )
    )

    if active_assignment is not None:
        raise ValueError(
            "Concern already has an active assignment"
        )

    assignment = Assignment(
        concern_id=concern_id,
        worker_id=worker_id,
        assigned_by=assigned_by,
        status=AssignmentStatus.ASSIGNED,
    )

    db.add(assignment)
    db.flush()
    db.refresh(assignment)

    create_notification(
        db=db,
        recipient_id=worker_id,
        notification_type=NotificationType.ASSIGNMENT,
        title="New assignment",
        message=(
            f"Concern #{concern_id} has been assigned to you."
        ),
    )

    db.commit()
    db.refresh(assignment)

    return assignment


def get_assignment_by_id(
    db: Session,
    assignment_id: int,
) -> Assignment | None:
    return db.scalar(
        select(Assignment).where(
            Assignment.id == assignment_id,
        )
    )


def get_worker_assignments(
    db: Session,
    worker_id: int,
) -> list[Assignment]:
    return db.scalars(
        select(Assignment)
        .where(
            Assignment.worker_id == worker_id,
        )
        .order_by(Assignment.assigned_at.desc())
    ).all()


def get_all_assignments(
    db: Session,
) -> list[Assignment]:
    return db.scalars(
        select(Assignment)
        .order_by(Assignment.assigned_at.desc())
    ).all()


def update_assignment_status(
    db: Session,
    assignment: Assignment,
    new_status: AssignmentStatus,
) -> Assignment:
    current_status = assignment.status

    allowed_transitions = {
        AssignmentStatus.PENDING: {
            AssignmentStatus.ASSIGNED,
            AssignmentStatus.CANCELLED,
        },
        AssignmentStatus.ASSIGNED: {
            AssignmentStatus.IN_PROGRESS,
            AssignmentStatus.CANCELLED,
        },
        AssignmentStatus.IN_PROGRESS: {
            AssignmentStatus.COMPLETED,
            AssignmentStatus.CANCELLED,
        },
        AssignmentStatus.COMPLETED: set(),
        AssignmentStatus.CANCELLED: set(),
    }

    if new_status == current_status:
        raise ValueError(
            "Assignment is already in the requested status"
        )

    if new_status not in allowed_transitions[current_status]:
        raise ValueError(
            f"Invalid status transition from "
            f"{current_status.value} to {new_status.value}"
        )

    assignment.status = new_status

    if new_status == AssignmentStatus.COMPLETED:
        assignment.completed_at = datetime.utcnow()
    else:
        assignment.completed_at = None

    create_notification(
        db=db,
        recipient_id=assignment.assigned_by,
        notification_type=NotificationType.ASSIGNMENT,
        title="Assignment status updated",
        message=(
            f"Assignment #{assignment.id} status has been "
            f"updated from {current_status.value} "
            f"to {new_status.value}."
        ),
    )

    db.commit()
    db.refresh(assignment)

    return assignment