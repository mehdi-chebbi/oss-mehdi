import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { env } from "./config/env.js";
import { pool, query } from "./config/db.js";
import { cleanupExpiredTokens } from "./utils/tokens.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import heroRoutes from "./routes/hero.js";
import fieldsRoutes from "./routes/fields.js";
import toolsRoutes from "./routes/tools.js";
import partnersRoutes from "./routes/partners.js";
import socialsRoutes from "./routes/socials.js";
import uploadRoutes from "./routes/upload.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms${req.method !== "GET" && req.body ? ` body=${JSON.stringify(req.body)}` : ""}`);
  });
  next();
});

// CORS — only allow specific origins when credentials are involved
// (browsers reject Access-Control-Allow-Origin: * with credentials)
// In production, ALLOWED_ORIGINS must be set to prevent any origin from
// riding the user's session cookie. In dev, the Vite proxy makes requests
// same-origin so CORS is not needed.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    // Cross-origin request — check against allowlist
    if (env.allowedOrigins.length > 0 && !env.allowedOrigins.includes(origin)) {
      // Origin not in allowlist — don't set CORS headers, browser will block
      if (req.method === "OPTIONS") {
        res.sendStatus(403);
        return;
      }
      // For non-preflight requests, still don't set CORS headers
      // The browser will block the response from being read by the requesting origin
      next();
      return;
    }

    // Origin is allowlisted (or no allowlist configured in dev)
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
  } else {
    // No Origin header = same-origin request or non-browser client
    // Wildcard is fine here since there's no credentials header to protect
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/fields", fieldsRoutes);
app.use("/api/tools", toolsRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api/socials", socialsRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// Run DB migrations on startup, then start server
async function start() {
  try {
    // Run refresh_tokens migration
    const migration = fs.readFileSync(
      path.resolve(process.cwd(), "src/db/refresh_tokens.sql"),
      "utf8",
    );
    await query(migration);
    console.log("✅ DB migrations applied");
  } catch (err) {
    console.warn("⚠️  Migration warning (table may already exist):", (err as Error).message);
  }

  // Periodic cleanup of expired refresh tokens (every hour)
  const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const count = await cleanupExpiredTokens();
      if (count > 0) {
        console.log(`🧹 Cleaned up ${count} expired refresh token(s)`);
      }
    } catch (err) {
      console.error("Token cleanup failed:", err);
    }
  }, CLEANUP_INTERVAL_MS);

  app.listen(env.port, () => {
    console.log(`Backend running on port ${env.port}`);
  });
}

start();
