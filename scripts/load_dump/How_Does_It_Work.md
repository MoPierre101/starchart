# How Does It Work?

## What it does

`load_dump.load` is a pgloader command file. It copies every table in `stripped.db` into a Postgres schema called `gcd_raw`, **as it is**. No values are changed. The cleaning SQL (`scripts/clean_dump`) reads `gcd_raw` next.

## How to run it

From this folder:

```bash
STRIPPED_DB_PATH=../../data_dump/stripped.db \
DATABASE_URL="postgresql://user:password@host:5432/dbname" \
pgloader load_dump.load
```

- `STRIPPED_DB_PATH` is the file the strip script wrote.
- `DATABASE_URL` is the Postgres connection string. Do not save the password in the file. Pass it in the command, as above.
- The file uses `{{{...}}}` (three braces) so pgloader puts the values in without changing any characters in them.

## Step by step

1. pgloader runs `create schema if not exists gcd_raw` (the `before load` part).
2. It sets the session's `search_path` to `gcd_raw`, so the tables it creates go there and not into `public`.
3. It reads the table definitions from `stripped.db` and creates each table (`include drop` removes an old copy first).
4. It converts the types, then copies the rows. The primary keys are created too.
5. If any row fails, the load **stops** (`on error stop`). The default would set the bad row aside and keep going, and a missing row would only show up later.

## What the types become

| In `stripped.db` | In `gcd_raw` |
|---|---|
| `INTEGER` (ids, flags, counts) | `bigint` |
| `varchar(n)`, `TEXT` | `text` |
| `longtext` | `text` (an extra cast in this file) |
| `decimal(10,3)` | `numeric(10,3)` |
| `datetime`, `datetime(6)` | `timestamptz` |

The cleaning SQL expects exactly these types. It turns the 0/1 flags into booleans and the ids into `integer` itself.

## How it was tested

It was run with pgloader 3.6.10 against Encore's local Postgres, on the stripped version of the dump in `data_dump/gcd_dump.db` (a file dated 2026-10-16). All 29 tables and 5,281,731 rows (635.1 MB) loaded in about 14 seconds with no errors. The tables landed in `gcd_raw` (the `search_path` setting works), and the cleaning step then ran on top of them without a type error.

One thing to know: Encore's local Postgres is not on port 5432. Get the connection string with `encore db conn-uri starchart` and use it as `DATABASE_URL`. It carries its own port and `?sslmode=disable`.
