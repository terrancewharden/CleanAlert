import { Router } from "express";
import pool from "../db/index.js";
import { requireAuth, requireCleaner } from "../middleware/auth.js";

const router = Router();

// GET /api/contracts — public feed (active cleaners only in prod)
router.get("/", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.company_name as buyer_company
     FROM contracts c JOIN users u ON c.buyer_id=u.id
     WHERE c.status='active' ORDER BY c.created_at DESC LIMIT 50`
  );
  res.json(rows);
});

// POST /api/contracts — buyer posts a contract
router.post("/", requireAuth, async (req, res) => {
  const { business_name, location, zip, facility_type, sqft, frequency, contract_length, budget, start_date, notes } = req.body;
  if (req.user.user_type !== "buyer" && req.user.user_type !== "admin")
    return res.status(403).json({ error: "Buyers only" });

  // Calculate end_date from contract_length
  const lengthMap = { "30 days": 30, "3 months": 90, "6 months": 180, "1 year": 365, "Ongoing": null };
  const days = lengthMap[contract_length];
  const end_date = days && start_date ? new Date(new Date(start_date).getTime() + days * 86400000).toISOString().split("T")[0] : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO contracts (buyer_id,business_name,location,zip,facility_type,sqft,frequency,contract_length,budget,start_date,end_date,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user.id, business_name, location, zip, facility_type, sqft, frequency, contract_length, budget, start_date || null, end_date, notes || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contracts/my — cleaner's active contracts (accepted responses)
router.get("/my", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, r.status as response_status, r.created_at as responded_at,
            u.company_name as buyer_company,
            EXTRACT(DAY FROM (c.end_date - NOW())) as days_remaining
     FROM contracts c
     JOIN responses r ON r.contract_id=c.id AND r.cleaner_id=$1
     JOIN users u ON c.buyer_id=u.id
     WHERE r.status='accepted'
     ORDER BY c.end_date ASC NULLS LAST`,
    [req.user.id]
  );
  res.json(rows);
});

// GET /api/contracts/posted — buyer's posted contracts
router.get("/posted", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*,
       (SELECT COUNT(*) FROM responses r WHERE r.contract_id=c.id) as response_count,
       (SELECT COUNT(*) FROM responses r WHERE r.contract_id=c.id AND r.status='accepted') as accepted_count
     FROM contracts c WHERE c.buyer_id=$1 ORDER BY c.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// GET /api/contracts/:id — contract detail with responses
router.get("/:id", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM contracts WHERE id=$1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  const contract = rows[0];

  const { rows: responses } = await pool.query(
    `SELECT r.*, u.name, u.company_name, u.rating, u.review_count
     FROM responses r JOIN users u ON r.cleaner_id=u.id
     WHERE r.contract_id=$1 ORDER BY r.created_at DESC`,
    [req.params.id]
  );
  res.json({ ...contract, responses });
});

// POST /api/contracts/:id/respond — cleaner expresses interest
router.post("/:id/respond", requireCleaner, async (req, res) => {
  const { message, share_deal } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO responses (contract_id,cleaner_id,message,share_deal)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (contract_id,cleaner_id) DO UPDATE SET message=EXCLUDED.message
       RETURNING *`,
      [req.params.id, req.user.id, message, share_deal !== false]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contracts/:id/accept/:responseId — buyer accepts a response → creates deal
router.post("/:id/accept/:responseId", requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: [resp] } = await client.query(
      "UPDATE responses SET status='accepted' WHERE id=$1 AND contract_id=$2 RETURNING *",
      [req.params.responseId, req.params.id]
    );
    if (!resp) throw new Error("Response not found");

    const { rows: [contract] } = await client.query("SELECT * FROM contracts WHERE id=$1", [req.params.id]);
    const budgetValue = contract.budget?.replace(/[^$0-9,–-]/g, "").split("–")[0] || contract.budget;

    const { rows: [deal] } = await client.query(
      `INSERT INTO deals (contract_id,cleaner_id,buyer_id,monthly_value,share_publicly)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, resp.cleaner_id, req.user.id, budgetValue, resp.share_deal]
    );
    await client.query("UPDATE contracts SET status='closed' WHERE id=$1", [req.params.id]);
    await client.query("COMMIT");
    res.json(deal);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/contracts/deals/share — cleaner opts their deal into the public wall
router.post("/deals/share", requireAuth, async (req, res) => {
  const { contract_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE deals SET share_publicly=true
       WHERE contract_id=$1 AND cleaner_id=$2 RETURNING *`,
      [contract_id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Deal not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contracts/deals/public — public closed deals feed
router.get("/deals/public", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT d.*, c.facility_type, c.location, c.business_name, c.contract_length,
            u.company_name as cleaner_company
     FROM deals d
     JOIN contracts c ON d.contract_id=c.id
     JOIN users u ON d.cleaner_id=u.id
     WHERE d.share_publicly=true
     ORDER BY d.created_at DESC LIMIT 20`
  );
  res.json(rows);
});

export default router;
