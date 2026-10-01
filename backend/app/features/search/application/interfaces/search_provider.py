from typing import Protocol

from app.features.search.application.models import MediaSearchResult, MediaType


class SearchProvider(Protocol):
    """Strategy interface. Each external source implements this the same way."""

    name: str
    supported_media_types: tuple[MediaType, ...]

    async def search(self, query: str) -> list[MediaSearchResult]: ...

    async def search_by_id(
        self, id: int, media_type: MediaType
    ) -> MediaSearchResult: ...
