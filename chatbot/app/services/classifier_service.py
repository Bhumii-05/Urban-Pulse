import json

from app.providers.openai_provider import OpenAIProvider
from app.prompts.classify_prompt import CLASSIFICATION_SYSTEM_PROMPT
from app.schemas.classify import (
    ClassificationRequest,
    ClassificationResponse,
)

class ClassifierService:
    """
    Handles the business logic for classifying citizen messages.
    """

    def __init__(self):
        self.provider = OpenAIProvider()

    def classify(self, request: ClassificationRequest) -> ClassificationResponse:
        """
        Classifiesa citizen message using GPT.
        """
        prompt = (
            f"{CLASSIFICATION_SYSTEM_PROMPT}\n\n"
            f"Citizen Message: \n"
            f"{request.text}"
        )

        response = self.provider.generate(prompt)
        response_data = json.loads(response)

        return ClassificationResponse(**response_data)