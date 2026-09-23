from fastapi import APIRouter, Depends, HTTPException, Query

from app.features.search.application.interfaces.search_provider import ProviderSearchError
from app.features.search.application.services.external_search import ExternalSearchService, UnknownProviderError
from app.features.search.infrastructure.dependencies.search import get_search_service
from app.features.search.presentation.schemas.search import SearchResponse, ProvidersResponse

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/providers" ,response_model=ProvidersResponse)
def providers(service: ExternalSearchService = Depends(get_search_service))-> ProvidersResponse:

    return ProvidersResponse(providers=service.available_providers)

@router.get("/{provider}", response_model=SearchResponse)
async def search(
    provider: str,
    query: str = Query(..., min_length=1),
    service: ExternalSearchService = Depends(get_search_service),
) -> SearchResponse:
    try:
        results = await service.search(provider, query)
    except UnknownProviderError as exception:
        raise HTTPException(status_code=404, detail=str(exception)) from exception
    except ProviderSearchError as exception:
        raise HTTPException(status_code=502, detail=str(exception)) from exception

    return SearchResponse(provider=provider, query=query, results=results)
