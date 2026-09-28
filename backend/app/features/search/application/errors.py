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


class UnsupportedMediaTypeError(ValueError):
    """Raised when a provider is asked for a media type it does not serve."""

    def __init__(self, provider: str, media_type: str, supported: list[str]):
        self.provider = provider
        self.media_type = media_type
        self.supported = supported
        super().__init__(
            f"{provider} does not support media_type '{media_type}'. "
            f"Supported: {', '.join(supported)}"
        )


class UnknownCategoryError(ValueError):
    def __init__(self, category: str, available: list[str]):
        self.category = category
        self.available = available
        super().__init__(
            f"Unknown category '{category}'. Available: {', '.join(available)}"
        )
