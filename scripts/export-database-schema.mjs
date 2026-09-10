import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const migrationDirectory = path.join(root, "prisma", "migrations");
const migrations = (await readdir(migrationDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const sections = await Promise.all(migrations.map(async (name) =>
  `-- Migration: ${name}\n${(await readFile(path.join(migrationDirectory, name, "migration.sql"), "utf8")).replace(/^\uFEFF/, "")}`));
const outputDirectory = path.join(root, "prisma", "exports");
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "schema.sql"), [
  "-- Adventures Moto: schema-only bootstrap for an EMPTY database.",
  "-- Requires MySQL >= 8.0.16 or MariaDB >= 10.2.1; verify your hosting version.",
  "-- Generated from migration history. No credentials, product data or migration bookkeeping.",
  "-- Do not import into an existing database. See docs/database-schema.md for baselining.",
  "SET NAMES utf8mb4;", ...sections,
].join("\n\n"), "utf8");
console.log(`Exported ${migrations.length} migrations to prisma/exports/schema.sql`);
