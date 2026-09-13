"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines API-level exception classes for general AI service failures, external AI provider failures, and retrieval pipeline failures.
"""

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