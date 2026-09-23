from typing import Protocol

from app.features.search.application.schemas.search import MediaSearchResult


class ProviderSearchError(RuntimeError):
    """Raised when a provider's upstream request fails (bad status, network error)."""

    def __init__(self, provider: str, message: str):
        self.provider = provider
        super().__init__(f"{provider} search failed: {message}")


class SearchProvider(Protocol):
    """Strategy interface. Each external source implements this the same way."""

    name: str

    async def search(self, query: str) -> list[MediaSearchResult]: ...
