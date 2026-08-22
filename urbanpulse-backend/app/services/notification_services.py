from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    recipient_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
) -> Notification:
    notification = Notification(
        recipient_id=recipient_id,
        notification_type=notification_type,
        title=title,
        message=message,
    )

    db.add(notification)
    db.flush()
    db.refresh(notification)

    return notification


def get_user_notifications(
    db: Session,
    user_id: int,
) -> list[Notification]:
    return db.scalars(
        select(Notification)
        .where(Notification.recipient_id == user_id)
        .order_by(Notification.created_at.desc())
    ).all()


def mark_notification_as_read(
    db: Session,
    notification_id: int,
    user_id: int,
) -> Notification | None:
    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.recipient_id == user_id,
        )
    )

    if notification is None:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def mark_all_notifications_as_read(
    db: Session,
    user_id: int,
) -> int:
    notifications = db.scalars(
        select(Notification).where(
            Notification.recipient_id == user_id,
            Notification.is_read.is_(False),
        )
    ).all()

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return len(notifications)