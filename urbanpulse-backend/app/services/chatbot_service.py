import httpx


CHATBOT_SERVICE_URL = "http://127.0.0.1:8001/api/v1/ai/ask"


class ChatbotService:
    """
    Integration service responsible for communicating
    with the separate UrbanPulse chatbot AI service.
    """

    def ask(self, question: str) -> dict:
        """
        Send a user's question to the chatbot AI service
        and return its response.
        """

        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")

        payload = {
            "question": question.strip(),
        }

        try:
            response = httpx.post(
                CHATBOT_SERVICE_URL,
                json=payload,
                timeout=30.0,
            )

            response.raise_for_status()

        except httpx.ConnectError as exc:
            raise RuntimeError(
                "Chatbot AI service is unavailable."
            ) from exc

        except httpx.TimeoutException as exc:
            raise RuntimeError(
                "Chatbot AI service request timed out."
            ) from exc

        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"Chatbot AI service returned "
                f"status {exc.response.status_code}."
            ) from exc

        except httpx.RequestError as exc:
            raise RuntimeError(
                "Failed to communicate with chatbot AI service."
            ) from exc

        data = response.json()

        return {
            "answer": data.get("answer", ""),
            "sources": data.get("sources", []),
        }