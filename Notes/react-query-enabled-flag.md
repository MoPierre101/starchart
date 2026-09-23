# React Query: the `enabled` flag (and what it isn't)

_2026-09-19_

`enabled` is an **input you set**; `isFetching` is an **output TanStack gives
back**. Both are built in — you never define `isFetching` yourself.

- `enabled` — "is this query allowed to run?"
- `isFetching` — "is a `queryFn` call in flight right now?"

A `useQuery` fires as soon as the component mounts. `enabled` is the gate on
that front door. In `web/src/features/import/hooks/useSearchResults.ts`:

```ts
enabled: query.trim().length > 0,
```

The import page mounts with `query = ""`. Without this line, TanStack would
immediately search TMDB for an empty string on every page load. With it, the
query sits inert until the user actually submits a term.

## `enabled` is the declarative version of a `useEffect` guard

The hand-rolled equivalent, and how each piece maps:

```ts
useEffect(() => {
  if (query.trim().length === 0) return;   // → enabled
  setIsLoading(true);
  getSearchResults({ provider, query, limit })
    .then(...)
    .finally(() => setIsLoading(false));
}, [provider, query, limit]);              // → queryKey
```

The effect body → `queryFn`; the `isLoading`/`error`/`data` `useState`s → the
flags `useQuery` returns. What the effect version doesn't give you for free —
and the actual reason to use the library — is that because `queryKey` includes
`query`, searching "batman" → "superman" → "batman" serves the third from
cache with no network call. Plus request dedup and stale-while-revalidate.

## `status` and `fetchStatus` are two separate axes

`isFetching` is just `fetchStatus === "fetching"`. It is **not** defined by
`enabled` — every cell below is reachable:

|                     | `fetchStatus: "fetching"`     | `fetchStatus: "idle"`          |
| ------------------- | ----------------------------- | ------------------------------ |
| `status: "pending"` | first load in flight          | **disabled / waiting** (`query === ""`) |
| `status: "success"` | background refetch of cache   | settled, showing data          |

The relationship is one-way: `enabled: false` guarantees `isFetching` is
`false`. But `isFetching === false` says nothing about `enabled` — the query
could be enabled and simply finished. Background refetches (window focus, a
manual `refetch()`, a remount over stale data) flip `isFetching` with
`enabled` true the whole time.

Practical consequence in `import-page.tsx`: the skeleton branches on
`isFetching`, **not** `isPending`. A disabled query is `pending` forever, so
`isPending` would pin the skeleton on screen before the first search. The
tradeoff is that a background refetch of loaded results would swap the grid
for the skeleton — if that ever flickers, branch on `isPending && isFetching`
instead and let `data` keep rendering.

Related: a new `query` means a new `queryKey`, so `data` returns to
`undefined` while the next search loads (grid → skeleton, not grid → grid).
`placeholderData: keepPreviousData` keeps the old results visible if that's
preferred.
