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
  const [contracts, deals] = await Promise.all([
    pool.query(`SELECT 'contract' as type, c.title as detail, u.name as actor, c.created_at
      FROM contracts c JOIN users u ON c.buyer_id=u.id ORDER BY c.created_at DESC LIMIT 10`),
    pool.query(`SELECT 'deal' as type, c.title as detail, u.name as actor, d.created_at
      FROM deals d JOIN contracts c ON d.contract_id=c.id JOIN users u ON d.cleaner_id=u.id ORDER BY d.created_at DESC LIMIT 10`),
  ]);
  const activity = [...contracts.rows, ...deals.rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);
  res.json(activity);
});

export default router;
