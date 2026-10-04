# Python asynccontextmanager

_2026-09-27_

- `contextlib.asynccontextmanager` itself is not deprecated in Python 3.14 or in the current Python 3.15 documentation.
- It turns an async generator with one `yield` into an async context manager for `async with`.
- In `TMDBProvider._client()`, exceptions raised inside the caller's `async with` block are thrown back at the helper's `yield`, where HTTP errors are translated into `ProviderSearchError`.
- Pylance flags the older `AsyncIterator[T]` return annotation on an `@asynccontextmanager` generator. Annotate the generator as `AsyncGenerator[T, None]` instead. The warning's hover heading can misleadingly make it look as though the decorator is deprecated.

## 2026-10-03: Code after `yield`

Code after `yield` runs when the caller's `async with` body is done.

```python
@asynccontextmanager
async def _context():
    async with httpx.AsyncClient(...) as client:   # 1. client opens
        yield client                               # 2. caller uses client
        print("A")                                 # 3. client still open
    print("B")                                     # 4. client closed
```

- Caller succeeds: `A` runs, client closes, `B` runs.
- Caller raises an error: the error comes back at `yield`. `A` and `B` are skipped. The client still closes, because leaving `async with` always closes it.
- This is how the old `_context()` translated errors: `raise_for_status()` in the caller raised, and the `try/except` around `yield` caught it.
- To run code even on errors, wrap the `yield` in `try/finally`:

```python
async with httpx.AsyncClient(...) as client:
    try:
        yield client
    finally:
        print("always runs, client still open")
```

- Gotcha: if you catch the error only to log it, re-raise it. Otherwise it's swallowed and the caller carries on as if nothing went wrong.

## Sources

- https://docs.python.org/3/library/contextlib.html
- https://docs.python.org/3.14/library/contextlib.html#contextlib.asynccontextmanager
- https://docs.python.org/3.15/library/contextlib.html#contextlib.asynccontextmanager
- https://github.com/microsoft/pyright/issues/11402
