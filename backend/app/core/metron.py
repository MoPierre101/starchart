import httpx2
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from app.core.config import settings


@asynccontextmanager
async def open_metron_client() -> AsyncGenerator[httpx2.AsyncClient, None]:
    async with httpx2.AsyncClient(
        base_url=settings.metron_base_url,
        headers={
            "Authorization": f"Bearer {settings.metron_api_key}",
            "User-Agent": "StarChart/0.0.1",
        },
        timeout=10,
    ) as client:
        yield client
