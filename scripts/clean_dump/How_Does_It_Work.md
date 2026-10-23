# How Does It Work?

## What it does

The strip script made a small SQLite file (`stripped.db`) with only the rows we keep. pgloader loads that file into Postgres as it is, into a schema called `gcd_raw`. Every value there is still messy.

These SQL files read `gcd_raw` and build a second schema called `gcd` with **clean tables**: real types, no junk text, dates that Postgres accepts, and keys that are checked.

`gcd_raw` is never changed. You can drop it once `gcd` looks right.

## How to run it

From this folder:

```bash
psql "$DATABASE_URL" -f clean_dump.sql
```

- Everything runs as **one transaction**. If anything fails, the database is left as it was.
- It starts with `drop schema if exists gcd cascade`, so it can be run again.
- It needs `gcd_raw` to exist, with the tables from `stripped.db` (including `link_target_name`).
- It needs the `pg_trgm` extension, which an Encore migration creates.

## The idea

1. Create the empty `gcd` schema and the helper functions.
2. For each feature, build the clean tables with `create table ... as select ...` from `gcd_raw`.
3. At the very end, add primary keys, foreign keys and indexes.

The keys come last on purpose. If any row points at something that is not there, adding the foreign key fails and the whole run stops. So the last file is also the final check.

## Step by step

`clean_dump.sql` includes the files in this order:

### 1. `clean_dump_helpers.sql`: small functions used everywhere
- `clean_short_text`: one line, single spaces, no invisible characters. Empty becomes null.
- `clean_long_text`: the same, but line breaks stay.
- `replace_link_markers`: replaces a GCD link marker with the name saved in `link_target_name`. A marker with no saved name is removed. `[label][id]` keeps only the label.
- `fix_mojibake`: fixes the three broken character sequences found in the kept data.
- Date functions: turn text like `1957-13-10` or `19??` into a year, month and day that are safe to store, plus a precision and a sortable date.

### 2. `catalog/clean_catalog_helpers.sql`: functions for issues and series
- `parse_price`: first amount and currency from the price text.
- `rating_class`: groups the rating spellings into six classes.
- `issue_number_to_number`: the first number in an issue number, for sorting.
- `split_barcodes`: digits only, one entry per barcode.

### 3. `lookups/clean_lookups.sql`
The small name tables (story types, credit types, countries, languages and so on) with the right types.

### 4. `catalog/clean_catalog.sql`
- **Issues:** cleaned text, parsed dates and prices, the rating class, the ISBN, the barcodes, a `kind` that says single issue, collection or graphic novel, and a `search_text` line that search matches against: series name, series start year, issue number, issue year and title, for example `Batman 2016 #50 2018 The Wedding`.
- **Series:** cleaned text. The end year is fixed when it is impossible or missing. The first issue, last issue and issue count are worked out from the regular issues. A series with no regular issue is dropped, and so are the variants that sat in it.
- **Publishers:** cleaned, with series and issue counts worked out here.
- **Indicia publishers** and **series bonds.**

### 5. `stories/clean_stories.sql`
- Cleaned text, genres as a list, and `?` credits turned into null.
- One `characters_text` per story: the original text, or the names built from the story's character rows when there is no text.
- A `rating_class` taken from the story's issue, with the erotica genre counted as mature (see the rule below).

### 6. `credits/clean_credits.sql`
Story credits and issue credits (duplicates merged), creators (birth and death date parts parsed from the date rows), and creator name details.

### 7. `characters/clean_characters.sql`
Character appearances (duplicates merged), characters, and character name details. A character's description and notes are kept only when they are in English, Spanish or French.

### 8. `reprints/clean_reprints.sql`
Reprints. A story id that was not kept becomes null.

### 9. `arcs/clean_arcs.sql` and 10. `tags/clean_tags.sql`
Story arcs, their links and relations. Tags, with tags that differ only by case merged into one.

### 11. `keys/clean_keys.sql`
Primary keys, foreign keys, two unique tag columns, indexes for the common joins, and five trigram indexes for search: the issue `search_text`, creator names, creators' other names, character names and characters' other names.

## The rating class

Every issue and every story has a `rating_class`: all ages, comics code, teen, mature, other or none.

- **Issue.** The class comes from the printed rating.
- **Story.** It takes its issue's class, except that a story with the `erotica` genre is mature.
- **Issue again.** An issue with an erotica story becomes mature. This is the last thing the stories step does.

## What it does not do

- It does not create the `gcd_raw` schema. pgloader does that.

## Where things live

| File | What it does |
|---|---|
| `clean_dump.sql` | Runs the files in order |
| `clean_dump_helpers.sql` | Text, link and date functions |
| `catalog/` | Issues, series, publishers, indicia publishers, series bonds. Has its own helpers file |
| `lookups/` | The small name tables |
| `stories/` | Stories and their rating class |
| `credits/` | Credits and creators |
| `characters/` | Characters and appearances |
| `reprints/`, `arcs/`, `tags/` | One file each |
| `keys/` | Keys, join indexes and search indexes |

## Changing a rule

- **Text cleaning:** `clean_dump_helpers.sql`
- **Rating classes, price, issue number, barcodes:** `catalog/clean_catalog_helpers.sql`
- **Collection or graphic novel tag:** the `kind` column in `catalog/clean_catalog.sql`
- **Series fixes:** the `gcd.series` part of `catalog/clean_catalog.sql`
- **Search line:** the `search_text` column in `catalog/clean_catalog.sql`
- **Search indexes:** the end of `keys/clean_keys.sql`
- **Rating class for stories and the erotica rule:** `stories/clean_stories.sql`
- **Languages kept for character text:** `characters/clean_characters.sql` (language ids 25, 27 and 34)

## How it was tested

The whole pipeline was run on the dump in `data_dump/gcd_dump.db` (a file dated 2026-10-16) against Encore's local Postgres. This step takes about a minute and ends with 27 tables, 27 primary keys, all 45 foreign keys and the 5 trigram indexes in place, so no row points at nothing.

What the test checked:

- Row counts match the raw tables, except where a rule removes rows (duplicate credits, appearances and tags merged, variants of a dropped series removed).
- No link markers, `[1]: https://...` footnote lines, invisible characters, empty strings, double spaces or mojibake are left in the cleaned text. Three odd `[label][id]` links with nested brackets remain.
- Dates, prices, ratings, the collection tag, the rating class, the series fixes, the character text rule and the creator dates all came out as the decisions say.
