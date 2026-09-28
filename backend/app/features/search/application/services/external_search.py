from app.features.search.application.errors import (
    UnknownCategoryError,
    UnsupportedMediaTypeError,
)
from app.features.search.application.interfaces.search_provider import SearchProvider
from app.features.search.application.models import MediaSearchResult, MediaType


class ExternalSearchService:
    """Dispatches a search to the provider assigned to a media category."""

    def __init__(self, providers_by_category: dict[str, SearchProvider]):
        self._providers_by_category = providers_by_category

    @property
    def available_categories(self) -> list[str]:
        return list(self._providers_by_category)

    async def search(self, category: str, query: str) -> list[MediaSearchResult]:
        provider = self._providers_by_category.get(category)
        if provider is None:
            raise UnknownCategoryError(category, self.available_categories)
        return await provider.search(query)

    async def search_by_id(
        self, category: str, visual_media_id: int, media_type: MediaType
    ) -> MediaSearchResult:
        provider = self._providers_by_category.get(category)
        if provider is None:
            raise UnknownCategoryError(category, self.available_categories)
        if media_type not in provider.supported_media_types:
            raise UnsupportedMediaTypeError(
                provider.name, media_type, list(provider.supported_media_types)
            )
        return await provider.search_by_id(visual_media_id, media_type)
