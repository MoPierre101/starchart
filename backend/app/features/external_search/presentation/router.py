from fastapi import APIRouter, Depends, Path, Query, Request

from app.features.external_search.application.service import ExternalSearchService
from app.features.external_search.presentation.schemas import (
    IssueResponse,
    SeriesIssuesResponse,
    SeriesResponse,
    SeriesSearchResponse,
)

router = APIRouter(prefix="/external-search", tags=["external search"])


def get_search_service(request: Request) -> ExternalSearchService:
    # Built once at startup in main.py's lifespan and stored on app.state.
    return request.app.state.search_service


@router.get("/series", response_model=SeriesSearchResponse)
async def search_series(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    service: ExternalSearchService = Depends(get_search_service),
) -> SeriesSearchResponse:
    series_page = await service.search_series(query, page)
    return SeriesSearchResponse(
        query=query,
        count=series_page.count,
        page=series_page.page,
        has_next=series_page.has_next,
        results=series_page.results,
    )


@router.get("/series/{id}", response_model=SeriesResponse)
async def get_series(
    id: int = Path(..., gt=0),
    service: ExternalSearchService = Depends(get_search_service),
) -> SeriesResponse:
    series = await service.get_series(id)
    return SeriesResponse(id=id, result=series)


@router.get("/series/{id}/issues", response_model=SeriesIssuesResponse)
async def get_series_issues(
    id: int = Path(..., gt=0),
    page: int = Query(1, ge=1),
    service: ExternalSearchService = Depends(get_search_service),
) -> SeriesIssuesResponse:
    issue_page = await service.get_series_issues(id, page)
    return SeriesIssuesResponse(
        series_id=id,
        count=issue_page.count,
        page=issue_page.page,
        has_next=issue_page.has_next,
        results=issue_page.results,
    )


@router.get("/issues/{id}", response_model=IssueResponse)
async def get_issue(
    id: int = Path(..., gt=0),
    service: ExternalSearchService = Depends(get_search_service),
) -> IssueResponse:
    issue = await service.get_issue(id)
    return IssueResponse(id=id, result=issue)
