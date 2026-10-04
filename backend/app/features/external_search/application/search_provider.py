from typing import Protocol

from app.features.external_search.application.models import (
    Issue,
    IssuePage,
    Series,
    SeriesPage,
)


class SearchProvider(Protocol):
    """What the search service needs from an external comics source."""

    name: str

    async def search_series(self, query: str, page: int) -> SeriesPage: ...

    async def get_series(self, series_id: int) -> Series: ...

    async def get_series_issues(self, series_id: int, page: int) -> IssuePage: ...

    async def get_issue(self, issue_id: int) -> Issue: ...
