from openai import OpenAI

from app.config.settings import settings
from app.providers.llm_provider import LLMProvider
from app.providers.embessing_provider import EmbeddingProvider


class OpenAIProvider(
    LLMProvider,
    EmbeddingProvider,
):
    """
    OpenAI implementation for text generation
    and embedding generation.
    """

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY
        )

    def generate(
        self,
        prompt: str,
    ) -> str:
        """
        Generate a text response using OpenAI.
        """

        response = self.client.responses.create(
            model=settings.OPENAI_MODEL,
            input=prompt,
        )

        return response.output_text

    def embed(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate an embedding vector using OpenAI.
        """

        response = self.client.embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=text,
        )

        return response.data[0].embedding