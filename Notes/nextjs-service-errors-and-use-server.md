# Next.js Service Errors and `use server`

Date: 2026-09-28

## Error contract

* A TanStack Query query function should resolve with data or reject with an `Error`.
* `fetch` does not reject for HTTP error status codes. Check `response.ok` and throw.
* A successful search with no matches is data, usually an empty `results` array, not an error.
* Schema validation failure is an integration failure. Throw an internal typed error and show a stable user message at the UI boundary.
* Avoid wrapping query results in `{ success, data, error }` only to throw from the query hook. That duplicates the error channel.
* For a Server Function, Next.js treats failed requests and form validation as expected errors. Return a serializable result for those expected cases. Reserve thrown exceptions for unexpected failures.

## `use server` is an RPC boundary

* `"use server"` marks exported async functions as Server Functions that client code can invoke. It is not a general marker for ordinary server modules.
* Server Functions must validate input and enforce authentication and authorization because the client can invoke them.
* Their arguments and return values cross a serialization boundary.
* Next.js says Server Actions primarily exist for mutations. They are queued, so using them for reads can make otherwise independent requests run sequentially.

## Recommended StarChart split

* Server Component reads, such as loading search categories, should call the backend helper directly. The helper can throw and should use `import "server-only"` to prevent accidental client imports. It does not need `"use server"`.
* Interactive reads managed by TanStack Query should call a GET Route Handler. The Route Handler can authenticate the request and proxy the private FastAPI URL. The browser query function should throw on a non-success HTTP response or invalid JSON shape.
* Server Components should call the backend helper directly instead of calling the Route Handler, which would add an unnecessary HTTP round trip.
* Use a Server Function for a client initiated mutation, such as importing or saving a selected media item. Return explicit expected validation or conflict errors. Throw unexpected infrastructure failures.

## Simple clarification, 2026-09-28

* An `async` function immediately returns a Promise. TanStack Query needs that Promise, so `queryFn: () => getSearchResults()` can return it directly. Adding `async` and `await` is only needed when the wrapper must do more work, such as catching or changing the result.
* Throwing inside an `async` function rejects its Promise. TanStack Query sees the rejected Promise and sets `isError` and `error`.
* `fetch` does not throw for HTTP responses such as 404 or 500. The service must check `response.ok` and throw when the status represents failure.
* `import "server-only"` means the file must never be imported into browser code. It is a safety check.
* `"use server"` means browser code is allowed to call the exported function on the server. It creates a client to server call boundary.
* A helper used only by a Server Component does not require either marker to run on the server. `server-only` is still useful because it prevents a future accidental client import.

## Sources

* https://nextjs.org/docs/app/api-reference/directives/use-server
* https://nextjs.org/docs/app/guides/backend-for-frontend
* https://nextjs.org/docs/app/getting-started/error-handling
* https://nextjs.org/docs/app/getting-started/server-and-client-components
* https://nextjs.org/docs/app/api-reference/file-conventions/route
* https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
