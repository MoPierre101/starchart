from datetime import date

from pydantic import BaseModel, Field


class Series(BaseModel):
    """A comic series. `desc` is only filled when the series is fetched by ID."""

    provider: str
    external_id: str
    name: str
    volume: int | None = None
    year_began: int | None = None
    year_end: int | None = None
    series_type: str | None = None
    issue_count: int | None = None
    publisher: str | None = None
    gcd_id: int | None = None
    desc: str | None = None
    raw: dict = Field(default_factory=dict)


class Issue(BaseModel):
    """A comic issue. `gcd_id` and `desc` are only filled when the issue is fetched by ID."""

    provider: str
    external_id: str
    series_external_id: str
    number: str | None = None
    cover_date: date | None = None
    store_date: date | None = None
    image_url: str | None = None
    gcd_id: int | None = None
    desc: str | None = None
    raw: dict = Field(default_factory=dict)


class SeriesPage(BaseModel):
    """One page of series results, matching one page from the provider."""

    count: int
    page: int
    has_next: bool
    results: list[Series]


class IssuePage(BaseModel):
    """One page of issue results, matching one page from the provider."""

    count: int
    page: int
    has_next: bool
    results: list[Issue]
