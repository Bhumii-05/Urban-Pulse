"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Ashish Pant
Date of Last Modification: 13 September 2026
Brief Description: Configures email services used for application communication.
"""
from brevo import Brevo

from app.core.config import settings


brevo_client = Brevo(
    api_key=settings.BREVO_API_KEY
)