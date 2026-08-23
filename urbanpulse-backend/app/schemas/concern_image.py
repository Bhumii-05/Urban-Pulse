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