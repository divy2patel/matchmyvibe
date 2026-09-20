import logging
from typing import Optional
from supabase import create_client, Client
from backend.app.core.config import settings

logger = logging.getLogger("matchmyvibe.db")

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns the Supabase Client if configured with valid credentials,
    otherwise returns None (falling back to in-memory repository store).
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.SUPABASE_URL and settings.SUPABASE_KEY and not settings.SUPABASE_URL.startswith("https://your-project"):
        try:
            _supabase_client = create_client(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_KEY or settings.SUPABASE_SERVICE_ROLE_KEY,
            )
            logger.info("Connected to Supabase at %s", settings.SUPABASE_URL)
            return _supabase_client
        except Exception as e:
            logger.warning("Could not connect to Supabase: %s. Using local memory store.", e)
            return None
    return None
