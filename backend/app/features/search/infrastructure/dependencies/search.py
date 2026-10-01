from app.features.search.application.services.external_search import (
    ExternalSearchService,
)
from app.features.search.infrastructure.config import settings
from app.features.search.infrastructure.providers.tmdb import TMDBProvider
from app.features.search.infrastructure.providers.metron import MetronProvider


def get_search_service() -> ExternalSearchService:
    return ExternalSearchService(
        {
            "visual_media": TMDBProvider(api_key=settings.tmdb_api_key),
            "comics": MetronProvider(api_key=settings.metron_api_key),
        }
    )
