# db

DB models and connection setup. How you connect, and what a row looks like.
No queries, no business logic — just the engine/session and table definitions.

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine("postgresql://localhost/starchart")
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

class SearchResult(Base):
    __tablename__ = "search_results"

    id = Column(Integer, primary_key=True)
    term = Column(String, nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Difference from `repositories`: this is the phone line (connection + what's on the other
end). `repositories` is the specific calls you make on it.
