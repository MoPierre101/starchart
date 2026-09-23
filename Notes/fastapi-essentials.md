# FastAPI essentials

_2026-09-18_

Beyond type-hint-driven request/response schemas, the things that actually
matter day to day:

## Pydantic does the validation, not you
Request bodies, query/path params, and response shapes are all Pydantic
models. FastAPI parses incoming JSON into them and rejects bad input with a
422 before your function body ever runs — don't hand-write validation for
anything a type hint or Pydantic `Field`/validator can express. Pydantic v2's
core is Rust and is ~5-50x faster than v1, so validation cost is basically
free.

`response_model` (or a plain return-type annotation) also filters/shapes the
*outgoing* data — it strips fields not on the model, so it doubles as a
"don't leak this field" mechanism (e.g. a `UserOut` without `hashed_password`).

## Dependency injection (`Depends`) is the core extension point
Use it for anything that should run before a route body: DB session/connection
lifetime, auth/current-user resolution, pagination params, rate limiting,
feature flags. Dependencies:
* **Nest** — a dependency can itself depend on other dependencies, and FastAPI
  resolves the whole graph.
* **Cache per-request** — if the same dependency is used twice in one
  request's resolution graph, it only runs once by default.
* **Don't need to be used** to have an effect — `Depends(verify_admin)` in a
  route signature runs the check even if the route body never touches the
  return value. Good for auth/pre-checks.
* Keep each one narrowly scoped (one job) rather than bundling unrelated
  concerns into a single mega-dependency.

Avoid global state/singletons for things like DB connections — wire them
through `Depends` so they're request-scoped and swappable in tests.

## Async vs. sync — pick per-endpoint, not globally
* `async def` route: runs on the event loop. Only await genuinely async I/O
  (async DB driver, httpx async client, etc.). A blocking call inside an
  `async def` route (sync DB driver, `requests`, `time.sleep`) freezes the
  *entire* event loop for every other in-flight request, not just this one.
* `def` (sync) route: FastAPI runs it in a thread pool automatically. Fine
  for CPU-light sync code, but thread-pool dispatch has overhead — don't make
  everything sync "to be safe."
* Rule of thumb: if everything you call in the handler is async-native, make
  the route `async def`; if you're stuck with a sync library, leave the route
  `def` and let FastAPI's thread pool handle it (or push real CPU-bound work
  further out to a worker/task queue).

## Background work
* `BackgroundTasks` (injected via the route) — fire-and-forget work that
  should happen after the response is sent but still lives inside the request
  lifecycle (e.g. send a confirmation email). No retry, no persistence — if
  the process dies, the task is gone.
* For anything that needs retries, scheduling, or to survive a process
  restart (reindexing, long-running jobs), that's a real task queue
  (Celery, ARQ, etc.), not `BackgroundTasks`.

## Other things worth knowing
* **Automatic docs**: `/docs` (Swagger UI) and `/redoc` come free from the
  route type hints + Pydantic models — no separate spec to maintain, but it
  means sloppy type hints show up as sloppy public docs.
* **Exception handling**: raise `HTTPException(status_code, detail)` for
  expected error cases; register `@app.exception_handler(SomeError)` for a
  consistent error *shape* across the whole API rather than formatting errors
  ad hoc in every route.
* **Lifespan events** (`@asynccontextmanager` lifespan on the `FastAPI` app)
  replace the older `@app.on_event("startup"/"shutdown")` — this is where a
  DB connection pool gets created once and torn down once, then handed to
  routes via `Depends`.
* **Status codes**: set `status_code=` on the route decorator for anything
  that isn't a plain 200 (201 for create, 204 for delete, etc.) rather than
  leaving callers to infer it.

## `Protocol` vs `ABC` for interfaces (strategy pattern)
When defining an interface that multiple implementations must satisfy (e.g. a
`SearchProvider` interface with a `search()` method for a strategy pattern):

* **`ABC` (abstract base class) = nominal typing.** A class only counts as
  implementing the interface if it explicitly inherits from it
  (`class TMDBProvider(SearchProvider):`). Forgetting a required method fails
  loudly at *instantiation time* — Python raises `TypeError`.
* **`Protocol` (`typing.Protocol`) = structural typing (duck typing,
  formalized).** A class satisfies the interface just by having the right
  shape — matching attributes/methods — with **no inheritance required**.
  `TMDBProvider` doesn't need `class TMDBProvider(SearchProvider):`; it just
  needs a `name` attribute and a compatible `async def search(...)` method.
* Protocol mismatches are only caught by a **static type checker**
  (mypy/pyright) or at the actual call site — not at instantiation. Less
  ceremony, but weaker runtime guarantees than `ABC`.
* Protocol is a better fit when implementations shouldn't be coupled to the
  interface module, or might already inherit from something else (e.g. a
  third-party SDK's client class) — Python doesn't handle inheriting from
  multiple unrelated bases cleanly, but Protocols sidestep that since there's
  no inheritance involved at all.

## Sources
- [FastAPI Fundamentals: Building Your First High-Performance API in 2026](https://blog.paulserban.eu/post/fastapi-fundamentals-building-your-first-high-performance-api-in-2026/)
- [zhanymkanov/fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [FastAPI official docs — Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Beyond the Basics: Unlocking FastAPI's Hidden Potential — DEV Community](https://dev.to/glad_labs/beyond-the-basics-unlocking-fastapis-hidden-potential-with-zhanymkanovfastapi-best-practices-i8c)
- [Advanced Python Dependency Injection with Pydantic and FastAPI](https://blog.naveenpn.com/advanced-python-dependency-injection-with-pydantic-and-fastapi)
