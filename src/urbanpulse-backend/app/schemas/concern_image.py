"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Bhumika A
Date of Last Modification: 13 September 2026
Brief Description: Defines validation schemas for concern image data.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConcernImageResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    concern_id: int
    image_url: str
    uploaded_at: datetime