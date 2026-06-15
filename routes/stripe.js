import { Router } from "express";
import Stripe from "stripe";
import pool from "../db/index.js";
import { requireAuth, requireCleaner } from "../middleware/auth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = Router();

// POST /api/stripe/create-checkout
router.post("/create-checkout", requireAuth, requireCleaner, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [req.user.id]);
    const user = rows[0];

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      await pool.query("UPDATE users SET stripe_customer_id=$1 WHERE id=$2", [customerId, user.id]);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.APP_URL || "https://cleanalert-production.up.railway.app"}/subscribe/success`,
      cancel_url: `${process.env.APP_URL || "https://cleanalert-production.up.railway.app"}/subscribe`,
      metadata: { user_id: user.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/webhook
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.user_id;
    if (userId) {
      await pool.query(
        "UPDATE users SET stripe_subscription_id=$1, subscription_status='active' WHERE id=$2",
        [session.subscription, userId]
      );
    }
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.paused") {
    const sub = await stripe.subscriptions.retrieve(session.id);
    await pool.query(
      "UPDATE users SET subscription_status='inactive' WHERE stripe_customer_id=$1",
      [sub.customer]
    );
  }

  if (event.type === "customer.subscription.updated") {
    const status = session.status === "active" ? "active" : "inactive";
    await pool.query(
      "UPDATE users SET subscription_status=$1 WHERE stripe_customer_id=$2",
      [status, session.customer]
    );
  }

  res.json({ received: true });
});

export default router;
