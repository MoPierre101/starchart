from pydantic import BaseModel, Field


class MediaSearchResult(BaseModel):
    """Normalized result returned by any external search provider."""

    provider: str
    external_id: str
    title: str
    media_type: str
    poster_url: str | None = None
    release_year: int | None = None
    overview: str | None = None
    raw: dict = Field(default_factory=dict)
