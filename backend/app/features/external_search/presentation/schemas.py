from pydantic import BaseModel

from app.features.external_search.application.models import Issue, Series


class SeriesSearchResponse(BaseModel):
    query: str
    count: int
    page: int
    has_next: bool
    results: list[Series]


class SeriesResponse(BaseModel):
    id: int
    result: Series


class SeriesIssuesResponse(BaseModel):
    series_id: int
    count: int
    page: int
    has_next: bool
    results: list[Issue]


class IssueResponse(BaseModel):
    id: int
    result: Issue
