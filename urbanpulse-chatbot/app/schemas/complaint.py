from uuid import UUID

from pydantic import BaseModel, Field
from app.models.complaint import ComplaintStatus 

from typing import Optional, Union
from uuid import UUID


class ComplaintRequest(BaseModel):
    """
    Request model for complaint analysis.
    """

    complaint: str = Field(
        ...,
        min_length=1,
        description="User's complaint text.",
    )


class ComplaintResponse(BaseModel):
    """
    Structured result returned by the complaint AI.
    """

    id: UUID
    category: str
    severity: str
    description: str
    recommended_action: str

    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )

    status: str


class ComplaintListResponse(BaseModel):
    """
    Response containing persisted complaints.
    """

    complaints: list[ComplaintResponse]
    total: int

class ComplaintStatusUpdateRequest(BaseModel):
    """
    Request model for updating complaint status.
    """

    status: ComplaintStatus


class ComplaintAnalysisResponse(BaseModel):
    """
    AI analysis result without creating a complaint record.
    """
    category: str
    severity: str
    description: str
    recommended_action: str
    confidence: float = Field(..., ge=0.0, le=1.0)

class ComplaintResponse(BaseModel):
    id: Union[UUID, str]  # Accepts both UUID objects and custom strings like "CMP-1001"
    category: str
    severity: str
    description: str
    recommended_action: str
    confidence: float
    status: str
    image_reference: Optional[str] = None