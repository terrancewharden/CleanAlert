import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pool from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");

try {
  await pool.query(schema);
  console.log("✓ Database schema applied");
  process.exit(0);
} catch (err) {
  console.error("Schema error:", err.message);
  process.exit(1);
}
