# Live sources for the StarChart media catalog

2026-09-27

## Source choices

| Media type | Primary live source | Fit and constraint |
| --- | --- | --- |
| Movie and TV | TMDB | Search and detail APIs provide ID, title, poster, date, and overview. Daily ID exports provide IDs and limited attributes, so importing complete records still requires detail calls. |
| Comics | GCD REST API | Live series and issue search uses the same IDs as the GCD SQLite dump. Issue detail includes a cover URL and story data. The initial API has access limits and its response fields are not yet guaranteed stable. |
| Comics enrichment | Metron | Searchable series and issues, issue images, and `gcd_id` filters. Useful for matching and missing art, but a Metron ID must remain distinct from a GCD ID. Series list/detail does not provide a representative cover directly. |
| Games | IGDB | Live game search, stable game IDs, names, cover IDs, first release dates, summaries, franchises, and platforms. Requires Twitch client credentials. Free non-commercial access; commercial use requires an IGDB partnership with attribution. Local caching is explicitly allowed. |

Other game choices: RAWG provides search and images, but its free plan is non-commercial, has required backlinks and a 20,000 request monthly limit. MobyGames has title search and rich detail; its hobbyist plan is paid and non-commercial, with a higher priced commercial tier. Giant Bomb currently says its game API is unavailable.

## Current search contract

`MediaSearchResult` requires `provider`, `external_id`, `title`, and `media_type`; `poster_url`, `release_year`, and `overview` are nullable. It also has `raw` for the source payload.

- TMDB can fill these fields for movie and TV results.
- GCD series search provides a title, year, publisher, and series URL containing its ID. It does not provide a series poster or general overview. Issue detail can provide a cover and story text, but an issue is a different entity than a series. Empty optional fields are valid.
- IGDB can supply a game title, ID, cover, first release date, and summary, requesting those fields explicitly.
- `external_id` must be scoped by both provider and source entity type. For example, a GCD series ID, GCD issue ID, and Metron issue ID are different keys. `media_type` is a StarChart domain category, not a source name.

## Search and import shape

Public search should query the local catalog by media type. Admin search can offer a separate external search action even when local results exist, because a desired title can be missing while similarly named titles are already stored. An admin selects a candidate, fetches its full source detail, reviews it, and imports or updates it idempotently using a source ID mapping. Keep provider-specific clients behind the media search and import workflow; do not turn `TMDBProvider` into `ScreenProvider`, since TMDB is still the API integration and covers both movie and TV.

## Sources

- https://developer.themoviedb.org/docs/daily-id-exports
- https://github.com/GrandComicsDatabase/gcd-django/wiki/API
- https://www.comics.org/api/issue/256114/
- https://github.com/Metron-Project/metron/blob/master/api/README.md
- https://metron-project.github.io/blog/api-best-practices
- https://api-docs.igdb.com/
- https://rawg.io/apidocs
- https://www.mobygames.com/info/api/
- https://www.mobygames.com/api/subscribe/
- https://giantbomb.com/api
