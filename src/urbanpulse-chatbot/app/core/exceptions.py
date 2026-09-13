"""
Custom exceptions used throughout the AI service.
"""


class AIServiceError(Exception):
    """
    Base exception for the AI service.
    """

    pass


class JSONParsingError(AIServiceError):
    """
    Raised when an LLM response cannot be parsed as valid JSON.
    """

    pass


class ProviderError(AIServiceError):
    """
    Raised when communication with the LLM provider fails.
    """

    pass


class PromptError(AIServiceError):
    """
    Raised when prompt construction fails.
    """

    pass