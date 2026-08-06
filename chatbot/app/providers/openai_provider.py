from openai import OpenAI

from app.config.settings import settings
from app.providers.llm_provider import LLMProvider


class OpenAIProvider(LLMProvider):
    """
    Concrete implementation of the LLMProvider
    using OpenAI's ChatGPT API.
    """

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY
        )

    def generate(self, prompt: str) -> str:
        """
        Send a prompt to OpenAI and return
        the generated response.
        """

        response = self.client.responses.create(
            model=settings.OPENAI_MODEL,
            input=prompt,
        )

        return response.output_text