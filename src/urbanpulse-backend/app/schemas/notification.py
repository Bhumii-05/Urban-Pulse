"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Ashish Pant, Bhumika A
Date of Last Modification: 13 September 2026
Brief Description:Defines request and response schemas for notifications.
"""
from datetime import datetime

from pydantic import BaseModel

from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: int
    recipient_id: int
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}