# Pydantic Settings for env config

_2026-09-18_

FastAPI itself has no built-in concept of environment variables or config
files — env handling is a separate library, **Pydantic Settings**
(`pydantic_settings.BaseSettings`), that FastAPI's docs happen to recommend.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    tmdb_api_key: str = ""

settings = Settings()
```

* `BaseSettings` is a Pydantic model whose fields are populated from sources
  in priority order: constructor args → environment variables → `.env` file
  → field default.
* Field name → env var name mapping is automatic and case-insensitive by
  default: `tmdb_api_key: str` looks for `TMDB_API_KEY` with no extra
  wiring.
* `env_file=".env"` — path resolved **relative to the process's current
  working directory at runtime**, not relative to the config file's own
  location. If the app is run via `cd backend && uv run fastapi dev
  app/main.py`, the `.env` must live at `backend/.env` — not
  `backend/app/.env`.
* `.env` syntax: `KEY=value`, no spaces around `=`; quotes are optional.
  `KEY = "value"` (with spaces) can misbehave depending on parser strictness.
* `settings = Settings()` runs once at **import time** — a plain module-level
  singleton. It reads the environment once and freezes the values; FastAPI
  doesn't manage or refresh it.
