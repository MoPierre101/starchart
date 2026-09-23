from app.features.search.application.services.external_search import ExternalSearchService
from app.features.search.infrastructure.config import settings
from app.features.search.infrastructure.providers.tmdb import TMDBProvider

def get_search_service() -> ExternalSearchService:
    return ExternalSearchService(
        {
            "tmdb": TMDBProvider(api_key=settings.tmdb_api_key),
        }
    )
