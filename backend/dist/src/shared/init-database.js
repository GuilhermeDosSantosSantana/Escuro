import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
export async function initializeDatabase(databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db") {
    process.env.DATABASE_URL = databaseUrl;
    const prisma = new PrismaClient();
    const migrationsDir = resolve(process.cwd(), "prisma", "migrations", "20260601120000_init", "migration.sql");
    const dbPath = resolve(process.cwd(), "prisma", databaseUrl.replace("file:", "").replace("./", ""));
    if (!existsSync(dbPath)) {
        const sql = await readFile(migrationsDir, "utf8");
        const statements = sql
            .split(";")
            .map((statement) => statement.trim())
            .filter(Boolean);
        for (const statement of statements) {
            await prisma.$executeRawUnsafe(statement);
        }
    }
    await prisma.$disconnect();
}
