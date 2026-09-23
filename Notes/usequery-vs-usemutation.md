# `useQuery` vs `useMutation` — declarative vs imperative

_2026-09-19_

They're opposites on the question "does this run by itself?"

- **`useQuery` runs on mount.** Declarative: "this component needs this data."
  You describe what you want; TanStack fetches it and refetches on its own
  schedule (remount, window focus, stale data). `enabled` is how you say
  "not yet" (see `react-query-enabled-flag.md`).
- **`useMutation` never runs on its own.** Imperative: you get a `mutate`
  function back and nothing happens until you call it.

```ts
const { mutate, isPending } = useMutation({ mutationFn: importTitle });
// nothing has fired yet

<Button onClick={() => mutate(result)}>Import</Button>   // ← fires here
```

This is why there's no `enabled` option on `useMutation` — it would be
meaningless. The trigger is already in your hands.

Rule of thumb: **queries are reads** (safe to run automatically, safe to run
twice), **mutations are writes** (must only happen when the user actually does
something). You'd never want a POST firing because a component mounted.

## Where this lands in the import feature

`web/src/features/import/components/result-card.tsx` currently fakes the
import with local state:

```ts
function handleImport() {
  // TODO: wire to the backend import endpoint once it exists.
  setIsAdded(true);
  gooeyToast.success(`${result.title} added to the library`);
}
```

When the backend endpoint exists, that becomes a `useMutation`: `mutate()`
replaces the `setIsAdded` call, `isPending` drives a spinner/disabled state on
the button, and `onSuccess` fires the toast and flips it to `✓ Added`.
