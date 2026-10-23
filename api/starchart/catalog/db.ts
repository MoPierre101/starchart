import { SQLDatabase } from "encore.dev/storage/sqldb";

// The one database. Migrations create the starchart tables; the pipeline loads gcd.
export const DB = new SQLDatabase("starchart", { migrations: "./migrations" });
