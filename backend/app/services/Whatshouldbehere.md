# services

Business logic — orchestrating a use case. Coordinates repositories and domain
objects across multiple steps, often with I/O (DB calls, other services).

```python
def search(db: Session, query: str) -> list:
    if not query.strip():
        raise ValueError("Search query cannot be empty")

    all_results = search_repository.find_recent(db)       # fetch
    matched = [r for r in all_results if r.matches(query)] # use domain logic
    matched.sort(key=lambda r: r.score(), reverse=True)     # use domain logic
    return matched[:20]                                     # business rule
```

Examples: `getUsers`, `sendRequest`, `logOutUser` — named after the use case, not
the data.

Difference from `domains`: a domain method (`result.matches(query)`) only needs its
own object's data, no dependencies. A service needs to fetch data, coordinate
multiple objects/steps, and decide what happens next — that orchestration is what
makes it a service and not a domain method.
