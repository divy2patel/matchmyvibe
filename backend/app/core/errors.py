class MatchMyVibeError(Exception):
    """Base exception for application."""
    def __init__(self, message: str, status_code: int = 500, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class DatabaseError(MatchMyVibeError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message=message, status_code=500, details=details)


class NotFoundError(MatchMyVibeError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message=message, status_code=404, details=details)


class ValidationError(MatchMyVibeError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message=message, status_code=400, details=details)


# ─── AI Provider Specific Exceptions ──────────────────────────────────────────

class AIProviderError(MatchMyVibeError):
    def __init__(self, provider: str, message: str, status_code: int = 502, details: dict = None):
        self.provider = provider
        super().__init__(f"[{provider}] {message}", status_code=status_code, details=details)


class AIProviderTimeoutError(AIProviderError):
    def __init__(self, provider: str, timeout_seconds: float):
        super().__init__(
            provider=provider,
            message=f"Request timed out after {timeout_seconds}s",
            status_code=504,
            details={"timeout_seconds": timeout_seconds},
        )


class AIProviderRateLimitError(AIProviderError):
    def __init__(self, provider: str, message: str = "Rate limit reached"):
        super().__init__(provider=provider, message=message, status_code=429)


class AIProviderAuthError(AIProviderError):
    def __init__(self, provider: str, message: str = "Authentication failed (invalid API key)"):
        super().__init__(provider=provider, message=message, status_code=401)


class AIProviderInvalidResponseError(AIProviderError):
    def __init__(self, provider: str, raw_response: str, reason: str):
        super().__init__(
            provider=provider,
            message=f"Invalid structured response: {reason}",
            status_code=502,
            details={"raw_response": raw_response[:200], "reason": reason},
        )
