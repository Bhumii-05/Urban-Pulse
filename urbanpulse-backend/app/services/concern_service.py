from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.concern import Concern
from app.schemas.concern import ConcernCreate, ConcernUpdate


def create_concern(
    db: Session,
    concern_data: ConcernCreate,
    reported_by: int,
) -> Concern:

    point = func.ST_SetSRID(
        func.ST_MakePoint(
            concern_data.longitude,
            concern_data.latitude,
        ),
        4326,
    )

    concern = Concern(
        reported_by=reported_by,
        category=concern_data.category,
        description=concern_data.description,
        priority=concern_data.priority,
        location=point,
    )

    db.add(concern)
    db.commit()
    db.refresh(concern)

    return concern


def get_concerns(
    db: Session,
) -> list[Concern]:

    return (
        db.query(Concern)
        .filter(
            Concern.is_deleted.is_(False)
        )
        .order_by(
            Concern.created_at.desc()
        )
        .all()
    )


def get_concern_by_id(
    db: Session,
    concern_id: int,
) -> Concern | None:

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
) -> Concern:

    update_data = concern_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            concern,
            field,
            value,
        )

    db.commit()
    db.refresh(concern)

    return concern


def delete_concern(
    db: Session,
    concern: Concern,
) -> None:

    concern.is_deleted = True
    concern.deleted_at = datetime.utcnow()

    db.commit()