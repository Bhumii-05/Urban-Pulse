from pydantic import BaseModel, Field


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

    category: str
    severity: str
    description: str
    recommended_action: str
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )