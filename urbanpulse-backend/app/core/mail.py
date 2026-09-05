from pathlib import Path
from fastapi_mail import ConnectionConfig, FastMail

from app.core.config import settings

# Path to app/templates/email
TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "email"

mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SMTP_USER,
    MAIL_FROM_NAME="UrbanPulse Support",
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=TEMPLATES_DIR,
)

fast_mail = FastMail(mail_config)