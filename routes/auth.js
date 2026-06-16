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

function sanitize(u) {
  const { password_hash, ...safe } = u;
  return safe;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, name, user_type, company_name, location, admin_code, promo_code } = req.body;
  if (!email || !password || !name || !user_type) return res.status(400).json({ error: "Missing fields" });
  if (!["buyer","cleaner"].includes(user_type) && !(user_type === "admin" && admin_code === process.env.ADMIN_CODE))
    return res.status(400).json({ error: "Invalid user type" });

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) return res.status(409).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const finalType = user_type === "admin" && admin_code === process.env.ADMIN_CODE ? "admin" : user_type;

    // Handle promo code for cleaners
    let subscription_status = "inactive";
    let trial_ends_at = null;
    let promoRow = null;

    if (finalType === "cleaner" && promo_code) {
      const { rows: codes } = await pool.query(
        `SELECT * FROM promo_codes
         WHERE UPPER(code)=UPPER($1)
           AND is_active=true
           AND (expires_at IS NULL OR expires_at > NOW())
           AND (max_uses IS NULL OR uses_count < max_uses)`,
        [promo_code.trim()]
      );
      if (!codes.length) return res.status(400).json({ error: "Invalid or expired promo code" });
      promoRow = codes[0];
      subscription_status = "trial";
      trial_ends_at = new Date(Date.now() + promoRow.trial_days * 24 * 60 * 60 * 1000).toISOString();
    }

    const { rows } = await pool.query(
      `INSERT INTO users (email,password_hash,name,user_type,company_name,location,subscription_status,trial_ends_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [email, password_hash, name, finalType, company_name||null, location||null, subscription_status, trial_ends_at]
    );

    // Increment promo code usage
    if (promoRow) {
      await pool.query("UPDATE promo_codes SET uses_count=uses_count+1 WHERE id=$1", [promoRow.id]);
    }

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

// GET /api/auth/check-promo?code=XXX — public, validates a promo code
router.get("/check-promo", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "No code" });
  try {
    const { rows } = await pool.query(
      `SELECT id FROM promo_codes
       WHERE UPPER(code)=UPPER($1)
         AND is_active=true
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR uses_count < max_uses)`,
      [code.trim()]
    );
    if (!rows.length) return res.status(404).json({ valid: false });
    res.json({ valid: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: "User not found" });
  res.json(sanitize(rows[0]));
});

export default router;
