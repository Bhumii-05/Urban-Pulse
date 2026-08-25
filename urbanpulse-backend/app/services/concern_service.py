from datetime import datetime

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.concern import Concern, ConcernStatus
from app.models.concern_history import ConcernHistory
from app.models.concern_support import ConcernSupport
from app.models.notification import NotificationType
from app.schemas.concern import ConcernCreate, ConcernUpdate
from app.services.notification_services import create_notification


def create_concern(
    db: Session,
    concern_data: ConcernCreate,
    reported_by: int,
):
    concern = Concern(
        reported_by=reported_by,
        category=concern_data.category,
        description=concern_data.description,
        location=concern_data.location,
        priority=concern_data.priority,
        status=ConcernStatus.OPEN,
    )

    db.add(concern)
    db.flush()
    db.refresh(concern)

    create_notification(
        db=db,
        recipient_id=reported_by,
        notification_type=NotificationType.CONCERN,
        title="Concern submitted",
        message="Your concern has been submitted successfully.",
    )

    db.commit()
    db.refresh(concern)

    return concern


def get_concerns(db: Session):
    return (
        db.query(Concern)
        .filter(Concern.is_deleted.is_(False))
        .order_by(Concern.created_at.desc())
        .all()
    )


def get_concern_by_id(
    db: Session,
    concern_id: int,
):
    return (
        db.query(Concern)
        .filter(
            Concern.id == concern_id,
            Concern.is_deleted.is_(False),
        )
        .first()
    )


def update_concern(
    db: Session,
    concern: Concern,
    concern_data: ConcernUpdate,
):
    update_data = concern_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(concern, field, value)

    concern.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(concern)

    return concern


def delete_concern(
    db: Session,
    concern: Concern,
):
    concern.is_deleted = True
    concern.deleted_at = datetime.utcnow()

    db.commit()


def update_concern_status(
    db: Session,
    concern: Concern,
    new_status: ConcernStatus,
    changed_by: int,
    remarks: str | None = None,
):
    old_status = concern.status

    if old_status == new_status:
        return None

    concern.status = new_status
    concern.updated_at = datetime.utcnow()

    history = ConcernHistory(
        concern_id=concern.id,
        changed_by=changed_by,
        old_status=old_status,
        new_status=new_status,
        remarks=remarks,
    )

    db.add(history)

    create_notification(
        db=db,
        recipient_id=concern.reported_by,
        notification_type=NotificationType.CONCERN,
        title="Concern status updated",
        message=(
            f"Your concern status has been updated "
            f"from {old_status.value} to {new_status.value}."
        ),
    )

    db.commit()
    db.refresh(concern)

    return concern


def get_concern_history(
    db: Session,
    concern_id: int,
):
    return (
        db.query(ConcernHistory)
        .filter(
            ConcernHistory.concern_id == concern_id
        )
        .order_by(ConcernHistory.created_at.desc())
        .all()
    )


def get_concern_support(
    db: Session,
    concern_id: int,
    user_id: int,
):
    support_count = (
        db.query(func.count(ConcernSupport.id))
        .filter(
            ConcernSupport.concern_id == concern_id
        )
        .scalar()
    )

    user_support = (
        db.query(ConcernSupport)
        .filter(
            ConcernSupport.concern_id == concern_id,
            ConcernSupport.user_id == user_id,
        )
        .first()
    )

    return {
        "concern_id": concern_id,
        "support_count": support_count or 0,
        "supported_by_current_user": user_support is not None,
    }


def add_concern_support(
    db: Session,
    concern_id: int,
    user_id: int,
):
    existing_support = (
        db.query(ConcernSupport)
        .filter(
            ConcernSupport.concern_id == concern_id,
            ConcernSupport.user_id == user_id,
        )
        .first()
    )

    if existing_support is not None:
        return None

    support = ConcernSupport(
        concern_id=concern_id,
        user_id=user_id,
    )

    db.add(support)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None

    db.refresh(support)

    return get_concern_support(
        db=db,
        concern_id=concern_id,
        user_id=user_id,
    )


def remove_concern_support(
    db: Session,
    concern_id: int,
    user_id: int,
):
    support = (
        db.query(ConcernSupport)
        .filter(
            ConcernSupport.concern_id == concern_id,
            ConcernSupport.user_id == user_id,
        )
        .first()
    )

    if support is None:
        return False

    db.delete(support)
    db.commit()

    return True