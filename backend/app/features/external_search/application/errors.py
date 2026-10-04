class ProviderSearchError(RuntimeError):
    """Raised when a provider's upstream request fails (bad status, network error)."""

    def __init__(self, provider: str, message: str):
        self.provider = provider
        super().__init__(f"{provider} search failed: {message}")


class ProviderNotFoundError(LookupError):
    """Raised when a provider reports that the requested item does not exist."""

    def __init__(self, provider: str, message: str):
        self.provider = provider
        super().__init__(f"{provider}: {message}")


class ProviderRateLimitedError(RuntimeError):
    """Raised when a provider refuses a request because too many were sent."""

    def __init__(self, provider: str):
        self.provider = provider
        super().__init__(f"{provider} rate limit reached. Try again later.")
