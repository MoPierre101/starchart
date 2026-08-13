# tasks

Python workers (Celery, or similar). Long-running or scheduled work that
shouldn't block a request/response cycle — reindexing, sending emails, cleanup jobs.

```python
from app.db.client import SessionLocal
from app.repositories import search_repository

def rebuild_search_index():
    db = SessionLocal()
    try:
        # e.g. re-crawl a source and repopulate search_results
        ...
    finally:
        db.close()
```

Calls into `repositories`/`services` the same way a route would, just triggered
by a schedule or queue instead of an HTTP request.
