# Custom exception classes

_2026-09-18_

A custom exception is just a named tag for a specific kind of failure, with
optional extra data attached — so calling code can `except` on the *type* and
react differently per failure mode, instead of parsing a generic error's
message string.

```python
class ProviderSearchError(RuntimeError):
    """Raised when a provider's upstream request fails (bad status, network error)."""

    def __init__(self, provider: str, message: str):
        self.provider = provider
        super().__init__(f"{provider} search failed: {message}")
```

* `class ProviderSearchError(RuntimeError):` — inherits from a built-in
  exception so Python's `raise`/`except` machinery treats it as a real
  exception (and so `except RuntimeError` would also catch it, if ever
  needed).
* `self.provider = provider` — stashes extra structured data on the instance,
  so calling code can read `exception.provider` later without re-parsing the
  message.
* `super().__init__(f"...")` — hands the formatted message up to the parent
  class's own constructor. `RuntimeError` already knows how to store a
  message and make `str(exception)` / tracebacks work — `super()` just means
  "let the parent handle that part," the same pattern as any subclass calling
  its parent's `__init__` to reuse existing setup logic instead of
  reimplementing it. Skipping this line still sets `.provider`, but
  `str(exception)` comes back empty and tracebacks look broken.

## Catching different custom exceptions differently
```python
except UnknownProviderError as exception:
    raise HTTPException(status_code=404, detail=str(exception)) from exception
except ProviderSearchError as exception:
    raise HTTPException(status_code=502, detail=str(exception)) from exception
```
Two different problems (bad client input vs. upstream service failure) map to
two different HTTP status codes — only possible because they're distinct
exception *types*, not both generic `Exception`/`ValueError`.

## `raise ... from exception`
Exception chaining — tells Python "this new exception was caused by that
original one." Tracebacks then show both, linked
(`The above exception was the direct cause of the following exception`),
instead of losing the original context when translating a low-level error
(e.g. `httpx.HTTPStatusError`) into a domain-level one
(`ProviderSearchError`).

`exception` (spelled out, not abbreviated `exc`/`e`) is just the local
variable name bound to the caught exception object via `as` — enables reading
data off it (`exception.response.status_code`) and chaining.

## 2026-09-28: Adding a new error with a global FastAPI handler

Routes no longer catch errors. Each custom error gets one handler in
`backend/app/main.py`, and FastAPI calls it for any route that raises it.

### Recipe

1. **Define the class** in `application/errors.py`. Pick the built-in parent
   that matches the meaning:
   * `ValueError`: right type, wrong value (bad input).
   * `LookupError`: a key/item was not found.
   * `RuntimeError`: something broke that fits no other category.
2. **Raise it** from the provider or service. Never raise `HTTPException`
   there; HTTP belongs to the presentation layer.
3. **Register a handler** in `main.py`:

```python
@app.exception_handler(UnsupportedMediaTypeError)
async def unsupported_media_type_handler(request: Request, exception: UnsupportedMediaTypeError):
    return JSONResponse(status_code=400, content={"detail": str(exception)})
```

### Gotchas

* **`super().__init__` only takes the message.** Extra data (`provider`,
  `media_type`) is stored yourself with `self.x = x`. `str(exception)` returns
  only what was passed to the constructor, so anything you want in the
  response `detail` must be in that message.
* **A handler is not a route.** It has no URL; FastAPI calls it when that
  exception is raised during any request.
* **Keep `{"detail": ...}`.** That's the shape `HTTPException` produces, so
  the frontend keeps working.
* **Lookup walks the class hierarchy.** Starlette checks the error's own class
  first, then each parent, and uses the first handler found. The built-in
  parent has no effect unless something registers a handler for it. A
  subclass of one of *your* handled errors, with no handler of its own, uses
  the parent's.
* **No handler = 500.** Starlette's `ServerErrorMiddleware` turns any
  unhandled exception into a generic `500 Internal Server Error` and re-raises
  it so it gets logged.

### Sources

* https://fastapi.tiangolo.com/tutorial/handling-errors/
* https://docs.python.org/3/library/exceptions.html
* Installed Starlette 1.3.1 source: `starlette/_exception_handler.py`
  (`_lookup_exception_handler`) and `starlette/middleware/errors.py`
  (`ServerErrorMiddleware`)
