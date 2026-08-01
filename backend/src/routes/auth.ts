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

const router = Router();

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

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email, and password are required" });
      return;
    }
    const data = await register(name, email, password);

    // Set refresh token as httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions());

    // Return access token + user (NOT the refresh token in body)
    res.status(201).json({ user: data.user, accessToken: data.accessToken });
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    const data = await login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions());

    // Return access token + user (NOT the refresh token in body)
    res.json({ user: data.user, accessToken: data.accessToken });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post("/refresh", csrfCheck, async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ error: "No refresh token" });
      return;
    }

    const data = await refresh(token);

    // Rotate the cookie if a new refresh token was issued
    if (data.refreshToken) {
      res.cookie(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions());
    }

    res.json({ accessToken: data.accessToken });
  } catch (err: any) {
    // Clear the cookie on any refresh failure
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());

    if (err.message === "TOKEN_REUSED") {
      res.status(401).json({ error: "SESSION_REVOKED", reason: "reuse_detected" });
    } else {
      res.status(401).json({ error: err.message });
    }
  }
});

router.post("/logout", csrfCheck, async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      await logout(token);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
    res.json({ message: "Logged out" });
  } catch {
    // Still clear the cookie even if DB op fails
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
    res.status(500).json({ error: "Logout failed" });
  }
});

router.post("/logout-everywhere", csrfCheck, authMiddleware, async (req, res) => {
  try {
    await logoutEverywhere(req.user!.userId);
    // Clear the cookie on this browser too
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
    res.json({ message: "Logged out everywhere" });
  } catch {
    res.status(500).json({ error: "Logout everywhere failed" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await me(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export default router;
