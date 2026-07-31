export const env = {
  jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production",
  accessTokenTTL: "15m",
  refreshTokenTTL: "7d",
  port: Number(process.env.PORT) || 8000,
};
