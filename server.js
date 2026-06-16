import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./routes/auth.js";
import contractRoutes from "./routes/contracts.js";
import adminRoutes from "./routes/admin.js";
import stripeRoutes from "./routes/stripe.js";
import reviewRoutes from "./routes/reviews.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Stripe webhook needs raw body BEFORE json middleware
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve React build
app.use(express.static(join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CleanAlert v2 running on port ${PORT}`);
});
