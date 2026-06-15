import pg from "pg";
const { Pool } = pg;

// Neon requires SSL always — rejectUnauthorized:false accepts Neon's cert
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
