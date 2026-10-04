# Layered vs clean architecture

_2026-09-23, rewritten 2026-10-03_

## The difference

- **Layered:** code is split into layers (web, app logic, outside services). Each layer calls the one below it.
- **Clean:** same split, plus one rule: **imports point inward.** The app logic never imports the web layer or the outside-service layer. Instead, the app logic says "I need something that can do X" (an interface), and the outside layer provides it.
- Folders alone don't make it clean. Check the imports.

## StarChart's layers (`backend/app/features/external_search/`)

| Folder | One question it answers | Files |
| --- | --- | --- |
| `presentation/` | How does a web request come in and go out? | `router.py`, `schemas.py`, `exception_handlers.py` |
| `application/` | What is the app being asked to do? | `service.py`, `search_provider.py`, `models.py`, `errors.py` |
| `infrastructure/` | How do we talk to the outside world? | `metron.py` |
| `domain/` (not created) | What StarChart rule is true no matter what? | Nothing yet. Add it when a real rule exists. |

Shared settings live in `backend/app/core/config.py`, not inside a feature.

## Who imports whom

```text
presentation  →  application  ←  infrastructure
```

- `presentation` imports `application` (the service, models, errors).
- `infrastructure` imports `application` (the interface it fills in, models, errors).
- `application` imports neither.
- `main.py` is the one place allowed to import everything. It plugs the pieces together.

## Who knows what

| Part | Knows about | Doesn't know about |
| --- | --- | --- |
| `presentation` | FastAPI, the service | Metron, httpx2, API keys |
| `application` | What a search needs, the `SearchProvider` interface | FastAPI, Metron, httpx2 |
| `infrastructure` | Metron, httpx2, the interface it fills in | FastAPI routes |
| `main.py` | Everything | No logic, just setup |

## A request, step by step

```text
GET /external-search/series?query=batman
  → presentation/router.py      reads the query, gets the service
  → application/service.py      "search series for batman"
  → infrastructure/metron.py    calls Metron, turns its JSON into a Series
```

## The interface (`application/search_provider.py`)

- `SearchProvider` is a list of methods the service needs: "search series", "get series", "get issues", "get issue".
- It doesn't call anything itself. It's a promise.
- `MetronProvider` keeps that promise. The service only ever sees "a SearchProvider", never "Metron".
- Why bother: in a test, hand the service a fake provider and no real Metron call happens.

## Plugging it together (`main.py`)

```python
async with httpx2.AsyncClient(...) as metron_client:
    app.state.search_service = ExternalSearchService(MetronProvider(metron_client))
    yield
```

- At startup, `main.py` builds the Metron provider, puts it in the service, and stores the service on `app.state`.
- The router just reads `request.app.state.search_service`. It never imports `infrastructure`.
- See `fastapi-lifespan.md` for how `yield` works here.

## Where does this code go?

Ask what it's *for*:

- Metron JSON → `Series` model: `infrastructure`
- `Series` → web response: `presentation`
- A StarChart rule (e.g. "what comes next"): `domain`

A folder called `models` or `schemas` isn't a layer by itself. What matters is what the code is for.

## Folder name history

`presentation/application/infrastructure` → renamed to `endpoints/orchestration/external` (2026-10-01) → renamed back (2026-10-03). Same layers each time, just different names.

## Still to do

- Add tests: the service with a fake provider, Metron JSON → models using saved responses, and error → status code mapping.

## Sources

- [Robert C. Martin, The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Alistair Cockburn, Hexagonal / Ports & Adapters keynote (iSAQB, 2025)](https://conferences.isaqb.org/software-architecture-gathering/sag-2025-keynote-alistair-cockburn-the-hexagonal-or-ports-adapters-architecture/)
- [Herberto Graça, Ports & Adapters Architecture](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)
- [Martin Fowler, Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- [Microsoft, Common web application architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- [FastAPI, Lifespan events](https://fastapi.tiangolo.com/advanced/events/)
- [Starlette, Applications (app.state)](https://github.com/encode/starlette/blob/master/docs/applications.md)
