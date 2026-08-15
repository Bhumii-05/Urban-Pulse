from app.core.json_parser import JSONParser
from app.prompts.complaint_prompt import (
    SYSTEM_PROMPT,
    build_complaint_prompt,
)
from app.schemas.complaint import ComplaintResponse
from app.services.llm_service import LLMService


class ComplaintService:
    """
    Service responsible for analyzing municipal complaints.
    """

    def __init__(
        self,
        llm_service: LLMService,
    ):
        self.llm_service = llm_service

    def analyze(
        self,
        complaint: str,
    ) -> ComplaintResponse:
        """
        Analyze a municipal complaint using the LLM.
        """
        if not complaint or not complaint.strip():
            raise ValueError("Complaint cannot be empty.")

        complaint = complaint.strip()

        # 1. Build complaint prompt
        user_prompt = build_complaint_prompt(
            complaint=complaint,
        )

        # 2. Generate LLM response
        response = self.llm_service.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

        # Print raw response for immediate terminal debugging
        print(f"\n[DEBUG] Raw LLM Output:\n{response!r}\n")

        # 3. Parse JSON response
        try:
            parsed_response = JSONParser.parse(response)
        except Exception as exc:
            raise RuntimeError(
                f"Failed to parse complaint AI response. Raw output was: {response!r}"
            ) from exc

        # 4. Validate structured response
        try:
            return ComplaintResponse(**parsed_response)
        except Exception as exc:
            raise RuntimeError(
                f"Invalid complaint AI response schema: {exc}. Parsed dictionary: {parsed_response}"
            ) from exc