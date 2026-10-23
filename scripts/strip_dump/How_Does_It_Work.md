# How Does It Work?

## What it does

The GCD dump is one huge file (about 6.7 GB) with every comic publisher in the world. We only need 13 publishers.

This script makes a much smaller copy of the dump. The copy has only the tables and rows we plan to keep. It is a **filter**. It does not fix or clean any values. That happens in a later step.

## How to run it

From the `scripts` folder:

```bash
uv run main.py
```

- It reads `data_dump/gcd_dump.db`. The dump always has this name.
- To use a different file, add its path: `uv run main.py path/to/dump.db`
- `strip.sh` in the `scripts` folder runs this for you.
- It writes the result to `data_dump/stripped.db`. If that file already exists, it is deleted first.
- The original dump is never changed. It is opened read-only.

## The idea

1. Start a new, empty database called `stripped.db`.
2. Plug the big dump in next to it, read-only, under the name `source`.
3. For each table we keep, make an empty copy of the table, then fill it with only the rows we want.

Each step only keeps rows that belong to rows an earlier step already copied. For example, a story is copied only if its issue was already copied. This is why the **order of the steps matters**.

## Step by step

### Step 0. Open the database
`strip_dump_helpers.py` creates `stripped.db` and attaches the dump. It also turns off the safety journal on the new file to make it faster. That is fine because the file can be rebuilt any time.

### Step 1. Catalog (publishers, series, issues)
- **Publishers:** the 13 chosen publishers, if not deleted.
- **Series:** a series is kept when all of these are true:
  - its publisher was kept
  - it is not deleted
  - it is marked as a comics publication
  - its language is English, Spanish or French
  - its publishing format does not mention giveaway, promo or ashcan
  - it has at least one issue that is not deleted
- **Issues:** every issue of a kept series that is not deleted. Variants (alternate covers) are kept too. They stay linked to their regular issue.
- **Indicia publishers:** only the ones that a kept issue uses.
- **Series bonds:** only when both series in the bond were kept.

### Step 2. Stories
A story is kept when its issue was kept, it is not deleted, and its type is one of: comic story, text story, cartoon or photo story. Covers, ads, letters pages and the other types are dropped.

### Step 3. Credits and creators
- **Story credits:** the story was kept, the credit is not deleted, and the creator exists in the dump. Credits pointing at a creator that is missing are dropped.
- **Issue credits:** same rules. A variant issue keeps only the credits that its regular issue does not already have.
- **Creators:** only creators who appear in a kept credit.
- **Creator name details:** the alternate names of the kept creators.
- **Creator dates:** only the birth and death date rows that a kept creator points at.

### Step 4. Characters
- **Story characters (appearances):** the story was kept, and the character exists in the dump.
- **Characters:** only characters who appear in a kept story.
- **Character name details:** the alternate names of the kept characters.

### Step 5. Reprints
A reprint says "this story was printed again in that issue". It is kept only when **both issues** were kept. Two kinds of rows are dropped:
- a reprint between an issue and its own variant
- exact duplicate rows (the one with the lowest id stays)

### Step 6. Story arcs
- **Arc links:** the story was kept.
- **Arcs:** only arcs that a kept story belongs to.
- **Arc relations:** only when both arcs were kept.

### Step 7. Tags
- **Tagged items:** only tags on stories. The tag table also tags series, issues and characters, and those are dropped.
- **Tags:** only tags that a kept story uses.

### Step 8. Lookups
Eight small tables that give names to ids. They are copied whole: story types, credit types, series publication types, character roles, series bond types, story arc relation types, countries and languages.

### Step 9. Link names
Some notes contain GCD link markers such as `[gcd_link_issue](702)`. Many of the things they point at were not kept, so the cleaning step could not find their names later. This step looks up the name behind every marker in the **full dump** and saves it in a small table, `link_target_name` (kind, id, name). The cleaning step uses that table to replace each marker with its name.

## What it does not do

- It does not clean text, null out `?`, parse dates or prices, or drop columns. The later SQL cleaning step does all of that.
- It copies reprint story ids as they are. Some point at stories that were not kept (for example covers). The cleaning step should deal with them.
- The new tables have no foreign keys, default values or indexes. Each table is rebuilt from the source's column names and declared types (`varchar`, `datetime`, `decimal`), because pgloader uses those types later to choose Postgres types.

## Where things live

Each feature has its own folder. A `_constants` file exists only if the feature has constants, and a `_helpers` file only if it has a helper.

| Folder | What it does | Extra files |
|---|---|---|
| `strip_dump/` | Runs the steps in order. Opens the database. Shared helpers | `_constants`, `_helpers` |
| `catalog/` | Step 1 | `_constants` (publisher ids, languages, excluded words), `_helpers` |
| `stories/` | Step 2 | `_constants` (story type ids) |
| `credits/` | Step 3 | none |
| `characters/` | Step 4 | none |
| `reprints/` | Step 5 | none |
| `arcs/` | Step 6 | none |
| `tags/` | Step 7 | `_constants` (the story content type id) |
| `lookups/` | Step 8 | `_constants` (the list of lookup tables) |
| `links/` | Step 9 | `_constants` (the marker pattern, the text columns to scan, how to look up each kind of name), `_helpers` |

## Changing a rule

- **Which publishers:** `catalog/strip_catalog_constants.py`
- **Which languages or excluded formats:** the same file
- **Which story types:** `stories/strip_stories_constants.py`
- **Any other rule:** open the feature file. Each function is one SELECT, and the WHERE part is the rule.

## Checking the result

The script prints the row count of every table as it goes. Compare those numbers with the ones in `starchart/gcd_tables.md`. Those numbers were measured on the 2026-10-10 dump, so small differences are expected on a newer dump.
