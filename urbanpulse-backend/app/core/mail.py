from brevo import Brevo

from app.core.config import settings


brevo_client = Brevo(
    api_key=settings.BREVO_API_KEY
)