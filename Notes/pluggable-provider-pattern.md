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
