from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """
    Interface for text generation providers.

    Services that require LLM text generation
    should depend on this abstraction rather
    than a specific provider such as OpenAI.
    """

    @abstractmethod
    def generate(
        self,
        prompt: str,
    ) -> str:
        """
        Generate text from the supplied prompt.

        Args:
            prompt: Prompt sent to the language model.

        Returns:
            Generated model response.
        """
        raise NotImplementedError