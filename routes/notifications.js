import { Router } from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications/mine — user's own notifications (latest 30)
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM user_notifications
       WHERE user_id=$1
       ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/notifications/unread-count
router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM user_notifications WHERE user_id=$1 AND is_read=false",
      [req.user.id]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/:id — mark one read
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE user_notifications SET is_read=true WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/read-all — mark all read
router.post("/read-all", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE user_notifications SET is_read=true WHERE user_id=$1",
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
