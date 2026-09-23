from fastapi import FastAPI
from app.features.search.presentation.routers import search

app = FastAPI(title="Starchat API", version="0.0.1")
app.include_router(search.router)

@app.get("/")
def root():
    return {"Hello":"World"}
