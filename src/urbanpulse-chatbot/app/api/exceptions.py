class AIServiceError(Exception):
    """
    Base exception for AI service failures.
    """
    pass


class AIProviderError(AIServiceError):
    """
    Raised when an external AI provider fails.
    """
    pass


class AIRetrievalError(AIServiceError):
    """
    Raised when the retrieval pipeline fails.
    """
    pass