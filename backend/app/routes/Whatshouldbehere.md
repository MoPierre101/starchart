# routes

FastAPI endpoints. HTTP concerns only — parse the request, call a service, return
a schema. No business logic, no DB queries here.

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.client import get_db
from app.services import search_service
from app.schemas.search import SearchResponse

router = APIRouter(prefix="/api", tags=["search"])

@router.get("/search", response_model=SearchResponse)
def search(q: str = Query(...), db: Session = Depends(get_db)):
    results = search_service.search(db, q)
    return {"results": results}
```

If a route body is doing anything more than parsing input, calling one service
function, and returning its result, that logic belongs in `services` instead.
