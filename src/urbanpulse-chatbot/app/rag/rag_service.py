import json
from typing import Any, Optional
from app.prompts.rag_prompt import (
    SYSTEM_PROMPT,
    build_rag_prompt,
)
from app.rag.context_builder import ContextBuilder
from app.rag.retriever import Retriever
from app.services.llm_service import LLMService


class RAGService:
    """
    Orchestrates the complete Retrieval-Augmented Generation pipeline.

    Flow:

        Question
            ↓
        Retriever
            ↓
        ContextBuilder
            ↓
        RAG Prompt
            ↓
        LLMService
            ↓
        Answer
    """

    def __init__(
        self,
        retriever: Optional[Retriever] = None,
        context_builder: Optional[ContextBuilder] = None,
        llm_service: Optional[LLMService] = None,
        prompt_builder: Any = None,
        **kwargs: Any,
    ):
        self.retriever = retriever
        self.context_builder = context_builder
        self.llm_service = llm_service
        self.prompt_builder = prompt_builder

    def answer(
        self,
        question: str,
    ) -> dict:
        """
        Generate an answer using retrieved document context.

        Args:
            question:
                User's natural-language question.

        Returns:
            Dictionary containing:
                answer
                follow_up_questions
                sources
        """

        if not question or not question.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        question = question.strip()

        # ---------------------------------------------
        # 1. Retrieve relevant chunks
        # ---------------------------------------------

        retrieval_results = self.retriever.retrieve(
            question
        )

        # ---------------------------------------------
        # 2. Handle empty retrieval
        # ---------------------------------------------

        if not retrieval_results:
            return {
                "answer": (
                    "The available information is "
                    "insufficient to answer this question."
                ),
                "follow_up_questions": [],
                "sources": [],
            }

        # ---------------------------------------------
        # 3. Build context
        # ---------------------------------------------

        built_context = self.context_builder.build(
            retrieval_results
        )

        if not built_context.text.strip():
            return {
                "answer": (
                    "The available information is "
                    "insufficient to answer this question."
                ),
                "follow_up_questions": [],
                "sources": [],
            }

        # ---------------------------------------------
        # 4. Build RAG prompt
        # ---------------------------------------------

        if self.prompt_builder and hasattr(self.prompt_builder, "build"):
            user_prompt = self.prompt_builder.build(
                question=question,
                context=built_context.text,
            )
        else:
            user_prompt = build_rag_prompt(
                question=question,
                context=built_context.text,
            )

        # ---------------------------------------------
        # 5. Generate LLM answer
        # ---------------------------------------------

        raw_answer = self.llm_service.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

        parsed_response = self._parse_llm_response(raw_answer)

        return {
            "answer": parsed_response["answer"],
            "follow_up_questions": parsed_response["follow_up_questions"],
            "sources": built_context.sources,
        }

    def ask(
        self,
        question: str,
    ) -> dict:
        """
        Alias for answer() method to support tests calling ask().
        """
        return self.answer(question)

    def _parse_llm_response(self, raw_answer: str) -> dict:
        fallback = {
            "answer": raw_answer.strip() if raw_answer else "",
            "follow_up_questions": [],
        }

        if not raw_answer:
            return fallback

        try:
            parsed = json.loads(raw_answer)
        except json.JSONDecodeError:
            return fallback

        if not isinstance(parsed, dict):
            return fallback

        answer = parsed.get("answer", "")
        follow_ups = parsed.get("follow_up_questions", [])

        if not isinstance(answer, str):
            answer = ""

        if not isinstance(follow_ups, list):
            follow_ups = []

        clean_follow_ups = [
            item.strip()
            for item in follow_ups
            if isinstance(item, str) and item.strip()
        ]

        return {
            "answer": answer.strip(),
            "follow_up_questions": clean_follow_ups[:3],
        }