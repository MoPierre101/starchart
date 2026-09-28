from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.features.search.application.errors import (
    ProviderNotFoundError,
    ProviderSearchError,
    UnknownCategoryError,
    UnsupportedMediaTypeError,
)
from app.features.search.presentation.routers import search

app = FastAPI(title="Starchat API", version="0.0.1")
app.include_router(search.router)


@app.exception_handler(UnknownCategoryError)
async def unknown_category_handler(request: Request, exception: UnknownCategoryError):
    return JSONResponse(status_code=404, content={"detail": str(exception)})


@app.exception_handler(ProviderNotFoundError)
async def provider_not_found_handler(request: Request, exception: ProviderNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exception)})


@app.exception_handler(UnsupportedMediaTypeError)
async def unsupported_media_type_handler(request: Request, exception: UnsupportedMediaTypeError):
    return JSONResponse(status_code=400, content={"detail": str(exception)})


@app.exception_handler(ProviderSearchError)
async def provider_search_error_handler(request: Request, exception: ProviderSearchError):
    return JSONResponse(status_code=502, content={"detail": str(exception)})


@app.get("/")
def root():
    return {"Hello":"World"}
