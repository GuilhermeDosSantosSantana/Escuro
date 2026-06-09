import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
async function runSqlFile(prisma, filePath) {
    const sql = await readFile(filePath, "utf8");
    const statements = sql
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);
    for (const statement of statements) {
        await prisma.$executeRawUnsafe(statement);
    }
}
async function runSafeMigrations(prisma) {
    const migrationsRoot = resolve(process.cwd(), "prisma", "migrations");
    if (!existsSync(migrationsRoot)) {
        return;
    }
    const migrationFolders = (await readdir(migrationsRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => name !== "20260601120000_init")
        .sort();
    for (const folder of migrationFolders) {
        const filePath = join(migrationsRoot, folder, "migration.sql");
        if (existsSync(filePath)) {
            await runSqlFile(prisma, filePath);
        }
    }
}
export async function initializeDatabase(databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db") {
    process.env.DATABASE_URL = databaseUrl;
    const prisma = new PrismaClient();
    const initialMigration = resolve(process.cwd(), "prisma", "migrations", "20260601120000_init", "migration.sql");
    const dbPath = resolve(process.cwd(), "prisma", databaseUrl.replace("file:", "").replace("./", ""));
    if (!existsSync(dbPath)) {
        await runSqlFile(prisma, initialMigration);
    }
    await runSafeMigrations(prisma);
    await prisma.$disconnect();
}
