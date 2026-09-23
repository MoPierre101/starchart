import httpx

from app.features.search.application.interfaces.search_provider import ProviderSearchError
from app.features.search.application.schemas.search import MediaSearchResult
from app.features.search.infrastructure.config import settings




class TMDBProvider:
    """SearchProvider implementation for The Movie Database."""

    name = "tmdb"

    def __init__(self, api_key: str):
        self._api_key = api_key

    async def search(self, query: str) -> list[MediaSearchResult]:
        try:
            async with httpx.AsyncClient(base_url=settings.tmdb_base_url, timeout=10) as client:
                response = await client.get(
                    "/search/multi",
                    params={"api_key": self._api_key, "query": query, "include_adult": False},
                )
                response.raise_for_status()
                api_response = response.json()
        except httpx.HTTPStatusError as exception:
            raise ProviderSearchError(self.name, f"{exception.response.status_code} from TMDB") from exception
        except httpx.RequestError as exception:
            raise ProviderSearchError(self.name, f"request failed ({exception})") from exception

        results: list[MediaSearchResult] = []
        for item in api_response.get("results", []):
            result = self._normalize_each_item(item)
            if result is not None:
                results.append(result)

        return results

    def _normalize_each_item(self, item: dict) -> MediaSearchResult | None:
        media_type = item.get("media_type", "unknown")
        if media_type not in ("movie", "tv"):
            return None

        title = item.get("title") or item.get("name") or "Untitled"
        release_date = item.get("release_date") or item.get("first_air_date") or ""
        poster_path = item.get("poster_path")

        return MediaSearchResult(
            provider=self.name,
            external_id=str(item["id"]),
            title=title,
            media_type=media_type,
            poster_url=f"{settings.tmdb_image_base_url}{poster_path}" if poster_path else None,
            release_year=int(release_date[:4]) if release_date[:4].isdigit() else None,
            overview=item.get("overview"),
            raw=item,
        )
