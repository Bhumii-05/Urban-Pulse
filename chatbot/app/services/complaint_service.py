import json
import re
from typing import Any, Dict, Optional


def parse_json_safely(raw_text: str) -> Dict[str, Any]:
    """
    Cleans and extracts JSON object output returned by an LLM.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("LLM returned an empty response.")

    text = raw_text.strip()

    # Strip markdown code blocks (```json ... ```)
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
        text = text.strip()

    # Extract JSON substring between outer braces
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"LLM returned invalid JSON: {raw_text}") from exc


class ComplaintService:
    """
    Service responsible for analyzing civic complaints using AI providers.
    """

    def __init__(self, provider, image_service=None):
        self.provider = provider
        self.image_service = image_service

    def analyze(
        self,
        complaint: str,
        image_data: Optional[bytes] = None,
        mime_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyzes a civic complaint string and optional image payload.
        """

        prompt = f"""
You are an expert civic complaint analysis system. Analyze the provided complaint and return a valid JSON object.

Your JSON response MUST contain the following keys:
- "category": (string) main issue category (e.g., "illegal_dumping", "pothole", "street_light", "water_leak", etc.)
- "severity": (string) priority level, exactly one of: "low", "medium", or "high"
- "description": (string) a clear summary of the issue reported
- "recommended_action": (string) concrete action steps for local municipal authorities
- "confidence": (float) confidence score between 0.0 and 1.0

User Complaint: {complaint}
"""

        if image_data and self.image_service:
            # Process multimodal payload
            prepared_image = self.image_service.prepare(image_data, mime_type)
            raw_response = self.provider.generate_with_image(
                prompt=prompt,
                image_data=prepared_image["data"],
                mime_type=prepared_image["mime_type"],
            )
        elif image_data and mime_type:
            # Direct pass-through if image_service isn't used
            raw_response = self.provider.generate_with_image(
                prompt=prompt,
                image_data=image_data,
                mime_type=mime_type,
            )
        else:
            # Text-only classification
            raw_response = self.provider.generate(prompt)

        return parse_json_safely(raw_response)