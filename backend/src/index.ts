import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { cleanupExpiredTokens } from "./utils/tokens.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import heroRoutes from "./routes/hero.js";
import fieldsRoutes from "./routes/fields.js";
import toolsRoutes from "./routes/tools.js";
import partnersRoutes from "./routes/partners.js";
import socialsRoutes from "./routes/socials.js";
import newsRoutes from "./routes/news.js";
import departmentsRoutes from "./routes/departments.js";
import projectsRoutes from "./routes/projects.js";
import uploadRoutes from "./routes/upload.js";

// ── Fail-fast env validation ──
// In production, refuse to boot if secrets are missing or still set to their
// insecure defaults. This guarantees a misconfigured deploy fails loudly
// instead of silently running with publicly-known keys.
const DEFAULT_SECRETS = [
  "super-secret-jwt-key-change-in-production",
  "super-secret-refresh-key-change-in-production",
];
const TURNSTILE_ALWAYS_PASS_SECRET = "1x0000000000000000000000000000000AA";

function validateEnv() {
  if (!env.isProduction) return; // dev is lenient

  const fatal = (msg: string) => {
    console.error(`FATAL: ${msg}`);
    process.exit(1);
  };

  if (!process.env.JWT_SECRET || DEFAULT_SECRETS.includes(process.env.JWT_SECRET)) {
    fatal("JWT_SECRET must be set to a non-default value in production");
  }
  if (
    !process.env.JWT_REFRESH_SECRET ||
    DEFAULT_SECRETS.includes(process.env.JWT_REFRESH_SECRET)
  ) {
    fatal("JWT_REFRESH_SECRET must be set to a non-default value in production");
  }
  if (
    !process.env.TURNSTILE_SECRET ||
    process.env.TURNSTILE_SECRET === TURNSTILE_ALWAYS_PASS_SECRET
  ) {
    fatal("TURNSTILE_SECRET must be set to a real (non-test) value in production");
  }
}

validateEnv();

const app = express();

// Trust the proxy hop so req.ip reflects the real client IP (needed for IP-based
// rate limiting to work behind nginx/Caddy/load balancers). Enable via TRUST_PROXY=true.
if (env.trustProxy) {
  app.set("trust proxy", 1);
}

// Security headers (Helmet). crossOriginResourcePolicy is relaxed so uploaded
// images served from /uploads can be embedded cross-origin by the frontend.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

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
app.use("/api/news", newsRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/projects", projectsRoutes);
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

// Start server
async function start() {
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
