import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Global type declaration to support hot reloading in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Set up the PostgreSQL connection pool
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the adapter required for Prisma 7 PostgreSQL connections
const adapter = new PrismaPg(pool);

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
