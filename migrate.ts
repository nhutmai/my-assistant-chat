import "dotenv/config";
import pg from "pg";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, "src", "server", "migrations");

// ── Helpers ────────────────────────────────────────────────────────

function createPool(): pg.Pool {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (connectionString) {
    return new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }

  return new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
}

// ── Migration tracking table ──────────────────────────────────────

async function ensureMigrationTable(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getAppliedMigrations(pool: pg.Pool): Promise<Set<string>> {
  const result = await pool.query("SELECT name FROM _migrations ORDER BY id");
  return new Set(result.rows.map((r: { name: string }) => r.name));
}

async function markApplied(pool: pg.Pool, name: string): Promise<void> {
  await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
}

// ── Commands ──────────────────────────────────────────────────────

async function getMigrationFiles(): Promise<string[]> {
  const files = await readdir(MIGRATIONS_DIR);
  return files
    .filter((f) => f.endsWith(".sql"))
    .sort(); // Sort alphabetically (001_, 002_, ...)
}

async function runMigrations(): Promise<void> {
  const pool = createPool();

  try {
    await ensureMigrationTable(pool);
    const applied = await getAppliedMigrations(pool);
    const files = await getMigrationFiles();
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log("✅ All migrations are up to date.");
      return;
    }

    console.log(`📦 Found ${pending.length} pending migration(s):\n`);

    for (const file of pending) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = await readFile(filePath, "utf8");

      console.log(`  ⏳ Running: ${file}...`);

      await pool.query("BEGIN");
      try {
        await pool.query(sql);
        await markApplied(pool, file);
        await pool.query("COMMIT");
        console.log(`  ✅ Applied: ${file}`);
      } catch (err) {
        await pool.query("ROLLBACK");
        console.error(`  ❌ Failed: ${file}`);
        throw err;
      }
    }

    console.log("\n🎉 All migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

async function showStatus(): Promise<void> {
  const pool = createPool();

  try {
    await ensureMigrationTable(pool);
    const applied = await getAppliedMigrations(pool);
    const files = await getMigrationFiles();

    console.log("📊 Migration Status:\n");
    console.log("  File                                           Status");
    console.log("  ─────────────────────────────────────────────  ──────");

    for (const file of files) {
      const status = applied.has(file) ? "✅ Applied" : "⏳ Pending";
      console.log(`  ${file.padEnd(47)} ${status}`);
    }

    const pending = files.filter((f) => !applied.has(f));
    console.log(`\n  Total: ${files.length} | Applied: ${applied.size} | Pending: ${pending.length}`);
  } finally {
    await pool.end();
  }
}

// ── CLI ───────────────────────────────────────────────────────────

const command = process.argv[2];

switch (command) {
  case "up":
  case undefined:
    runMigrations().catch((err) => {
      console.error("\n💥 Migration error:", err.message);
      process.exit(1);
    });
    break;

  case "status":
    showStatus().catch((err) => {
      console.error("\n💥 Status check error:", err.message);
      process.exit(1);
    });
    break;

  default:
    console.log(`
Usage: npm run migrate [command]

Commands:
  up       Run all pending migrations (default)
  status   Show migration status
    `);
    break;
}
