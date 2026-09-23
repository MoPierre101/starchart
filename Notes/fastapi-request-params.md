# FastAPI path params vs. query params

_2026-09-18_

A `GET` request has no body, so everything rides in the URL. FastAPI splits a
URL into two kinds of input based on *where a name is written*, not how it's
declared in the function body:

```
GET /search/tmdb?query=matrix&limit=10
     └──┬──┘└─┬─┘ └──────────┬──────────┘
     prefix  path param      query params
```

* **Path param** — the name appears inside `{curly braces}` in the route
  string itself: `@router.get("/{provider}")`. Required, part of the URL's
  identity/resource path. Use for "which resource" (`/search/tmdb` vs.
  `/search/igdb` conceptually differ).
* **Query param** — a name that is *not* in the route's path template but
  appears in the function signature as a plain scalar type. Optional-ish,
  order-independent, used for filters/settings on top of the identified
  resource (`?query=matrix&limit=5`).

You can't make something a query param by writing it in `{}` in the path —
that makes it a path param and changes the URL shape entirely
(`/search/tmdb/matrix/10` vs. `/search/tmdb?query=matrix&limit=10`). Whether a
given piece of data is a path or query param is a REST design choice, not
just a technical requirement — either could technically work
(`provider: str = Query(...)` is valid too), but path params read as "what
you're searching," query params read as "how."

## `Query()`
Doesn't put anything into the URL — it declares how to *read and validate* a
value FastAPI already expects from the query string.

```python
query: str = Query(..., min_length=1),
limit: int = Query(20, ge=1, le=50),
```

* `Query(..., min_length=1)` — `...` (`Ellipsis`) means required, no default;
  `min_length=1` additionally blocks an empty string.
* `Query(20, ge=1, le=50)` — `20` is a real default (so optional);
  `ge`/`le` = "greater/less than or equal" (≥ / ≤), plain numeric bounds.
  `gt`/`lt` exist too for strict inequalities. Values outside range → FastAPI
  auto-rejects with 422 before the function body runs.

A plain scalar param with no `Query()` at all still gets inferred as a query
param by default — `Query()` is only required when you need extra validation
(`min_length`, `ge`/`le`, description for `/docs`, etc.), not just to mark
something as coming from the query string.
