from datetime import datetime

from sqlalchemy.orm import Session

from app.models.concern import Concern, ConcernStatus
from app.models.concern_history import ConcernHistory
from app.schemas.concern import ConcernCreate, ConcernUpdate


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