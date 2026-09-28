# Search errors and media type enums

_2026-09-28_

## Current exception flow

Exceptions do not choose HTTP status codes themselves. The presentation layer
translates known application exceptions into HTTP responses:

* `UnknownCategoryError` becomes `404`.
* `ProviderSearchError` becomes `502`.
* TMDB HTTP failures and network failures are translated into
  `ProviderSearchError` inside `TMDBProvider`.
* Any other unhandled exception reaches Starlette's server error middleware and
  produces a generic `500 Internal Server Error` response when debug mode is
  off. The exception is still re-raised so the server can log it.

The current `TMDBProvider.search_by_id()` raises `ValueError` for an unsupported
`media_type`. The route does not catch that exception, so invalid client input
currently becomes a 500 instead of a validation response.

## Media type enum

Python 3.14 supports `StrEnum`, which is appropriate for values that cross the
JSON API boundary:

```python
from enum import StrEnum


class MediaType(StrEnum):
    MOVIE = "movie"
    TV = "tv"
    COMIC = "comic"
```

Use `MediaType` in the normalized result model. For the TMDB by ID query, use a
narrower enum containing only `movie` and `tv`, or validate provider
capabilities in the application layer. A single broad enum would accept
`comic` at the request boundary even though TMDB cannot handle it.

Typing a FastAPI parameter as an enum makes invalid values fail request
validation before the route body runs, and publishes the allowed values in the
generated OpenAPI documentation. Pydantic validates enum members and their
values and serializes enum instances to their values in JSON.

## 2026-09-28: Where enum conversion happens

There are two separate trust boundaries:

* For requester input, annotate the FastAPI query parameter with the enum.
  FastAPI and Pydantic perform the conversion before the route body runs.
* For TMDB response data, explicitly call `MediaType(raw_value)` while
  normalizing. A matching string returns its enum member. An unknown value
  raises `ValueError`, which the normalizer can catch and skip.

```python
try:
    media_type = MediaType(item.get("media_type"))
except ValueError:
    continue

results.append(self._normalize_single_item(item, media_type))
```

This replaces the string membership check but does not remove response
validation. Request validation cannot guarantee that an external provider's
response is valid.

## 2026-09-28: Avoid duplicating category and media type

Do not create overlapping enums, category-to-type tables, and provider
capability sets for the current design. Those structures repeat information.
Keep one `MediaType` enum as the application's vocabulary.

For TMDB multi-search normalization, `MediaType(raw_value)` is sufficient to
discard `person` when the enum only contains `movie`, `tv`, and `comic`. A
second `movie` or `tv` membership check is only defensive against TMDB
returning another valid StarChart type such as `comic`; TMDB documents multi
search as returning movies, TV shows, and people.

The by-ID route currently receives both `category` and `media_type`. If media
type already determines dispatch (`movie` and `tv` use TMDB, `comic` uses
Metron), then `category` is redundant on that route. Prefer accepting one
`MediaType` and dispatching from it. If category remains necessary for another
business reason, one simple compatibility check is unavoidable, but it does
not require another enum.

## 2026-09-28 (later): Current state after the error-handling refactor

Supersedes "Current exception flow" above.

* **Routes no longer catch errors.** Each application error has its own
  `@app.exception_handler` in `backend/app/main.py`, returning
  `{"detail": str(exception)}`. See `python-custom-exceptions.md` for the recipe.

| Error | Status | Raised when |
|---|---|---|
| `UnknownCategoryError` | 404 | category has no provider |
| `ProviderNotFoundError` | 404 | provider returns 404 for an item |
| `UnsupportedMediaTypeError` | 400 | valid `MediaType`, but provider doesn't serve it |
| `ProviderSearchError` | 502 | other upstream bad status or network failure |

* **Not found is no longer a 502.** `TMDBProvider._client` turns a TMDB 404
  into `ProviderNotFoundError` and every other bad status into
  `ProviderSearchError`.
* **The unsupported `media_type` 500 is fixed.** Each provider declares
  `supported_media_types` as a class attribute (TMDB: `movie`, `tv`; Metron:
  `comic`). It's part of the `SearchProvider` protocol.
  `ExternalSearchService.search_by_id` checks it before calling the provider,
  so providers don't repeat the check.
* **400 vs 422.** `422` = not a `MediaType` at all (FastAPI rejects it before
  the route runs). `400` = a real `MediaType` that this provider doesn't
  handle.
* **Reverses an earlier recommendation.** "Avoid duplicating category and
  media type" advised against provider capability sets. The project went with
  a single `MediaType` enum plus per-provider `supported_media_types`, so each
  provider's capabilities sit next to its code and are checked in one place
  (the service).

## Sources

* https://fastapi.tiangolo.com/tutorial/handling-errors/
* https://fastapi.tiangolo.com/tutorial/path-params/#predefined-values
* https://docs.pydantic.dev/latest/api/standard_library_types/#enums
* https://docs.python.org/3.14/library/enum.html#enum.StrEnum
* https://developer.themoviedb.org/reference/search-multi
