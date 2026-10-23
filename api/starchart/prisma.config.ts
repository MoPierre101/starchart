import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Settings for the Prisma CLI. DATABASE_URL comes from `encore db conn-uri starchart`, kept in .env.
export default defineConfig({
  schema: "catalog/prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
