# SurrealDB Type Generation

SurrealDB can generate TypeScript types from a live database schema using `surrealkit typegen`.

Given a schema-defined `title` table, generated output can resemble:

```ts
import type { RecordId } from "surrealdb";

export interface Title {
  id: RecordId<"title">;
  name: string;
  releaseYear?: number;
}
```

The generated type can then be supplied to the SurrealDB JavaScript SDK:

```ts
const titles = await db.select<Title>("title");
```

Generated types provide compile-time checking. They do not validate database results at runtime.

## Responsibilities

### SurrealDB schema

The SurrealDB schema defines and enforces the structure stored in the database.

```text
SurrealDB schema
    ↓
Generated database types
    ↓
Database queries and mutations
```

Schema-defined tables, especially `SCHEMAFULL` tables, produce more useful generated types than loosely structured or schemaless tables.

### Generated TypeScript types

Generated types describe persisted database records at compile time. They should be used by the data access layer when querying and mutating SurrealDB.

Generated files are machine-owned and should not be edited manually. Change the database schema and regenerate the types instead.

### Zod schemas

Zod validates values at runtime when they enter a trusted part of the application.

Use Zod for:

- Route Handler request bodies
- URL parameters and query strings
- Form submissions
- External API responses
- Environment variables
- Local storage data
- Database results when runtime validation is required

The typical request flow is:

```text
HTTP request
    ↓
Zod validation
    ↓
Data access mutation
    ↓
SurrealDB
```

For example:

```ts
import { z } from "zod";

export const createTitleInputSchema = z.object({
  name: z.string().min(1),
  releaseYear: z.number().int().optional(),
});

export type CreateTitleInput = z.infer<
  typeof createTitleInputSchema
>;
```

The generated `Title` type represents a stored database record. `CreateTitleInput` represents data that the application permits a caller to submit. These types should normally remain separate because:

- Stored records have `RecordId` values, while creation input does not have an ID yet.
- Some database fields may be generated or protected.
- Update input usually makes editable fields optional.
- API responses may omit internal database fields.
- Different operations can have different authorization and validation rules.

### Manually written TypeScript types

Use ordinary TypeScript types and interfaces for internal structures that do not require runtime validation, such as component props, hook options, internal state, and generic utilities.

## Suggested project structure

```text
src/
  lib/
    db/
      generated/
        index.ts
      queries/
      mutations/

  features/
    content/
      schemas/
        title-input.ts
      services/
      hooks/
      keys.ts
```

The exact feature owns its operation-specific input schemas. The generated database types remain in shared, server-side database infrastructure.

## SurrealKit configuration

TypeScript generation can be enabled in `surrealkit.toml`:

```toml
[typegen]
typescript = "./src/lib/db/generated"
format = "eslint --fix"
```

Generate the types manually with:

```bash
surrealkit typegen
```

When schema synchronization is configured, SurrealKit can regenerate types as the schema changes:

```bash
surrealkit sync --watch
```

The formatter command is only an example. It should match the formatter configured by the project when type generation is introduced.

## Working rule

- SurrealDB schema provides database enforcement.
- Generated TypeScript types describe stored records at compile time.
- Zod validates untrusted values at runtime.
- Manually written TypeScript types describe internal structures that do not require runtime validation.

Do not treat generated TypeScript types as runtime validation, and do not force stored-record types to also represent create input, update input, or API response contracts.

## References

- [SurrealKit type generation](https://surrealdb.com/docs/manage/schema-migration/typegen)
- [SurrealDB JavaScript SDK TypeScript types](https://surrealdb.com/docs/languages/javascript/api/types)
