from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    metron_base_url: str = ""

    metron_api_key: str = ""

    surreal_url: str = ""

    surreal_namespace: str = ""

    surreal_database: str = ""

    surreal_username: str = ""

    surreal_password: str = ""


settings = Settings()
