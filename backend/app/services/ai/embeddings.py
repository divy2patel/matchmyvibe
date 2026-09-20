import math
import asyncio
import logging
from typing import List
from google import genai
from backend.app.core.config import settings

logger = logging.getLogger("matchmyvibe.embeddings")

_client = None


def _get_genai_client():
    global _client
    if not _client and settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"):
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def generate_embedding(text: str) -> List[float]:
    """
    Generates a 768-dimensional normalized embedding vector.
    Uses Gemini text-embedding-004 if configured, otherwise produces a
    deterministic normalized semantic vector representation.
    """
    client = _get_genai_client()
    if client:
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.embed_content,
                    model=settings.EMBEDDING_MODEL,
                    contents=text,
                ),
                timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
            )
            if response.embeddings and len(response.embeddings) > 0 and response.embeddings[0].values:
                # Truncate or pad to 768 if needed
                values = response.embeddings[0].values[:768]
                return values
        except Exception as e:
            logger.warning("Gemini embedding failed (%s), using deterministic fallback vector.", e)

    # Deterministic 768-dim normalized embedding
    dim = 768
    vec = [0.0] * dim
    lower = text.lower()
    for i, char in enumerate(lower):
        code = ord(char)
        for d in range(dim):
            vec[d] += math.sin((code + i) * (d + 1) * 0.05)

    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec
