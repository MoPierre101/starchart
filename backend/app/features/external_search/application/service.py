from app.features.external_search.application.models import (
    Issue,
    IssuePage,
    Series,
    SeriesPage,
)
from app.features.external_search.application.search_provider import SearchProvider


class ExternalSearchService:
    """Searches an external comics source for series and issues."""

    def __init__(self, provider: SearchProvider):
        self._provider = provider

    async def search_series(self, query: str, page: int) -> SeriesPage:
        return await self._provider.search_series(query, page)

    async def get_series(self, series_id: int) -> Series:
        return await self._provider.get_series(series_id)

    async def get_series_issues(self, series_id: int, page: int) -> IssuePage:
        return await self._provider.get_series_issues(series_id, page)

    async def get_issue(self, issue_id: int) -> Issue:
        return await self._provider.get_issue(issue_id)
