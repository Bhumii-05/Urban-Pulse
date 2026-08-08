from app.providers.openai_provider import OpenAIProvider
from app.services.classifier_service import ClassifierService


def get_classifier_service() -> ClassifierService:
    """
    Creates and returns a fully configured
    ClassifierService.
    """

    provider = OpenAIProvider()

    return ClassifierService(
        provider=provider,
    )