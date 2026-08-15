from openai import OpenAI

from app.config.settings import settings
from app.providers.embedding_provider import EmbeddingProvider
from app.providers.llm_provider import LLMProvider


class OpenAIProvider(
    LLMProvider,
    EmbeddingProvider,
):
    """
    OpenAI implementation for text generation and embedding generation.
    """

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_model = settings.EMBEDDING_MODEL
        self.llm_model = settings.OPENAI_MODEL

    def generate(
        self,
        prompt: str,
    ) -> str:
        """
        Generate a text response using OpenAI Chat Completions.
        """
        response = self.client.chat.completions.create(
            model=self.llm_model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content

    def embed(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate an embedding vector using OpenAI.
        """
        response = self.client.embeddings.create(
            model=self.embedding_model,
            input=text,
        )
        return response.data[0].embedding