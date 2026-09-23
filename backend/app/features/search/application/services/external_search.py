from app.features.search.application.interfaces.search_provider import SearchProvider
from app.features.search.application.schemas.search import MediaSearchResult


class UnknownProviderError(ValueError):
    def __init__(self, provider: str, available: list[str]):
        self.provider = provider
        self.available = available
        super().__init__(f"Unknown provider '{provider}'. Available: {', '.join(available)}")


class ExternalSearchService:
    """Dispatches a search to the requested provider strategy."""

    def __init__(self, providers: dict[str, SearchProvider]):
        self._providers = providers

    @property
    def available_providers(self) -> list[str]:
        return list(self._providers)

    async def search(self, provider: str, query: str) -> list[MediaSearchResult]:
        strategy = self._providers.get(provider)
        if strategy is None:
            raise UnknownProviderError(provider, self.available_providers)
        return await strategy.search(query)
