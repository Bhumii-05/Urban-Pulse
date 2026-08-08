from pydantic import ValidationError

from app.core.exceptions import JSONParsingError
from app.core.json_parser import JSONParser
from app.prompts.classify_prompt import CLASSIFICATION_SYSTEM_PROMPT
from app.schemas.classify import (
    ClassifyRequest,
    ClassifyResponse,
)

from app.providers.llm_provider import LLMProvider

class ClassifierService:
    """
    Handles business logic for citizen message classification.
    """

    def __init__(
        self,
        provider: LLMProvider,
    ):
        """
        Initialize the service with any implementation
        of LLMProvider.
        """

        self.provider = provider

    def classify(
        self,
        request: ClassifyRequest,
    ) -> ClassifyResponse:

        prompt = self._build_prompt(request.text)

        try:

            response = self.provider.generate(prompt)

            response_data = JSONParser.parse(response)

            return ClassifyResponse(**response_data)

        except ValidationError as e:

            print("Validation Error:", e)

        except JSONParsingError as e:

            print("JSON Parsing Error:", e)

        except Exception as e:

            print("Unexpected Error:", e)

        return self._fallback_response()

    def _build_prompt(self, text: str) -> str:
        """
        Build the final prompt.
        """

        return f"""
{CLASSIFICATION_SYSTEM_PROMPT}

Citizen Message:

{text}
"""

    def _fallback_response(self) -> ClassifyResponse:
        """
        Safe fallback returned whenever something fails.
        """

        return ClassifyResponse(
            language="unknown",
            intent="other",
            category=None,
            confidence=0.0,
        )