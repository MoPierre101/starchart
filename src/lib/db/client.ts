import Surreal from 'surrealdb'

// Module-level singleton — one connection reused across all server-side calls.
// SurrealDB's JS SDK is stateful: connect() opens a WebSocket, so we avoid
// re-connecting on every request by caching the instance here.
let db: Surreal | null = null

export async function getDb(): Promise<Surreal> {
  if (db) return db

  db = new Surreal()

  // ASSUMED: SurrealDB is running locally on the default RPC port.
  // Replace SURREAL_URL in your .env with the actual host in production.
  await db.connect(process.env.SURREAL_URL ?? 'http://127.0.0.1:8000/rpc')

  // ASSUMED: root credentials used as a placeholder.
  // In production this should be a scoped user, not root.
  await db.signin({
    username: process.env.SURREAL_USER ?? 'root',
    password: process.env.SURREAL_PASS ?? 'root',
  })

  // ASSUMED: namespace and database both named 'starchart'.
  // Adjust SURREAL_NS / SURREAL_DB in .env if your schema uses different names.
  await db.use({
    namespace: process.env.SURREAL_NS ?? 'starchart',
    database: process.env.SURREAL_DB ?? 'starchart',
  })

  return db
}
