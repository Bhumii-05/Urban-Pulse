from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """
    Interface for text and multimodal LLM generation.

    Services that require LLM generation should depend
    on this abstraction rather than a specific provider.
    """

    @abstractmethod
    def generate(
        self,
        prompt: str,
    ) -> str:
        """
        Generate text from a text prompt.

        Args:
            prompt:
                Prompt sent to the language model.

        Returns:
            Generated model response.
        """
        raise NotImplementedError

    @abstractmethod
    def generate_with_image(
        self,
        prompt: str,
        image_data: str,
        mime_type: str,
    ) -> str:
        """
        Generate text using a prompt and an image.

        Args:
            prompt:
                Text instructions sent to the model.

            image_data:
                Base64-encoded image data.

            mime_type:
                MIME type of the image.

        Returns:
            Generated model response.
        """
        raise NotImplementedError