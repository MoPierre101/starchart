# Python asynccontextmanager

_2026-09-27_

- `contextlib.asynccontextmanager` itself is not deprecated in Python 3.14 or in the current Python 3.15 documentation.
- It turns an async generator with one `yield` into an async context manager for `async with`.
- In `TMDBProvider._client()`, exceptions raised inside the caller's `async with` block are thrown back at the helper's `yield`, where HTTP errors are translated into `ProviderSearchError`.
- Pylance flags the older `AsyncIterator[T]` return annotation on an `@asynccontextmanager` generator. Annotate the generator as `AsyncGenerator[T, None]` instead. The warning's hover heading can misleadingly make it look as though the decorator is deprecated.

## Sources

- https://docs.python.org/3.14/library/contextlib.html#contextlib.asynccontextmanager
- https://docs.python.org/3.15/library/contextlib.html#contextlib.asynccontextmanager
- https://github.com/microsoft/pyright/issues/11402
