from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.metron import open_metron_client
from app.core.database import open_database
from app.features.external_search.application.service import ExternalSearchService
from app.features.external_search.infrastructure.metron import MetronProvider
from app.features.external_search.presentation.exception_handlers import (
    register_external_search_exception_handlers,
)
from app.features.external_search.presentation.router import (
    router as external_search_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Before yield: runs once at startup. Routes read shared objects from
    # request.app.state (search_service, database).
    # After yield: runs at shutdown. Leaving the `async with` block closes
    # the Metron connection and the database connection.
    async with open_metron_client() as metron_client, open_database() as database:
        metron_provider = MetronProvider(metron_client)
        app.state.search_service = ExternalSearchService(metron_provider)
        app.state.database = database
        yield


app = FastAPI(title="Starchart API", version="0.0.1", lifespan=lifespan)
app.include_router(external_search_router)
register_external_search_exception_handlers(app)


@app.get("/")
def root():
    return {"Hello": "World"}
