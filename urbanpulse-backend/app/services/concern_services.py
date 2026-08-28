from datetime import datetime, timezone

from geoalchemy2 import Geography
from sqlalchemy import cast, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.concern import (
    Concern,
    ConcernStatus,
)
from app.models.concern_history import ConcernHistory
from app.models.concern_support import ConcernSupport
from app.models.notification import NotificationType
from app.schemas.concern import (
    ConcernCreate,
    ConcernUpdate,
)
from app.services.notification_services import (
    create_notification,
)
from app.utils.geo_utils import create_point, parse_location

DUPLICATE_RADIUS_METERS = 50.0

def find_nearby_duplicate(
    db: Session,
    concern_data: ConcernCreate,
):
    """
    Find an active concern of the same category
    within 50 meters of the submitted location.

    Resolved, rejected, and deleted concerns are ignored.
    """

    latitude = concern_data.location.latitude
    longitude = concern_data.location.longitude

    submitted_point = create_point(
        latitude=latitude,
        longitude=longitude,
    )

    concern_location = cast(
        Concern.location,
        Geography,
    )

    submitted_location = cast(
        submitted_point,
        Geography,
    )

    distance = func.ST_Distance(
        concern_location,
        submitted_location,
    )

    nearby_concern = db.scalar(
        select(Concern)
        .where(
            Concern.is_deleted.is_(False),

            Concern.status.in_(
                [
                    ConcernStatus.OPEN,
                    ConcernStatus.IN_PROGRESS,
                ]
            ),

            func.lower(Concern.category)
            == concern_data.category.strip().lower(),

            func.ST_DWithin(
                concern_location,
                submitted_location,
                DUPLICATE_RADIUS_METERS,
            ),
        )
        .order_by(distance.asc())
        .limit(1)
    )

    if nearby_concern is None:
        return None

    distance_meters = db.scalar(
        select(
            func.ST_Distance(
                cast(
                    Concern.location,
                    Geography,
                ),
                submitted_location,
            )
        )
        .where(
            Concern.id == nearby_concern.id
        )
    )

    return {
        "concern": nearby_concern,
        "distance_meters": round(
            float(distance_meters or 0),
            2,
        ),
    }


def create_concern(
    db: Session,
    concern_data: ConcernCreate,
    reported_by: int,
):
    duplicate = find_nearby_duplicate(
        db=db,
        concern_data=concern_data,
    )

    if duplicate is not None:
        return duplicate

    latitude = concern_data.location.latitude
    longitude = concern_data.location.longitude

    location_point = create_point(
        latitude=latitude,
        longitude=longitude,
    )

    concern = Concern(
        reported_by=reported_by,
        category=concern_data.category.strip(),
        description=concern_data.description.strip(),
        location=location_point,
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

    return {
        "concern": concern,
        "distance_meters": None,
    }


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
    update_data = concern_data.model_dump(exclude_unset=True)

    if "location" in update_data:
        location = update_data["location"]

        try:
            latitude, longitude = parse_location(location)
        except ValueError as exc:
            raise ValueError(str(exc))

        concern.location = create_point(
            latitude=latitude,
            longitude=longitude,
        )

        del update_data["location"]

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
    concern.deleted_at = datetime.now(timezone.utc)

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
    concern.updated_at = datetime.now(timezone.utc)

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
            f"from {old_status.value} "
            f"to {new_status.value}."
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