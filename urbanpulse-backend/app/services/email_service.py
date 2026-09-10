import logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem,
)

from app.core.config import settings
from app.core.mail import brevo_client


logger = logging.getLogger(__name__)


TEMPLATES_DIR = (
    Path(__file__).resolve().parent.parent / "templates" / "email"
)


jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR)
)


async def send_password_reset_email(
    to_email: str,
    user_name: str,
    raw_token: str,
) -> None:
    reset_url = (
        f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    )

    template = jinja_env.get_template("password_reset.html")

    html_content = template.render(
        user_name=user_name,
        reset_url=reset_url,
    )

    try:
        response = brevo_client.transactional_emails.send_transac_email(
            subject="UrbanPulse - Password Reset Request",
            html_content=html_content,
            sender=SendTransacEmailRequestSender(
                name="UrbanPulse Support",
                email=settings.SENDER_EMAIL,
            ),
            to=[
                SendTransacEmailRequestToItem(
                    email=to_email,
                    name=user_name,
                )
            ],
        )

        logger.info(
            "Password reset email sent to %s. Message ID: %s",
            to_email,
            response.message_id,
        )

    except Exception:
        logger.exception(
            "Failed to send password reset email to %s",
            to_email,
        )
        raise


async def send_password_reset_success_email(
    to_email: str,
    user_name: str,
) -> None:
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin:0;
        padding:40px 20px;
        background-color:#f4f7f6;
        font-family:Arial,sans-serif;
    ">
        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            padding:40px;
            border-radius:12px;
        ">
            <h2 style="color:#176b5d;">
                UrbanPulse - Password Reset Successful
            </h2>

            <p>Hello <strong>{user_name}</strong>,</p>

            <p>
                Your UrbanPulse password has been successfully reset.
            </p>

            <p>
                You can now log in using your new password.
            </p>

            <p style="color:#666;font-size:14px;">
                If you did not make this change, please contact
                UrbanPulse support immediately.
            </p>

            <p style="color:#999;font-size:12px;">
                UrbanPulse
            </p>
        </div>
    </body>
    </html>
    """

    try:
        response = brevo_client.transactional_emails.send_transac_email(
            subject="UrbanPulse - Password Reset Successful",
            html_content=html_content,
            sender=SendTransacEmailRequestSender(
                name="UrbanPulse Support",
                email=settings.SENDER_EMAIL,
            ),
            to=[
                SendTransacEmailRequestToItem(
                    email=to_email,
                    name=user_name,
                )
            ],
        )

        logger.info(
            "Password reset success email sent to %s. Message ID: %s",
            to_email,
            response.message_id,
        )

    except Exception:
        logger.exception(
            "Failed to send password reset success email to %s",
            to_email,
        )
        raise