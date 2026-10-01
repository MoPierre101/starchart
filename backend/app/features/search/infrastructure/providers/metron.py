import httpx
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from app.features.search.application.errors import (
    ProviderNotFoundError,
    ProviderSearchError,
)
from app.features.search.application.models import MediaSearchResult, MediaType
from app.features.search.infrastructure.config import settings


class MetronProvider:
    """SearchProvider implementation for Metron Comic Book Database."""

    name = "metron"
    supported_media_types: tuple = (MediaType.COMIC,)

    def __init__(self, api_key: str):
        self._api_key = api_key

    @asynccontextmanager
    async def _context(self) -> AsyncGenerator[httpx.AsyncClient, None]:
        try:
            async with httpx.AsyncClient(
                headers={"Authorization": f"Bearer {self._api_key}"},
                base_url=settings.metron_base_url,
                timeout=10,
            ) as client:
                yield client
        except httpx.HTTPStatusError as exception:
            if exception.response.status_code == 404:
                raise ProviderNotFoundError(
                    self.name, f"item not found on {self.name}"
                ) from exception
            raise ProviderSearchError(
                self.name, f"{exception.response.status_code} from {self.name}"
            ) from exception
        except httpx.RequestError as exception:
            raise ProviderSearchError(
                self.name, f"request failed ({exception})"
            ) from exception

    async def search(self, query: str) -> list[MediaSearchResult]:
        async with self._context() as client:
            response = await client.get(
                "/series/", params={"q": query, "language": "en"}
            )
            response.raise_for_status()
            api_response = response.json()

            return self._normalize_api_response(api_response)

    async def search_by_id(
        self, id: int, media_type: MediaType
    ) -> MediaSearchResult: ...

    def _normalize_api_response(
        self, raw_api_response: dict
    ) -> list[MediaSearchResult]:
        results = []

        for item in raw_api_response.get("results", []):
            results.append(self._normalize_single_item(item))

        return results

    def _normalize_single_item(
        self, item: dict, media_type: MediaType = MediaType.COMIC
    ) -> MediaSearchResult:
        title = item.get("series") or item.get("issue") or "Untitled"
        release_date = item.get("year_began") or ""
        poster_path = item.get("poster_path") or ""

        return MediaSearchResult(
            provider=self.name,
            external_id=str(item["id"]),
            title=title,
            media_type=media_type,
            poster_url=(
                f"{settings.metron_image_base_url}{poster_path}"
                if poster_path
                else None
            ),
            release_year=(release_date if release_date else None),
            overview=item.get("desc") or "",
            raw=item,
        )
