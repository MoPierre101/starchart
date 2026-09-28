from pydantic import BaseModel, Field
from enum import StrEnum


class MediaType(StrEnum):
    MOVIE = "movie"
    TV = "tv"
    COMIC = "comic"
    GAME = "game"


class MediaSearchResult(BaseModel):
    """Normalized result returned by any external search provider."""

    provider: str
    external_id: str
    title: str
    media_type: MediaType
    poster_url: str | None = None
    release_year: int | None = None
    overview: str | None = None
    raw: dict = Field(default_factory=dict)
