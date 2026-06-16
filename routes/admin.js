import { Router } from "express";
import pool from "../db/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/admin/stats
router.get("/stats", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [users, contracts, deals, revenue, subs] = await Promise.all([
      pool.query("SELECT user_type, COUNT(*) FROM users GROUP BY user_type"),
      pool.query("SELECT COUNT(*) FROM contracts"),
      pool.query("SELECT COUNT(*) FROM deals"),
      pool.query("SELECT COUNT(*) FROM users WHERE subscription_status='active'"),
      pool.query("SELECT COUNT(*) FROM users WHERE subscription_status='active' AND user_type='cleaner'"),
    ]);
    res.json({
      usersByType: users.rows,
      totalContracts: parseInt(contracts.rows[0].count),
      totalDeals: parseInt(deals.rows[0].count),
      activeSubscribers: parseInt(subs.rows[0].count),
      mrr: parseInt(subs.rows[0].count) * 29, // $29/mo plan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    "SELECT id,name,email,user_type,company_name,subscription_status,is_banned,created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  res.json(rows);
});

// POST /api/admin/users/:id/ban
router.post("/users/:id/ban", requireAuth, requireAdmin, async (req, res) => {
  const { is_banned } = req.body;
  await pool.query("UPDATE users SET is_banned=$1 WHERE id=$2", [is_banned, req.params.id]);
  res.json({ ok: true });
});

// GET /api/admin/recent — last 20 activities
router.get("/recent", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const contractsResult = await pool.query(
      `SELECT 'contract' as type, c.business_name as detail, u.name as actor, c.created_at
       FROM contracts c JOIN users u ON c.buyer_id=u.id ORDER BY c.created_at DESC LIMIT 10`
    );
    let dealsRows = [];
    try {
      const dealsResult = await pool.query(
        `SELECT 'deal' as type, c.business_name as detail, u.name as actor, r.created_at
         FROM responses r JOIN contracts c ON r.contract_id=c.id JOIN users u ON r.cleaner_id=u.id
         WHERE r.status='accepted' ORDER BY r.created_at DESC LIMIT 10`
      );
      dealsRows = dealsResult.rows;
    } catch (_) { /* responses may be empty — skip */ }
    const activity = [...contractsResult.rows, ...dealsRows]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20);
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/promo-codes
router.get("/promo-codes", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM promo_codes ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/promo-codes — create a new code
router.post("/promo-codes", requireAuth, requireAdmin, async (req, res) => {
  const { code, trial_days = 90, max_uses, note, expires_at } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO promo_codes (code, trial_days, max_uses, note, expires_at)
       VALUES (UPPER($1), $2, $3, $4, $5) RETURNING *`,
      [code.trim(), trial_days, max_uses || null, note || null, expires_at || null]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Code already exists" });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/promo-codes/:id — toggle active / update
router.patch("/promo-codes/:id", requireAuth, requireAdmin, async (req, res) => {
  const { is_active } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE promo_codes SET is_active=$1 WHERE id=$2 RETURNING *",
      [is_active, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
