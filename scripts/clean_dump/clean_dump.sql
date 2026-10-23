-- Builds the gcd schema from the raw load in gcd_raw.
-- Run it from this folder:  psql "$DATABASE_URL" -f clean_dump.sql
-- It runs as one transaction, so an error leaves the database as it was.

\set ON_ERROR_STOP on

begin;

drop schema if exists gcd cascade;
create schema gcd;

\ir clean_dump_helpers.sql
\ir catalog/clean_catalog_helpers.sql
\ir lookups/clean_lookups.sql
\ir catalog/clean_catalog.sql
\ir stories/clean_stories.sql
\ir credits/clean_credits.sql
\ir characters/clean_characters.sql
\ir reprints/clean_reprints.sql
\ir arcs/clean_arcs.sql
\ir tags/clean_tags.sql
\ir keys/clean_keys.sql

commit;
