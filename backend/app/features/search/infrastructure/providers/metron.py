import httpx

from app.features.search.application.errors import ProviderSearchError
from app.features.search.application.models import MediaSearchResult, MediaType
from app.features.search.infrastructure.config import settings

class MetronProvider:
    """SearchProvider implementation for The Movie Database."""

    name = "metron"
    supported_media_types = (MediaType.COMIC,)

    def __init__(self, api_key: str):
        self._api_key = api_key

    async def search(self, query: str) -> list[MediaSearchResult]:
        try:
            headers = {"Authorization": f"Bearer {self._api_key}"}

            async with httpx.AsyncClient(headers=headers, base_url=settings.metron_base_url, timeout=10) as client:
                response = await client.get(
                    "/series",
                    params={"q": query}
                )
                response.raise_for_status()
                api_response = response.json()
        except httpx.HTTPStatusError as exception:
            raise ProviderSearchError(self.name, f"{exception.response.status_code} from Metron") from exception
        except httpx.RequestError as exception:
            raise ProviderSearchError(self.name, f"request failed ({exception})") from exception

        results: list[MediaSearchResult] = []
        for item in api_response.get("results", []):
            result = self._normalize_each_item(item)
            if result is not None:
                results.append(result)

        return results

    def _normalize_each_item(self, item: dict) -> MediaSearchResult | None:

        title = item.get("series") or "Untitled"
        release_date = item.get("year_began") or ""
        poster_path = item.get("poster_path")

        return MediaSearchResult(
            provider=self.name,
            external_id=str(item["id"]),
            title=title,
            media_type="comic",
            poster_url=f"{settings.metron_image_base_url}{poster_path}" if poster_path else None,
            release_year=int(release_date[:4]) if release_date[:4].isdigit() else None,
            overview=item.get("overview"),
            raw=item,
        )
