import { Router } from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/reviews — buyer submits review of cleaner after deal
router.post("/", requireAuth, async (req, res) => {
  const { deal_id, reviewee_id, rating, comment } = req.body;
  if (!deal_id || !reviewee_id || !rating) return res.status(400).json({ error: "Missing fields" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO reviews (deal_id,reviewer_id,reviewee_id,rating,comment) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [deal_id, req.user.id, reviewee_id, rating, comment || null]
    );
    // Update cleaner avg rating
    await pool.query(
      `UPDATE users SET
         rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id=$1),
         review_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id=$1)
       WHERE id=$1`,
      [reviewee_id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/cleaner/:id — get a cleaner's reviews
router.get("/cleaner/:id", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, u.name as reviewer_name, u.company_name
     FROM reviews r JOIN users u ON r.reviewer_id=u.id
     WHERE r.reviewee_id=$1 ORDER BY r.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
});

export default router;
