from abc import ABC, abstractmethod

class LLMProvider(ABC):
    """
    Abstract base class for all LLM providers.

    Any provider(OpenAI, Anthropic, Gemini, etc.)
    must implement the methods defined here.
    """

    @abstractmethod
    def generate(self, prompt: str)-> str:
        """
        Generate a response from the language model.
        
        Args:
            prompt: The prompt sent to the model.

        Returns:
            The generated text response.
        """

        pass