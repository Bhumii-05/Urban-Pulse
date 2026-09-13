from app.providers.llm_provider import LLMProvider


class LLMService:
    """
    Service responsible for handling LLM text generation using an LLMProvider.
    """

    def __init__(
        self,
        provider: LLMProvider,
    ):
        self.provider = provider

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        if not system_prompt or not system_prompt.strip():
            raise ValueError("System prompt cannot be empty.")

        if not user_prompt or not user_prompt.strip():
            raise ValueError("User prompt cannot be empty.")

        try:
            # Format system and user prompts for the provider
            combined_prompt = f"System: {system_prompt.strip()}\n\nUser: {user_prompt.strip()}"
            answer = self.provider.generate(combined_prompt).strip()

            if not answer:
                raise RuntimeError("LLM returned an empty response.")

            return answer

        except Exception as exc:
            raise RuntimeError("LLM generation failed.") from exc