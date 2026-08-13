# domains

Python classes for core business concepts, with behavior attached — not just data.

If an object needs its own rules or logic (not just fields), it belongs here. Example:

```python
class SearchResult:
    def __init__(self, id: int, term: str, title: str, url: str):
        self.id = id
        self.term = term
        self.title = title
        self.url = url

    def matches(self, query: str) -> bool:
        return query.lower() in self.title.lower()
```

Or a `User` class with `has_permission(x)`, `can_edit(post)`, etc.

Difference from `schemas`: schema = shape only (dumb data contract for the HTTP boundary).
domain = shape + behavior (the actual concept your business cares about).

If a class here has no methods, it's not a domain object — it's a schema in disguise.
Leave this folder empty until an object actually needs behavior.
