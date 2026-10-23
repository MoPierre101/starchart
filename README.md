# StarChart

StarChart turns the Grand Comics Database into a smaller, cleaner Postgres database and serves a search API on top of it.

## Where the information comes from

The [Grand Comics Database](https://www.comics.org/) (GCD) is a community-built archive of comics from every publisher in the world. Its dump is about 6.7 GB. StarChart keeps the part it needs and cleans it before use.

## Which publishers

Thirteen US publishers: DC, Marvel, Image, Dark Horse, Archie, Boom!, Dynamite, Titan, Oni, Valiant, Mad Cave, Vault and Ignition Press.

A series is kept when its language is English, Spanish or French, and its publishing format is not a giveaway, promo or ashcan. Variant covers are kept and stay linked to their regular issue.

## The data pipeline (`scripts/`)

One script runs four steps, and each run rebuilds the results from scratch:

1. Strip the GCD dump down to the chosen publishers.
2. Load the stripped file into Postgres with pgloader.
3. Clean it into the `gcd` schema.
4. Drop the temporary raw copy.

It needs `uv`, `pgloader` and `psql`, the GCD dump saved as `data_dump/gcd_dump.db`, and a `DATABASE_URL` in `scripts/.env`. For Encore's local database, get the URL with `encore db conn-uri starchart`.

```bash
./scripts/run_pipeline.sh
```

Each step has a `How_Does_It_Work.md` next to its code.

## The API (`api/starchart`)

An [Encore.ts](https://encore.dev/docs/ts) service, `catalog`, with Prisma on top of Encore's Postgres database.

| Route | Returns |
|---|---|
| `GET /search?text=` | The top five issues, creators and characters for the text |
| `GET /search/issues` | Issues, with filters for format, publisher and year, in pages |
| `GET /search/creators` | Creators, in pages |
| `GET /search/characters` | Characters, in pages |

Text is matched with trigram search, so it needs at least three characters. Every issue result carries a rating (all ages, teen, mature and so on), taken from the GCD rating.

```bash
cd api/starchart
encore run      # starts the API and its database; the dashboard is at localhost:9400
npm test
```
