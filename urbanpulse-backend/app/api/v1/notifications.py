from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_services import (
    get_user_notifications,
    mark_all_notifications_as_read,
    mark_notification_as_read,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_notifications(
        db,
        current_user.id,
    )

@router.patch(
    "/read-all",
)
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated_count = mark_all_notifications_as_read(
        db,
        current_user.id,
    )

    return {
        "message": "All notifications marked as read",
        "updated_count": updated_count,
    }


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = mark_notification_as_read(
        db,
        notification_id,
        current_user.id,
    )

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return notification