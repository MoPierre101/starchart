# repositories

Database access logic. CRUD operations — fetching/saving specific things a service asked for.
No business rules here, just queries.

```python
from sqlalchemy.orm import Session
from app.db.client import SearchResult

def find_by_term(db: Session, term: str, limit: int = 20) -> list[SearchResult]:
    return (
        db.query(SearchResult)
        .filter(SearchResult.term.ilike(f"%{term}%"))
        .limit(limit)
        .all()
    )

def save(db: Session, result: SearchResult) -> SearchResult:
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
```

Difference from `db`: `db` is the connection and the table shape. `repositories` is
"give me the data I need for this use case," using the connection `db` provides.
