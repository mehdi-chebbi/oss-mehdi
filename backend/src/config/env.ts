export const env = {
  jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production",
  accessTokenTTL: "15m",
  refreshTokenTTL: "7d",
  refreshTokenGracePeriodMs: 5_000, // 5s grace window for rotation race conditions
  port: Number(process.env.PORT) || 8000,
  cookieDomain: process.env.COOKIE_DOMAIN || undefined, // e.g. ".oss.org" in production
  // Decoupled from NODE_ENV so you can run prod-mode code over HTTP locally
  // (browsers reject Secure cookies on http://). Defaults to secure in prod.
  cookieSecure: process.env.COOKIE_SECURE === "false" ? false : process.env.NODE_ENV === "production",
  isProduction: process.env.NODE_ENV === "production",
  // Comma-separated list of allowed origins for CORS (e.g. "https://oss.org,https://admin.oss.org")
  // In dev, if empty, defaults to allowing all origins (since Vite proxy makes requests same-origin)
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : [],

  // Trust proxy (set to "true" when behind nginx/Caddy/load balancer so req.ip is real client IP)
  trustProxy: process.env.TRUST_PROXY === "true",

  // ── Cloudflare Turnstile CAPTCHA ──
  // Defaults are Cloudflare's "always passes" TEST keys — replace with real keys in production.
  // Always-passes:  site 1x00000000000000000000AA  secret 1x0000000000000000000000000000000AA
  // Always-blocks:   site 2x00000000000000000000AA  secret 2x0000000000000000000000000000000AA
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
  turnstileSecret: process.env.TURNSTILE_SECRET || "1x0000000000000000000000000000000AA",

  // ── Per-email fail tracking ──
  maxFails: 5, // after this many fails in the window, CAPTCHA is required for this email
  failWindowMs: 15 * 60 * 1000, // 15 min
  baseDelayMs: 1000, // first-fail delay before next attempt
  maxDelayMs: 30_000, // cap on progressive delay

  // ── Refresh family abuse limit ──
  refreshFamilyMax: 30, // max successful refreshes per family per window
  refreshFamilyWindowMs: 60 * 60 * 1000, // 1 hour
};
