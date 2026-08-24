import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

// Prisma runs outside Next.js, so I load the same root environment files here.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
