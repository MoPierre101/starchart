from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.features.external_search.application.errors import (
    ProviderNotFoundError,
    ProviderRateLimitedError,
    ProviderSearchError,
)


async def provider_not_found_handler(request: Request, exception: Exception):
    return JSONResponse(status_code=404, content={"detail": str(exception)})


async def provider_rate_limited_handler(request: Request, exception: Exception):
    return JSONResponse(status_code=429, content={"detail": str(exception)})


async def provider_search_error_handler(request: Request, exception: Exception):
    return JSONResponse(status_code=502, content={"detail": str(exception)})


def register_external_search_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ProviderNotFoundError, provider_not_found_handler)
    app.add_exception_handler(ProviderRateLimitedError, provider_rate_limited_handler)
    app.add_exception_handler(ProviderSearchError, provider_search_error_handler)
