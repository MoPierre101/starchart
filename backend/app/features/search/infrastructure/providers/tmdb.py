from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import httpx

from app.features.search.application.errors import (
    ProviderNotFoundError,
    ProviderSearchError,
)
from app.features.search.application.models import MediaSearchResult, MediaType
from app.features.search.infrastructure.config import settings


class TMDBProvider:
    """SearchProvider implementation for The Movie Database."""

    name = "tmdb"
    supported_media_types: tuple = (MediaType.MOVIE, MediaType.TV)

    def __init__(self, api_key: str):
        self._api_key = api_key

    @asynccontextmanager
    async def _client(self) -> AsyncGenerator[httpx.AsyncClient, None]:
        try:
            async with httpx.AsyncClient(
                headers={"Authorization": f"Bearer {self._api_key}"},
                base_url=settings.tmdb_base_url,
                timeout=10,
            ) as client:
                yield client
        except httpx.HTTPStatusError as exception:
            if exception.response.status_code == 404:
                raise ProviderNotFoundError(
                    self.name, "item not found on {self.name}"
                ) from exception
            raise ProviderSearchError(
                self.name, f"{exception.response.status_code} from {self.name}"
            ) from exception
        except httpx.RequestError as exception:
            raise ProviderSearchError(
                self.name, f"request failed ({exception})"
            ) from exception

    async def search(self, query: str) -> list[MediaSearchResult]:
        async with self._client() as client:
            response = await client.get(
                "/search/multi",
                params={
                    "query": query,
                    "language": "en-US",
                    "include_adult": False,
                },
            )
            response.raise_for_status()
            return self._normalize_api_response(response.json())

    async def search_by_id(self, id: int, media_type: MediaType) -> MediaSearchResult:
        async with self._client() as client:
            response = await client.get(
                f"/{media_type}/{id}", params={"language": "en-US"}
            )
            response.raise_for_status()
            return self._normalize_single_item(response.json(), media_type)

    async def get_episodes(self, id: int, number_of_seasons: int) -> list[dict]:
        """Return episodes from each numbered season of a TV series."""
        if number_of_seasons < 0:
            raise ValueError("number_of_seasons must be non-negative")

        episodes: list[dict] = []

        async with self._client() as client:
            for season_number in range(1, number_of_seasons + 1):
                response = await client.get(
                    f"/tv/{id}/season/{season_number}",
                    params={"language": "en-US"},
                )
                response.raise_for_status()
                episodes.extend(response.json()["episodes"])

            return episodes

    def _normalize_api_response(
        self, raw_api_response: dict
    ) -> list[MediaSearchResult]:
        results = []

        for item in raw_api_response.get("results", []):
            try:
                media_type = MediaType(item.get("media_type", "unknown"))
            except ValueError:
                continue

            results.append(self._normalize_single_item(item, media_type))

        return results

    def _normalize_single_item(
        self, item: dict, media_type: MediaType
    ) -> MediaSearchResult:
        title = item.get("title") or item.get("name") or "Untitled"
        release_date = item.get("release_date") or item.get("first_air_date") or ""
        poster_path = item.get("poster_path")

        return MediaSearchResult(
            provider=self.name,
            external_id=str(item["id"]),
            title=title,
            media_type=media_type,
            poster_url=(
                f"{settings.tmdb_image_base_url}{poster_path}" if poster_path else None
            ),
            release_year=(
                int(release_date[:4]) if release_date[:4].isdigit() else None
            ),
            overview=item.get("overview"),
            raw=item,
        )
