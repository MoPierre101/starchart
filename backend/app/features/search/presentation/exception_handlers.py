from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.features.search.application.errors import (
    ProviderNotFoundError,
    ProviderSearchError,
    UnknownCategoryError,
    UnsupportedMediaTypeError,
)


async def unknown_category_handler(request: Request, exception: Exception):
    return JSONResponse(status_code=404, content={"detail": str(exception)})


async def provider_not_found_handler(request: Request, exception: Exception):
    return JSONResponse(status_code=404, content={"detail": str(exception)})


async def unsupported_media_type_handler(request: Request, exception: Exception):
    return JSONResponse(status_code=400, content={"detail": str(exception)})


async def provider_search_error_handler(request: Request, exception: Exception):
    return JSONResponse(status_code=502, content={"detail": str(exception)})


def register_search_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(UnknownCategoryError, unknown_category_handler)
    app.add_exception_handler(ProviderNotFoundError, provider_not_found_handler)
    app.add_exception_handler(UnsupportedMediaTypeError, unsupported_media_type_handler)
    app.add_exception_handler(ProviderSearchError, provider_search_error_handler)
