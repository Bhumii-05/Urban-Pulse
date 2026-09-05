from fastapi_mail import MessageSchema, MessageType

from app.core.config import settings
from app.core.mail import fast_mail


async def send_password_reset_email(
    to_email: str,
    user_name: str,
    raw_token: str,
) -> None:
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"

    message = MessageSchema(
        subject="UrbanPulse - Password Reset Request",
        recipients=[to_email],
        template_body={
            "user_name": user_name,
            "reset_url": reset_url,
        },
        subtype=MessageType.html,
    )

    await fast_mail.send_message(message, template_name="password_reset.html")