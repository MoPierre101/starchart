from fastapi import FastAPI

from app.features.search.presentation.routers import search
from app.features.search.presentation.exception_handlers import (
    register_search_exception_handlers,
)

app = FastAPI(title="Starchart API", version="0.0.1")
app.include_router(search.router)
register_search_exception_handlers(app)


@app.get("/")
def root():
    return {"Hello": "World"}
