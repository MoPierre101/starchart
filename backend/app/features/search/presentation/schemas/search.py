from pydantic import BaseModel
from app.features.search.application.models import MediaSearchResult


class SearchResponse(BaseModel):
    category: str
    query: str
    results: list[MediaSearchResult]


class SearchByIDResponse(BaseModel):
    category: str
    id: int
    result: MediaSearchResult


class CategoriesResponse(BaseModel):
    categories: list[str]
