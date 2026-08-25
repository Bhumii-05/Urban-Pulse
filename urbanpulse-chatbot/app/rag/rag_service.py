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

        answer = self.llm_service.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

        # ---------------------------------------------
        # 6. Return answer + sources
        # ---------------------------------------------

        return {
            "answer": answer,
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