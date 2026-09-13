import json
import re
from typing import Any, Dict, Optional

from app.models.complaint import Complaint
from app.prompts.complaint_prompt import (
    SYSTEM_PROMPT,
    build_complaint_prompt,
)
from app.providers.llm_provider import LLMProvider
from app.repositories.complaint_repository import (
    ComplaintRepository,
)
from app.services.image_service import ImageService
from app.services.image_storage import ImageStorage
from app.services.local_image_storage import LocalImageStorage


class ComplaintService:
    """
    Service responsible for analyzing and persisting complaints.

    Supports:
    1. Text-only complaints.
    2. Complaints containing an image.
    3. Persistence through ComplaintRepository and ImageStorage.

    The service does not know about FastAPI or SQLite.
    """

    def __init__(
        self,
        provider: LLMProvider,
        repository: ComplaintRepository,
        image_storage: Optional[ImageStorage] = None,
        image_service: Optional[ImageService] = None,
    ):
        self.provider = provider
        self.repository = repository
        self.image_storage = (
            image_storage
            if image_storage is not None
            else LocalImageStorage("data/uploads")
        )
        self.image_service = (
            image_service if image_service is not None else ImageService()
        )

    def create_complaint(
        self,
        complaint: str,
        category: str,
        severity: str,
        description: str,
        recommended_action: str,
        confidence: float,
        image_data: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        image_filename: Optional[str] = None,
    ) -> Complaint:
        """
        Alias/wrapper method to match what the FastAPI router calls.
        Directly delegates to the main analyze & persist logic.
        """
        # If the router passes pre-calculated fields or you want 
        # to leverage the full LLM analysis pipeline:
        return self.analyze(
            complaint=complaint,
            image_data=image_data,
            mime_type=mime_type,
            image_filename=image_filename,
        )

    def analyze(
        self,
        complaint: str,
        image_data: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        image_filename: Optional[str] = None,
    ) -> Complaint:
        """
        Analyze and persist a municipal complaint.
        """

        # ---------------------------------------------
        # 1. Validate complaint
        # ---------------------------------------------
        if not complaint or not complaint.strip():
            raise ValueError("Complaint cannot be empty.")

        complaint = complaint.strip()

        # ---------------------------------------------
        # 2. Prepare optional image
        # ---------------------------------------------
        prepared_image = None

        if image_data is not None:
            if not mime_type:
                raise ValueError("Image MIME type is required.")

            prepared_image = self.image_service.prepare(
                image_data=image_data,
                mime_type=mime_type,
            )

        # ---------------------------------------------
        # 3. Build prompt
        # ---------------------------------------------
        prompt = build_complaint_prompt(
            complaint=complaint,
        )

        # ---------------------------------------------
        # 4. Generate AI response
        # ---------------------------------------------
        if prepared_image is not None:
            response = self.provider.generate_with_image(
                prompt=prompt,
                image_data=prepared_image["data"],
                mime_type=prepared_image["mime_type"],
            )
        else:
            response = self.provider.generate(prompt)

        # ---------------------------------------------
        # 5. Validate raw LLM response
        # ---------------------------------------------
        if not response or not response.strip():
            raise RuntimeError("LLM returned an empty response.")

        parsed_response = self._parse_response(response.strip())

        # ---------------------------------------------
        # 6. Create Complaint domain model
        # ---------------------------------------------
        complaint_model = Complaint(
            complaint_text=complaint,
            category=parsed_response["category"],
            severity=parsed_response["severity"],
            description=parsed_response["description"],
            recommended_action=parsed_response["recommended_action"],
            confidence=parsed_response["confidence"],
            image_filename=image_filename,
            image_mime_type=(
                prepared_image["mime_type"] if prepared_image is not None else None
            ),
        )

        # ---------------------------------------------
        # 7. Persist image file via ImageStorage if provided
        # ---------------------------------------------
        if prepared_image is not None and image_filename:
            raw_data = prepared_image["data"]
            if isinstance(raw_data, str):
                storage_bytes = raw_data.encode("utf-8")
            elif isinstance(raw_data, memoryview):
                storage_bytes = bytes(raw_data)
            else:
                storage_bytes = raw_data

            self.image_storage.save(
                image_data=storage_bytes,
                filename=image_filename,
                mime_type=prepared_image["mime_type"],
                complaint_id=complaint_model.id,
            )

        # ---------------------------------------------
        # 8. Persist complaint in repository
        # ---------------------------------------------
        persisted_complaint = self.repository.create(complaint_model)

        return persisted_complaint

    def analyze_only(
        self,
        complaint: str,
        image_data: Optional[bytes] = None,
        mime_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a complaint without creating a database record.
        This method is used by the complaint preview flow.
        """
        if not complaint or not complaint.strip():
            raise ValueError("Complaint cannot be empty.")

        complaint = complaint.strip()
        has_image = image_data is not None

        if has_image:
            if not mime_type:
                raise ValueError("Image MIME type is required.")

            prepared_image = self.image_service.prepare(
                image_data=image_data,
                mime_type=mime_type,
            )
        else:
            prepared_image = None

        prompt = build_complaint_prompt(complaint=complaint)

        if prepared_image is not None:
            response = self.provider.generate_with_image(
                prompt=prompt,
                image_data=prepared_image["data"],
                mime_type=prepared_image["mime_type"],
            )
        else:
            response = self.provider.generate(prompt)

        if not response or not response.strip():
            raise RuntimeError("LLM returned an empty response.")

        return self._parse_response(response.strip())

    def _parse_response(self, response: str) -> Dict[str, Any]:
        """
        Safely strips markdown code fences and parses the raw LLM string into a JSON object.
        """
        text = response.strip()

        # Strip markdown code blocks (```json ... ```) safely
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
            text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
            text = text.strip()

        # Extract JSON substring between outer braces if extra prose exists
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            text = match.group(0)

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            raise RuntimeError("LLM returned invalid JSON.") from exc

        if not isinstance(parsed, dict):
            raise RuntimeError("LLM response must be a JSON object.")

        required_fields = {
            "category",
            "severity",
            "description",
            "recommended_action",
            "confidence",
        }

        missing_fields = required_fields - parsed.keys()

        if missing_fields:
            raise RuntimeError(
                "LLM response is missing required fields: "
                + ", ".join(sorted(missing_fields))
            )

        return parsed

    def create(
        self,
        complaint: str,
        category: str,
        severity: str,
        description: str,
        recommended_action: str,
        confidence: float,
        image_data: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        image_filename: Optional[str] = None,
    ) -> Complaint:
        """
        Alias for create_complaint to support router calls using .create()
        """
        return self.create_complaint(
            complaint=complaint,
            category=category,
            severity=severity,
            description=description,
            recommended_action=recommended_action,
            confidence=confidence,
            image_data=image_data,
            mime_type=mime_type,
            image_filename=image_filename,
        )