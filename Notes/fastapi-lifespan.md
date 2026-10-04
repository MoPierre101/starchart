# FastAPI lifespan and yield

_2026-10-03_

## Timeline

`lifespan` is an `@asynccontextmanager`. `yield` splits it into three moments:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: runs once, before any request is served
    yield            # 2. Server runs and serves requests while paused here
    # 3. Shutdown: runs once, after the server is told to stop
```

## Why "after yield" means shutdown

- `yield` means the same thing in every `@asynccontextmanager`: run the body of the caller's `async with`, then resume after it.
- For `lifespan`, the caller is Starlette (`starlette/routing.py`, 1.3.1):
  `async with self.lifespan_context(app) as maybe_state:`. Its body waits until the server is told to stop. So the "body" is the server's entire running life.
- Gotcha: it reads as if `yield` means "on shutdown". It doesn't. Shutdown is just what comes after the body ends.

## Yielding a value vs a bare yield

- `yield value` hands `value` to the caller's `as` target, like a `return` that pauses instead of ending.
- In lifespan, `yield {"key": obj}` is Starlette's "lifespan state": Starlette copies the dict (shallow) onto every request as `request.state.key`. Documented by Starlette, not shown in FastAPI's lifespan page.
- Bare `yield` hands nothing out. Share objects through `app.state` instead; routes read `request.app.state.key`. Easier to read: looks like a global set at startup.

## StarChart pattern (`backend/app/main.py`)

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with httpx2.AsyncClient(...) as metron_client:       # startup: open connection
        app.state.search_service = ExternalSearchService(MetronProvider(metron_client))
        yield                                                  # server runs
    # leaving `async with` at shutdown closes the connection

# router
def get_search_service(request: Request) -> ExternalSearchService:
    return request.app.state.search_service
```

- The `yield` sits inside `async with httpx2.AsyncClient(...)`, so one connection stays open for the server's whole life and closes at shutdown.
- Cost: `app.state` is untyped; a misspelled key fails only when a request hits that route.

## Same idea elsewhere: shared global state

Build it once at the top, store it in one shared place, read it anywhere below without passing it down by hand.

| | Build once | Shared place | Read it |
| --- | --- | --- | --- |
| FastAPI | `main.py` lifespan | `app.state` | `request.app.state.search_service` |
| Spring Boot | `@Bean` method in a `@Configuration` class | Spring container (beans are singletons by default) | Spring passes it into the constructor |
| React | `new QueryClient()` / `createContext` | `<QueryClientProvider>` / context provider | `useQuery` / `useContext` |

- Spring cleanup: a bean's `close()` or `shutdown()` is called automatically when the app stops, like code after `yield`.
- Difference: on the server (FastAPI, Spring), every user shares one copy, so don't store per-user data there. In React, each user's browser tab has its own copy.

## Sources

- https://fastapi.tiangolo.com/advanced/events/
- https://docs.python.org/3/library/contextlib.html
- https://github.com/encode/starlette/blob/master/docs/lifespan.md
- https://github.com/encode/starlette/blob/master/docs/applications.md
- https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html
- https://docs.spring.io/spring-framework/reference/core/beans/java/bean-annotation.html
- https://react.dev/learn/passing-data-deeply-with-context
- https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
