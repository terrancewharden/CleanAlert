import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const sign = (user) => jwt.sign(
  { id: user.id, email: user.email, user_type: user.user_type, name: user.name, subscription_status: user.subscription_status },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, name, user_type, company_name, location, admin_code } = req.body;
  if (!email || !password || !name || !user_type) return res.status(400).json({ error: "Missing fields" });
  if (!["buyer","cleaner"].includes(user_type) && !(user_type === "admin" && admin_code === process.env.ADMIN_CODE))
    return res.status(400).json({ error: "Invalid user type" });

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) return res.status(409).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const finalType = user_type === "admin" && admin_code === process.env.ADMIN_CODE ? "admin" : user_type;
    const { rows } = await pool.query(
      "INSERT INTO users (email,password_hash,name,user_type,company_name,location) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [email, password_hash, name, finalType, company_name || null, location || null]
    );
    res.json({ token: sign(rows[0]), user: sanitize(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    if (user.is_banned) return res.status(403).json({ error: "Account suspended" });
    if (!await bcrypt.compare(password, user.password_hash)) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: sign(user), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: "User not found" });
  res.json({ user: sanitize(rows[0]) });
});

function sanitize(u) {
  const { password_hash, ...safe } = u;
  return safe;
}

export default router;
