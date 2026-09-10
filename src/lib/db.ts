import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalDatabase = globalThis as unknown as { database?: PrismaClient };

export function getDatabase() {
  if (!process.env.DATABASE_URL) return null;
  if (!globalDatabase.database) {
    globalDatabase.database = new PrismaClient({
      adapter: new PrismaMariaDb(process.env.DATABASE_URL),
    });
  }
  return globalDatabase.database;
}
