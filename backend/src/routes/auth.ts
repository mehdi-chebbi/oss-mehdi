import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  logoutEverywhere,
  me,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearCookieOptions,
} from "../services/auth.js";
import { authMiddleware } from "../middleware/auth.js";
import { ipRateLimit, getClientIp } from "../utils/security.js";

const router = Router();

// ── Rate-limit presets (per IP, per endpoint) ──
const loginLimiter = ipRateLimit({ windowMs: 60_000, max: 10, keySuffix: "login" });
const registerLimiter = ipRateLimit({ windowMs: 60_000, max: 5, keySuffix: "register" });
const refreshLimiter = ipRateLimit({ windowMs: 60_000, max: 30, keySuffix: "refresh" });
const logoutLimiter = ipRateLimit({ windowMs: 60_000, max: 20, keySuffix: "logout" });

// ── CSRF protection: verify Origin/Referer on cookie-authenticated endpoints ──
// Fails CLOSED: if both Origin and Referer are missing, the request is rejected.
// This prevents CSRF attacks from environments that strip these headers.

function csrfCheck(req: any, res: any, next: any) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // In production, require at least one of Origin or Referer
  if (process.env.NODE_ENV === "production") {
    const allowed = process.env.CSRF_ORIGIN; // e.g. "https://oss.org"

    if (!origin && !referer) {
      // Fail closed — no origin info at all
      res.status(403).json({ error: "CSRF check failed: missing Origin and Referer" });
      return;
    }

    if (allowed) {
      if (origin && origin !== allowed) {
        res.status(403).json({ error: "CSRF origin mismatch" });
        return;
      }
      if (!origin && referer && !referer.startsWith(allowed)) {
        res.status(403).json({ error: "CSRF referer mismatch" });
        return;
      }
    }
  }
  // In dev, skip CSRF check (Vite proxy doesn't add Origin header)
  next();
}

// ── Routes ──

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, email, password, captchaToken } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email, and password are required" });
      return;
    }
    const data = await register(name, email, password, captchaToken, getClientIp(req));

    // Set refresh token as httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions());

    // Return access token + user (NOT the refresh token in body)
    res.status(201).json({ user: data.user, accessToken: data.accessToken });
  } catch (err: any) {
    if (err.message === "CAPTCHA_REQUIRED") {
      res.status(400).json({ error: "captcha_required" });
      return;
    }
    if (err.message === "UNABLE_TO_REGISTER") {
      // Generic message — do NOT reveal that the email is already taken
      res.status(409).json({ error: "Unable to create account" });
      return;
    }
    // Password-strength / validation errors
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    const data = await login(email, password, captchaToken, getClientIp(req));

    // Set refresh token as httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions());

    console.log(`[AUTH] login OK user=${data.user.id} email=${data.user.email}`);

    // Return access token + user (NOT the refresh token in body)
    res.json({ user: data.user, accessToken: data.accessToken });
  } catch (err: any) {
    if (err.message === "CAPTCHA_REQUIRED") {
      // 400 (not 401) so the frontend's 401-refresh interceptor doesn't fire
      res.status(400).json({ error: "captcha_required" });
      return;
    }
    // "Invalid credentials" is the only expected auth error from login().
    // Anything else is a DB / infra failure — don't mislabel it as 401.
    if (err.message === "Invalid credentials") {
      console.log(`[AUTH] login FAIL email=${req.body?.email} reason="invalid credentials"`);
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      console.error("[AUTH] login ERROR:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
});

router.post("/refresh", csrfCheck, refreshLimiter, async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      // No session — return 204 (not 401) so it doesn't show as an error in
      // the browser console on public pages. The frontend treats 204 as
      // "no active session" and stays logged out silently.
      res.status(204).end();
      return;
    }

    const data = await refresh(token);

    // Rotate the cookie if a new refresh token was issued
    if (data.refreshToken) {
      res.cookie(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions());
    }

    console.log(`[AUTH] refresh OK user=${data.userId} family=${data.family} reusedGrace=${data.reusedGrace}`);

    res.json({ accessToken: data.accessToken });
  } catch (err: any) {
    // Clear the cookie on any refresh failure
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());

    // Security events (reuse detection) stay loud
    if (err.message === "TOKEN_REUSED") {
      console.warn(`[AUTH] refresh REJECT reason="token_reused" — entire family revoked`);
      res.status(401).json({ error: "SESSION_REVOKED", reason: "reuse_detected" });
    } else if (err.message === "FAMILY_RATE_LIMIT") {
      console.warn(`[AUTH] refresh REJECT reason="family_rate_limit"`);
      res.status(429).json({ error: "Too many refresh attempts" });
    } else {
      console.log(`[AUTH] refresh REJECT reason="${err.message}"`);
      res.status(401).json({ error: err.message });
    }
  }
});

router.post("/logout", csrfCheck, logoutLimiter, async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      const result = await logout(token);
      if (result.userId) console.log(`[AUTH] logout user=${result.userId}`);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
    res.json({ message: "Logged out" });
  } catch {
    // Still clear the cookie even if DB op fails
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
    res.status(500).json({ error: "Logout failed" });
  }
});

router.post(
  "/logout-everywhere",
  csrfCheck,
  logoutLimiter,
  authMiddleware,
  async (req, res) => {
    try {
      await logoutEverywhere(req.user!.userId);
      // Clear the cookie on this browser too
      res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
      res.json({ message: "Logged out everywhere" });
    } catch {
      res.status(500).json({ error: "Logout everywhere failed" });
    }
  },
);

router.get("/me", authMiddleware, async (req, res) => {
  const user = await me(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export default router;
