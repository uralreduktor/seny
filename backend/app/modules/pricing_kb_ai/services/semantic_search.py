from __future__ import annotations

from typing import List, Optional

from openai import AsyncOpenAI
from openai.types import Embedding

from app.core.config import settings


class SemanticSearchError(Exception):
    """Raised when semantic search cannot be performed."""


class SemanticSearchService:
    MODEL = "text-embedding-3-large"
    _client: Optional[AsyncOpenAI] = None

    @classmethod
    def _get_client(cls) -> AsyncOpenAI:
        if cls._client is None:
            if not settings.OPENAI_API_KEY:
                raise SemanticSearchError(
                    "Semantic search недоступен: не сконфигурирован OPENAI_API_KEY"
                )
            cls._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return cls._client

    @classmethod
    async def build_query_embedding(cls, query: str) -> List[float]:
        if not query or not query.strip():
            raise SemanticSearchError("Для semantic поиска необходимо передать запрос")

        client = cls._get_client()
        try:
            response = await client.embeddings.create(
                model=cls.MODEL,
                input=query,
            )
        except Exception as exc:  # pragma: no cover - network failures
            raise SemanticSearchError(f"Не удалось получить embedding: {exc}") from exc

        embedding: Optional[Embedding] = response.data[0] if response.data else None
        if not embedding or not embedding.embedding:
            raise SemanticSearchError("Пустой embedding от провайдера")
        return embedding.embedding
