export const env = {
  jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production",
  accessTokenTTL: "15m",
  refreshTokenTTL: "7d",
  refreshTokenGracePeriodMs: 5_000, // 5s grace window for rotation race conditions
  port: Number(process.env.PORT) || 8000,
  cookieDomain: process.env.COOKIE_DOMAIN || undefined, // e.g. ".oss.org" in production
  isProduction: process.env.NODE_ENV === "production",
  // Comma-separated list of allowed origins for CORS (e.g. "https://oss.org,https://admin.oss.org")
  // In dev, if empty, defaults to allowing all origins (since Vite proxy makes requests same-origin)
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : [],
};
