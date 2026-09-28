# Pluggable-provider pattern (Strategy + Registry + Factory + DI)

_2026-09-18_

The `ExternalSearchService` / `SearchProvider` setup in `backend/app/` is a
stack of four named patterns, each solving a different sub-problem:

1. **Strategy** — `SearchProvider` is the interface (a `Protocol`, see
   `fastapi-essentials.md`); `TMDBProvider` (and future providers) are
   interchangeable implementations of `search()`. Lets you swap the search
   implementation without changing calling code.
2. **Registry** — a `dict[str, SearchProvider]` inside `ExternalSearchService`
   mapping a name (`"tmdb"`) to a strategy instance. Enables lookup-by-string
   (`self._providers.get(provider)`) instead of hardcoded
   `if provider == "tmdb": ...` branches, and is what
   `available_providers` (`list(self._providers)` — a dict's keys) reflects
   back.
3. **Factory** — `get_search_service()` constructs and assembles the
   registry (which providers exist, what config each needs, e.g. API keys).
   Calling code doesn't need to know construction details.
4. **Dependency Injection** — the factory is passed to FastAPI's
   `Depends(get_search_service)` rather than called directly by the route.
   FastAPI calls it per-request and injects the result — this is what makes
   it swappable with a fake in tests.

## Building vs. dispatching are separate steps
`get_search_service()` builds an `ExternalSearchService` loaded with **every**
registered provider every time — this is cheap (just constructs Python
objects, e.g. sets `self._api_key = ...`), no network call happens here.

```python
async def search(self, provider: str, query: str, *, limit: int = 20) -> list[MediaSearchResult]:
    strategy = self._providers.get(provider)   # pick ONE entry out of the dict, by name
    if strategy is None:
        raise UnknownProviderError(provider, self.available_providers)
    return await strategy.search(query, limit=limit)   # only this one actually runs
```

`ExternalSearchService.search()` is the only place that picks *one* provider
by name and actually calls it — that's the only point a real external API
call happens. A request to `/search/tmdb` never touches `IGDBProvider` even
if it's sitting in the same registry, unused.

Net effect: adding a third provider is a one-line change in
`get_search_service()`'s dict — `ExternalSearchService` itself never changes,
because its job (dispatch by name) is generic.

## 2026-09-27: Simplifying the fixed category search

The current registry maps a media category such as `visual_media` to a source
such as `TMDBProvider`. The earlier provider-name route description above is
historical. Only TMDb is registered today.

- Keep the small service while it owns the category lookup and unknown-category
  error. It keeps concrete source classes out of the route. A factory class or
  a broad `Media` class would add work without serving the current flow.
- FastAPI's dependency function is enough to assemble the service and can be
  replaced in tests. The `SearchProvider` protocol is a type contract, not a
  runtime plugin system.
- `TMDBProvider` repeats authorization, client setup, status handling, and
  error translation in three methods. A private request helper could remove
  that repetition. Share an `httpx.AsyncClient` across requests only when
  connection reuse matters, with an explicit shutdown step.
- `TMDBProvider.search_id()` currently claims to return `MediaSearchResult` but
  returns raw JSON. Give the raw detail response an honest type or normalize it
  before using it. `MetronProvider._normalize_each_item()` never returns `None`,
  so its optional type and caller check are unnecessary when Metron is edited.
- A small `_client()` helper can hold the TMDb authorization, base URL, and
  timeout. A `_get_json(client, path, params)` helper can hold GET, status
  checking, and provider error translation. Pass the same client through the
  season loop so it still reuses one connection for all season requests.
- TMDb multi-search documents `language`, singular. The current search method
  sends `languages`, plural; correct that parameter when editing `tmdb.py`.

## Sources

- https://fastapi.tiangolo.com/tutorial/dependencies/
- https://fastapi.tiangolo.com/advanced/testing-dependencies/
- https://docs.python.org/3/library/typing.html
- https://www.python-httpx.org/async/
- https://developer.themoviedb.org/reference/search-multi
