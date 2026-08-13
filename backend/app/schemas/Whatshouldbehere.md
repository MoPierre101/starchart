# schemas

Pydantic BaseModels. Just the shape of data passing to/from the HTTP layer — request
and response types. No behavior, no methods, no business rules.

```python
from pydantic import BaseModel

class SearchResultOut(BaseModel):
    id: int
    title: str
    url: str

class SearchResponse(BaseModel):
    results: list[SearchResultOut]
```

Difference from `domains`: schema is a dumb data contract for validation/serialization.
If you find yourself wanting to add a method to a schema, that logic belongs on a
domain class in `domains/` instead.
