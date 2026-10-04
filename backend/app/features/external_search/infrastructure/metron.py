import httpx2

from app.features.external_search.application.errors import (
    ProviderNotFoundError,
    ProviderRateLimitedError,
    ProviderSearchError,
)
from app.features.external_search.application.models import (
    Issue,
    IssuePage,
    Series,
    SeriesPage,
)


class MetronProvider:
    """SearchProvider implementation for the Metron Comic Book Database.

    Each method makes exactly one Metron request. Metron allows 20 requests a
    minute and 5,000 a day per account, so list methods return one page and
    never walk every page.
    """

    name = "metron"

    def __init__(self, client: httpx2.AsyncClient):
        # The client is created in main.py with Metron's base URL and token.
        self._client = client

    async def _get_json(self, path: str, params: dict | None = None) -> dict:
        try:
            response = await self._client.get(path, params=params)
            response.raise_for_status()
        except httpx2.HTTPStatusError as exception:
            status_code = exception.response.status_code

            if status_code == 404:
                raise ProviderNotFoundError(
                    self.name, f"item not found on {self.name}"
                ) from exception

            if status_code == 429:
                raise ProviderRateLimitedError(self.name) from exception

            raise ProviderSearchError(
                self.name, f"{status_code} from {self.name}"
            ) from exception
        except httpx2.RequestError as exception:
            raise ProviderSearchError(
                self.name, f"request failed ({exception})"
            ) from exception

        return response.json()

    async def search_series(self, query: str, page: int) -> SeriesPage:
        api_response = await self._get_json(
            "/series/", params={"q": query, "language": "en", "page": page}
        )
        return SeriesPage(
            count=api_response["count"],
            page=page,
            has_next=api_response["next"] is not None,
            results=[self._normalize_series(item) for item in api_response["results"]],
        )

    async def get_series(self, series_id: int) -> Series:
        api_response = await self._get_json(f"/series/{series_id}/")
        return self._normalize_series(api_response)

    async def get_series_issues(self, series_id: int, page: int) -> IssuePage:
        api_response = await self._get_json(
            f"/series/{series_id}/issue_list/", params={"page": page}
        )
        return IssuePage(
            count=api_response["count"],
            page=page,
            has_next=api_response["next"] is not None,
            results=[self._normalize_issue(item) for item in api_response["results"]],
        )

    async def get_issue(self, issue_id: int) -> Issue:
        api_response = await self._get_json(f"/issue/{issue_id}/")
        return self._normalize_issue(api_response)

    def _normalize_series(self, item: dict) -> Series:
        # The search list sends the display name ("Absolute Batman (2024)") as
        # "series"; the detail endpoint sends the plain name as "name".
        name = item.get("name") or item.get("series") or "Untitled"
        series_type = item.get("series_type") or {}
        publisher = item.get("publisher") or {}

        return Series(
            provider=self.name,
            external_id=str(item["id"]),
            name=name,
            volume=item.get("volume"),
            year_began=item.get("year_began"),
            year_end=item.get("year_end"),
            series_type=series_type.get("name"),
            issue_count=item.get("issue_count"),
            publisher=publisher.get("name"),
            gcd_id=item.get("gcd_id"),
            desc=item.get("desc") or None,
            raw=item,
        )

    def _normalize_issue(self, item: dict) -> Issue:
        return Issue(
            provider=self.name,
            external_id=str(item["id"]),
            series_external_id=str(item["series"]["id"]),
            number=item.get("number"),
            cover_date=item.get("cover_date"),
            store_date=item.get("store_date"),
            image_url=item.get("image"),
            gcd_id=item.get("gcd_id"),
            desc=item.get("desc") or None,
            raw=item,
        )
