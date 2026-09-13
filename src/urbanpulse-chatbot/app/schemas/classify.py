"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines request and response schemas for citizen-message classification, including language, intent, category, and confidence.
"""

from pydantic import BaseModel, Field

class ClassifyRequest(BaseModel):
    """
    Request model for the /classify endpoint.
    """

    text: str= Field(..., description= "Citizen's complaint or message.")

class ClassifyResponse(BaseModel):
    """
    Response model for the /classify endpoint.
    """
    language: str= Field(..., description= "Detected language of the message.")

    intent: str = Field(..., description= "Detected intent of the message.")

    category: str = Field(default = None, description= "Predicted waste category of the message.")

    confidence: float = Field(..., ge=0.0, le =1.0, description = "Confidence score of the classification.")