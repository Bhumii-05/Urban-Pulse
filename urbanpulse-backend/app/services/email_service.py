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


# Path to app/templates/email
TEMPLATES_DIR = (
    Path(__file__).resolve().parent.parent / "templates" / "email"
)


# Jinja2 environment for email templates
jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR)
)


def send_password_reset_email(
    to_email: str,
    user_name: str,
    raw_token: str,
) -> None:
    reset_url = (
        f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    )

    # Load the existing HTML template
    template = jinja_env.get_template("password_reset.html")

    # Render the template with the required values
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