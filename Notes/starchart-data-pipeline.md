# StarChart data pipeline

_2026-10-07_

## The picture

```
GCD dump (6.75 GB, every publisher in the world)
   |  strip_gcd_dump.py     keeps 6 publishers -> 0.83 GB
   v
gcd_dump/stripped.db
   |  gcd_loader            cleans, then writes
   v
SurrealDB (our own tables)
   |
   v
Next.js app (plan: it talks to SurrealDB directly, no FastAPI backend)
```

The two scripts live in `scripts/` (gitignored). They are not part of the app.

## Why each step exists

- **Strip:** the full dump is too big to host or read fast. Keep only Marvel, DC, Image, Dark Horse, Boom! and Dynamite, and only the tables the loader reads. 6.75 GB became 0.83 GB (about 236 MB zipped) in 8 seconds.
- **Load:** GCD data is messy (text dates, empty strings, 0/1 flags, reprints, variant covers). The loader fixes that **once**. The app only ever sees clean data.
- **Scripts, not the app:** the app must run without a 6 GB file. The scripts only run when there is a new dump.

## Rules that worked

- **Clean once at load, not on every request.**
- **Our id = the source id.** `issue:53372` is GCD issue 53372. Run again and the same record is updated, never duplicated.
- **Safe to run again.** It updates what exists and adds what is new. It never deletes, so a record GCD removes later stays in our database.
- **Open the source read-only.** A run can never change the dump.
- **Write things first, links second.** A link only works when both ends exist.
- **Print counts after every run.** A big jump in a `skip_...` count after a new dump means GCD changed something.
- **Plain dictionaries, not classes.** A typo in a key only fails when it runs, so the tests and a before/after comparison on the real data catch it.
- **Fixed file locations.** `gcd_dump/dump.db` is the download. `gcd_dump/stripped.db` is the stripper's output and the loader's input. Nothing to configure.

## What the loader skips

- Anything that is not a "comic story" (covers, ads, letters pages).
- Deleted records and variant covers.
- Stories that reprint a story already loaded. Collected editions only hold reprints, so they disappear on their own.
- Issues with no usable date, and series left with no issues.

## Where things are (`scripts/gcd_loader/`)

| File | Job |
|---|---|
| `reading.py` | Reads the dump. Gives back plain dictionaries. |
| `decisions.py` | The load or skip rules. |
| `dates.py` | Date text to real dates, and which eras an issue is in. |
| `cleaning.py` | Empty values, link markers in notes, credit roles. |
| `records.py` | Turns a GCD row into our record. Builds the search entries. |
| `search_text.py` | The text each search entry is made from. |
| `surreal.py` | Connection, reading eras, writing in batches. |
| `pipeline.py` | Runs the steps in order. Builds the report. |
| `settings.py` | Paths and the SurrealDB login from `.env`. |

## Gotchas we hit

- **A slow query was one filter.** Filtering `deleted = 0` in SQL made SQLite pick the wrong index (111 seconds). Filtering in Python took 1.1 seconds. If a query is slow, look at the plan.
- **GCD dates come in five shapes:** `1956-07-05`, `1956-07`, `1956-07-00`, `1956`, `1956-00-00`. An incomplete date matches every era it overlaps.
- **GCD changes its schema.** The `gcd-django` repo has 71 migrations, and 8 commits touched them in 2025. That is why a mapping layer exists: a renamed GCD column breaks one place.
- **Notes can link to records in other publishers.** After stripping, a link to a record that is gone is removed. For DC that touched 1 story, 11 issues and 2 series.

## Size

DC alone loads 5,253 series, 48,965 issues and 108,020 stories (about 108k search entries). For all six publishers I estimate about 230,000 search entries. That is a guess: it assumes the others load at DC's rate.

## Hosting later (not now)

- Put the stripped file in a **GitHub release**. A release file must be under the Git LFS limit for your plan (2 GB on Free), and the total release size is not limited.
- **Not an Actions artifact.** The Free plan only has 500 MB of artifact storage.
- An Action can only clean and import. Stripping needs the full dump, which stays on the laptop.
- The Action needs a **hosted** SurrealDB. It cannot reach one on the laptop.
- The loader takes about a minute for DC, so running it from the laptop against a hosted database is the same job. The Action is optional.
- GCD content is licensed CC BY-SA 4.0. Publishing a copy means giving credit and sharing it under the same license. I could not find separate terms for the dump itself, so check what was accepted at download.

## Sources

- [SurrealDB: INSERT statement](https://surrealdb.com/docs/surrealql/statements/insert)
- [GitHub: About large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [GitHub: About Git Large File Storage (limits per plan)](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [GitHub: How Actions use is measured (Free plan storage and minutes)](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [gcd-django: migration files (API)](https://api.github.com/repos/GrandComicsDatabase/gcd-django/contents/apps/gcd/migrations)
- [gcd-django: commits touching migrations (API)](https://api.github.com/repos/GrandComicsDatabase/gcd-django/commits?path=apps/gcd/migrations&per_page=100)
- [comics.org page footer with the CC BY-SA 4.0 notice](https://www.comics.org/series/3381/characters/) (seen in search results; the site refused a direct fetch)
