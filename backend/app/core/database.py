from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from surrealdb import AsyncSurreal, AsyncWsSurrealConnection, AsyncHttpSurrealConnection

from app.core.config import settings


@asynccontextmanager
async def open_database() -> (
    AsyncGenerator[AsyncWsSurrealConnection | AsyncHttpSurrealConnection, None]
):
    """Open one SurrealDB connection, sign in, and pick the namespace and database."""
    async with AsyncSurreal(settings.surreal_url) as database:
        await database.use(settings.surreal_namespace, settings.surreal_database)
        await database.signin(
            {
                "username": settings.surreal_username,
                "password": settings.surreal_password,
            }
        )
        yield database
    # Leaving `async with` closes the connection.
