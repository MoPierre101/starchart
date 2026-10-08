# SurrealDB for StarChart

_2026-10-07_

The parts of SurrealDB the project leans on, in simple terms.

## Record ids

- A record id is `table:id`, like `issue:53372`.
- **A number and a text are different ids.** `issue:53372` (a number) is not ``issue:`53372` `` (a text, written with backticks). Tested: creating both gives two records. In Python, `RecordID("issue", 53372)` is the number and `RecordID("issue", "53372")` is the text. Mix them up and you write a second record without noticing.
- We use the GCD id as the id, so a re-run lands on the same record.

## Links and edges

- **A record link** is a field that holds another record's id, like `series_id: series:141`.
- **An edge** is a table that joins two records. It has `in` and `out`. Ours: `credited_on` (creator to story), `part_of_arc` (story to arc) and `continues` (series to series). Edges can carry their own fields, like `role`.
- Follow an edge with an arrow: `SELECT ->credited_on->story FROM creator:9001`.
- An edge only gets followed to a record that **exists**. Write the records before the edges.

## Writing again without duplicates

```sql
INSERT INTO issue $records ON DUPLICATE KEY UPDATE title = $input.title, updated_at = $input.updated_at
```

- `$input` is the new record you tried to insert. Plain `INSERT` with an id that exists is an error.
- `ON DUPLICATE KEY UPDATE` updates the old record instead. Leave `created_at` out of the list and it keeps its first value.
- For edges use `INSERT RELATION INTO`. Since v3.1.5 an edge id that exists is also an error unless you add `ON DUPLICATE KEY UPDATE`.
- We send 500 records per query.

## Missing values

- Python `None` is stored as **no field at all** (called `NONE`), not as `NULL`. Tested on an in-memory database:
  - `WHERE end_date = NULL` finds only records that hold `NULL`.
  - `WHERE end_date IS NONE` finds only records with no field.
  - To catch both: `WHERE end_date IS NONE OR end_date IS NULL`.
- The hand-made era seed uses `NULL` for a running era, while the loader writes no field. The app must check for both.

## Vector search (for the embeddings)

- Index types: **HNSW** (fast, the graph is held in memory and also saved) and **DISKANN** (for sets too big for memory, SurrealDB 3.1+).
- `DIMENSION` is the vector length. `TYPE` defaults to `F32` (4 bytes per number). The other choices are F64, I64, I32 and I16.
- Rough size: entries x dimensions x 4 bytes. For 230,000 entries: 384 numbers is about 0.35 GB, 768 about 0.7 GB, 1024 about 0.94 GB. The graph adds more on top. A third-party guide (Apache Doris) says about 30 percent, but that is not a SurrealDB number. Measure on real data.
- The embedding model also has to be the same one used when searching, so pick it before building the index.

## SurrealDB Cloud, as of 2026-10

| | Free | Burstable, from |
|---|---|---|
| Storage | 1 GB, cannot grow | 1 GB free, then $0.239 per GB per month |
| Compute | 0.25 vCPU, 1 GB memory | 0.5 vCPU, 1 GB: $15/month. 1 vCPU, 2 GB: $32/month. 2 vCPU, 4 GB: $68/month |

- A free instance becomes **read-only** above 1 GB, so writes would stop.
- A free instance **pauses after 7 days** without use.
- Check the live pricing page before choosing. It changes.

## Sources

- [SurrealDB: INSERT statement](https://surrealdb.com/docs/surrealql/statements/insert)
- [SurrealDB: Record IDs](https://surrealdb.com/docs/surrealql/datamodel/ids)
- [SurrealDB: Vector indexes](https://surrealdb.com/docs/learn/data-models/vector-search/vector-indexes)
- [SurrealDB: Pricing](https://surrealdb.com/pricing)
- [SurrealDB Cloud: FAQs](https://surrealdb.com/docs/cloud/faqs)
- [Apache Doris: ANN resource estimation](https://doris.apache.org/docs/4.x/table-design/index/vector-index/resource-estimation/) (third-party sizing, seen in search results)
