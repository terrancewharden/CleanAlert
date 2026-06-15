import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.user_type !== "admin") return res.status(403).json({ error: "Admin only" });
    next();
  });
}

export function requireCleaner(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.user_type !== "cleaner") return res.status(403).json({ error: "Cleaners only" });
    next();
  });
}
