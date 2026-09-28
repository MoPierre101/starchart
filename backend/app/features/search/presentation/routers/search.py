from fastapi import APIRouter, Depends, Query

from app.features.search.application.models import MediaType
from app.features.search.application.services.external_search import (
    ExternalSearchService,
)
from app.features.search.presentation.schemas.search import (
    SearchResponse,
    SearchByIDResponse,
    CategoriesResponse,
)

from app.features.search.infrastructure.dependencies.search import get_search_service

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/categories", response_model=CategoriesResponse)
def categories(
    service: ExternalSearchService = Depends(get_search_service),
) -> CategoriesResponse:

    return CategoriesResponse(categories=service.available_categories)


@router.get("/{category}", response_model=SearchResponse)
async def search(
    category: str,
    query: str = Query(..., min_length=1),
    service: ExternalSearchService = Depends(get_search_service),
) -> SearchResponse:
    results = await service.search(category, query)
    return SearchResponse(category=category, query=query, results=results)


@router.get("/by-id/{category}", response_model=SearchByIDResponse)
async def search_by_id(
    category: str,
    id: int = Query(..., gt=0),
    media_type: MediaType = Query(..., min_length=1),
    service: ExternalSearchService = Depends(get_search_service),
) -> SearchByIDResponse:
    result = await service.search_by_id(category, id, media_type)
    return SearchByIDResponse(category=category, id=id, result=result)
