import base64
from openai import OpenAI

from app.config.settings import settings
from app.providers.embedding_provider import EmbeddingProvider
from app.providers.llm_provider import LLMProvider


class OpenAIProvider(
    LLMProvider,
    EmbeddingProvider,
):
    """
    OpenAI implementation for:

    - Text generation
    - Image + text generation
    - Embedding generation
    """

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY
        )

        self.embedding_model = (
            settings.EMBEDDING_MODEL
        )

        self.llm_model = (
            settings.OPENAI_MODEL
        )

    def generate(
        self,
        prompt: str,
    ) -> str:
        """
        Generate a text response using OpenAI with JSON mode enabled.
        """

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        response = self.client.chat.completions.create(
            model=self.llm_model,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": prompt.strip(),
                }
            ],
        )

        return response.choices[0].message.content or ""

    def generate_with_image(
        self,
        prompt: str,
        image_data: str | bytes,
        mime_type: str,
    ) -> str:
        """
        Generate a response using text and an image with JSON mode enabled.

        Args:
            prompt: Text instructions for the model.
            image_data: Base64-encoded string OR raw binary bytes of the image.
            mime_type: MIME type of the image (e.g., 'image/jpeg').

        Returns:
            Generated model response string.
        """

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        if not image_data:
            raise ValueError("Image data cannot be empty.")

        if not mime_type or not mime_type.strip():
            raise ValueError("Image MIME type cannot be empty.")

        # Convert raw bytes to base64 string safely
        if isinstance(image_data, bytes):
            base64_str = base64.b64encode(image_data).decode("utf-8")
        else:
            base64_str = image_data.strip()

        image_url = (
            f"data:{mime_type.strip().lower()};"
            f"base64,{base64_str}"
        )

        response = self.client.chat.completions.create(
            model=self.llm_model,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt.strip(),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                            },
                        },
                    ],
                }
            ],
        )

        answer = response.choices[0].message.content

        if not answer:
            raise RuntimeError("OpenAI returned an empty response.")

        return answer

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