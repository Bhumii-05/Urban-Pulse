"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines the citizen-message classification endpoint that uses the classifier service to identify language, intent, category, and confidence.
"""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_classifier_service
from app.schemas.classify import (
    ClassifyRequest,
    ClassifyResponse,
)
from app.services.classifier_service import (
    ClassifierService,
)

router = APIRouter(
    prefix="/classify",
    tags=["Classification"],
)


@router.post(
    "",
    response_model=ClassifyResponse,
    summary="Classify a citizen message",
)
def classify(
    request: ClassifyRequest,
    service: ClassifierService = Depends(get_classifier_service),
) -> ClassifyResponse:
    """
    Classify a citizen complaint into
    language, intent, category,
    and confidence.
    """

    return service.classify(request)