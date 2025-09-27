import dotenv from "dotenv";
import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function main() {
  const sqlPath = path.join(__dirname, "db", "migrations.sql");
  const sql = await fs.readFile(sqlPath, "utf8");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(sql);
    console.log("✅ Migrations applied successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Migration runner error:", e);
  process.exit(1);
});
