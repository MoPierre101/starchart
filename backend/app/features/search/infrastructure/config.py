from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    tmdb_base_url: str = ""

    tmdb_image_base_url: str = ""

    tmdb_api_key: str = ""

    metron_base_url: str = ""

    metron_image_base_url: str = ""

    metron_api_key: str = ""


settings = Settings()
