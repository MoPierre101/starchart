from pydantic import BaseModel
from app.features.search.application.schemas.search import MediaSearchResult


class SearchResponse(BaseModel):
    provider: str
    query: str
    results: list[MediaSearchResult]

class ProvidersResponse(BaseModel):
    providers: list[str]
