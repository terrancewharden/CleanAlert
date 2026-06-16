import { Router } from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Verify the requesting user belongs to this deal
async function verifyDealAccess(dealId, userId) {
  const { rows } = await pool.query(
    "SELECT * FROM deals WHERE id=$1 AND (buyer_id=$2 OR cleaner_id=$2)",
    [dealId, userId]
  );
  return rows[0] || null;
}

// GET /api/messages/:dealId — fetch thread
router.get("/:dealId", requireAuth, async (req, res) => {
  const deal = await verifyDealAccess(req.params.dealId, req.user.id);
  if (!deal) return res.status(403).json({ error: "Access denied" });

  const { rows } = await pool.query(
    `SELECT m.*, u.name as sender_name, u.user_type as sender_type
     FROM messages m JOIN users u ON m.sender_id=u.id
     WHERE m.deal_id=$1 ORDER BY m.created_at ASC`,
    [req.params.dealId]
  );
  res.json(rows);
});

// POST /api/messages/:dealId — send a message
router.post("/:dealId", requireAuth, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: "Empty message" });

  const deal = await verifyDealAccess(req.params.dealId, req.user.id);
  if (!deal) return res.status(403).json({ error: "Access denied" });

  const { rows } = await pool.query(
    "INSERT INTO messages (deal_id,sender_id,body) VALUES ($1,$2,$3) RETURNING *",
    [req.params.dealId, req.user.id, body.trim()]
  );
  res.json(rows[0]);
});

export default router;
