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
    "SELECT id,name,email,user_type,company_name,subscription_status,scheduled_activation_date,trial_ends_at,is_banned,created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
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

// GET /api/admin/notifications
router.get("/notifications", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT n.*,
              b.name as buyer_name, b.email as buyer_email, b.phone as buyer_phone,
              cl.name as cleaner_name, cl.email as cleaner_email, cl.phone as cleaner_phone,
              cl.company_name as cleaner_company
       FROM admin_notifications n
       JOIN users b ON n.buyer_id=b.id
       JOIN users cl ON n.cleaner_id=cl.id
       ORDER BY n.created_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/notifications/:id — mark read
router.patch("/notifications/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE admin_notifications SET is_read=true WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/users/:id/subscription — activate now, schedule, or cancel
router.patch("/users/:id/subscription", requireAuth, requireAdmin, async (req, res) => {
  const { action, scheduled_date } = req.body;
  try {
    let query, params;
    if (action === "activate_now") {
      query = "UPDATE users SET subscription_status='active', scheduled_activation_date=NULL, trial_ends_at=NULL WHERE id=$1 RETURNING id,name,email,subscription_status,scheduled_activation_date";
      params = [req.params.id];
    } else if (action === "schedule") {
      if (!scheduled_date) return res.status(400).json({ error: "scheduled_date required" });
      query = "UPDATE users SET scheduled_activation_date=$1 WHERE id=$2 RETURNING id,name,email,subscription_status,scheduled_activation_date";
      params = [new Date(scheduled_date).toISOString(), req.params.id];
    } else if (action === "cancel") {
      query = "UPDATE users SET subscription_status='cancelled', scheduled_activation_date=NULL WHERE id=$1 RETURNING id,name,email,subscription_status,scheduled_activation_date";
      params = [req.params.id];
    } else {
      return res.status(400).json({ error: "action must be activate_now | schedule | cancel" });
    }
    const { rows } = await pool.query(query, params);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
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
