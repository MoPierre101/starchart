# Layered vs clean architecture

_2026-09-23_

## Difference

- Layered architecture separates responsibilities such as HTTP presentation, application behavior, and data sources. Calls and code dependencies commonly run top to bottom.
- Clean architecture also separates responsibilities, but requires source code dependencies to point inward. Application rules define the interfaces they need; external adapters implement them; the outer application setup connects them.
- A folder structure alone does not establish either architecture. Check imports and where business decisions live.

## StarChart backend at initial review

- Runtime request path: `routers/search.py` -> `services/external_search.py` -> `providers/tmdb.py`. `providers/base.py` declares the provider protocol and error. `main.py` registers the router.
- This is a sensible small layered design with a provider port (`SearchProvider`) and TMDB adapter. The search service currently only dispatches to a named provider. There is no substantial domain logic or persistence layer yet.
- It is not strict clean architecture: `services/external_search.py` imports concrete `TMDBProvider` and settings to build itself, and its protocol lives under `providers`; `providers/base.py` imports a Pydantic model from `schemas`, which is also used as the HTTP response shape; and the route imports the provider layer's error type.
- Move provider construction into an outer composition module or FastAPI dependency when the boundary matters. Keep service code dependent on the provider protocol only. Put the normalized search result type in an application-owned module and map it to an HTTP response schema in the router if the API shape diverges.
- Do not add empty `domain`, `repository`, or database layers solely to match a diagram. Add them when a real DCU use case or persistence need appears.

## Concrete implementation points

- `TMDBProvider.search` creates an `httpx.AsyncClient` for every call, so connection pooling cannot span requests. If search traffic warrants it, create one client during app lifespan, inject it into the provider, and close it on shutdown.
- The service silently slices to `limit` before filtering unsupported media types, so it can return fewer than `limit` supported results even when later results qualify. Filter first, then apply the limit if `limit` means maximum supported results.
- `httpx` is directly imported but absent from direct project dependencies. Declare it directly when editing dependencies.
- Add focused tests when changing behavior: service with a fake provider, TMDB normalization with sample payloads, and route error mapping using dependency overrides.

## Rule of thumb and current folder model

_2026-09-23_

| Layer | One question to ask | Current example |
| --- | --- | --- |
| Presentation | How does an HTTP request enter and leave? | `presentation/routers/search.py`, `presentation/schemas/search.py` |
| Application | What action is the user asking the app to perform? | `application/services/external_search.py`, `application/interfaces/search_provider.py`, `application/models/search.py` |
| Domain | What StarChart rule is true even without FastAPI, TMDB, or a database? | No domain module yet; a future prerequisite or recommendation rule would fit here. |
| Infrastructure | How do we talk to outside systems, read settings, and connect concrete implementations? | `infrastructure/providers/tmdb.py`, `infrastructure/config.py`, `infrastructure/dependencies/search.py` |

Request flow:

```text
HTTP request
  -> presentation router (parse request, choose HTTP response)
  -> application service (coordinate the search use case)
  -> infrastructure TMDB provider (make the external request)
```

Code dependencies at the provider boundary: `application service -> SearchProvider interface <- TMDB provider`. The interface describes a capability; it does not execute a request. `infrastructure/dependencies/search.py` constructs the concrete provider and gives the service its provider registry. This is setup code, not search behavior. The service depends on the interface, not on `TMDBProvider`. The domain layer can be absent until there is a real StarChart rule to hold.

Classify a transformation by its purpose: TMDB JSON to a common result belongs to infrastructure; a result to an HTTP response belongs to presentation; a franchise prerequisite decision belongs to domain. A `models` or `schemas` folder is a naming choice, not a layer by itself.

## Sources

- [Martin Fowler, Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- [Robert C. Martin, The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [FastAPI, Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [HTTPX, Async Support](https://www.python-httpx.org/async/)
