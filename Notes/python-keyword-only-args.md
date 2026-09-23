# Python keyword-only arguments (`*`)

_2026-09-18_

A bare `*` in a function signature is not a parameter — it's a marker.
Everything listed after it can only be passed **by keyword**, never
positionally.

```python
async def search(self, query: str, *, limit: int = 20) -> list[MediaSearchResult]: ...
```

```python
await provider.search("matrix", 10)               # TypeError — limit can't be positional
await provider.search("matrix", limit=10)          # fine
await provider.search(query="matrix", limit=10)    # fine
```

Why bother: for arguments where position would be ambiguous at the call site
(`search("matrix", 10)` — is `10` a limit? a page? an offset?), forcing
keyword-only makes every call self-documenting. Especially worth it on an
interface/Protocol that multiple implementations must match — the signature
stays unambiguous as it grows more optional params over time.
