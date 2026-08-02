import crypto from "crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import type { Request, Response, NextFunction } from "express";

// ─────────────────────────────────────────────────────────────────────────────
// In-memory rate-limit / fail-tracking stores.
// Suitable for SINGLE-INSTANCE deploys (matches the "no Redis" constraint).
// For multi-instance, back these with a shared store (e.g. rate-limit-redis).
// ─────────────────────────────────────────────────────────────────────────────

interface WindowCounter {
  count: number;
  windowStart: number;
}

interface FailRecord {
  count: number;
  firstFailAt: number;
  lastFailAt: number;
  nextDelayMs: number;
  captchaRequired: boolean;
}

// key: `${ip}:${endpointSuffix}`
const ipCounters = new Map<string, WindowCounter>();
// key: normalized email
const failMap = new Map<string, FailRecord>();
// key: refresh-token family
const familyCounters = new Map<string, WindowCounter>();

// Periodic GC — drop stale entries so the maps don't grow unbounded.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of ipCounters) {
    if (now - v.windowStart > 60_000) ipCounters.delete(k);
  }
  for (const [k, v] of failMap) {
    if (now - v.lastFailAt > env.failWindowMs) failMap.delete(k);
  }
  for (const [k, v] of familyCounters) {
    if (now - v.windowStart > env.refreshFamilyWindowMs) familyCounters.delete(k);
  }
}, SWEEP_INTERVAL_MS).unref();

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function getClientIp(req: Request): string {
  return (req.ip || req.socket.remoteAddress || "unknown").toString();
}

// ── IP rate limiter (fixed window per minute, per endpoint) ──
export function ipRateLimit(opts: { windowMs: number; max: number; keySuffix?: string }) {
  const { windowMs, max, keySuffix = "" } = opts;
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const key = `${ip}:${keySuffix}`;
    const now = Date.now();
    let rec = ipCounters.get(key);
    if (!rec || now - rec.windowStart > windowMs) {
      rec = { count: 0, windowStart: now };
      ipCounters.set(key, rec);
    }
    rec.count++;
    if (rec.count > max) {
      res.status(429).json({ error: "Too many requests. Please slow down." });
      return;
    }
    next();
  };
}

// ── Per-email fail tracking (progressive delay + CAPTCHA gate, never hard-lock) ──

export function getFailRecord(email: string): FailRecord | undefined {
  return failMap.get(normalizeEmail(email));
}

export function recordFailedLogin(email: string): FailRecord {
  const key = normalizeEmail(email);
  const now = Date.now();
  let rec = failMap.get(key);
  if (!rec || now - rec.firstFailAt > env.failWindowMs) {
    rec = { count: 0, firstFailAt: now, lastFailAt: now, nextDelayMs: 0, captchaRequired: false };
    failMap.set(key, rec);
  }
  rec.count++;
  rec.lastFailAt = now;
  // Exponential backoff: base, 2*base, 4*base, ... capped at maxDelay
  rec.nextDelayMs = Math.min(env.baseDelayMs * Math.pow(2, rec.count - 1), env.maxDelayMs);
  if (rec.count >= env.maxFails) {
    rec.captchaRequired = true;
  }
  return rec;
}

export function clearFailRecord(email: string) {
  failMap.delete(normalizeEmail(email));
}

function normalizeEmail(email: string): string {
  return (email || "").toLowerCase().trim();
}

// ── Per-family refresh limiter (abuse guard on top of rotation + reuse detection) ──

export function checkFamilyLimit(family: string): boolean {
  const now = Date.now();
  let rec = familyCounters.get(family);
  if (!rec || now - rec.windowStart > env.refreshFamilyWindowMs) {
    rec = { count: 0, windowStart: now };
    familyCounters.set(family, rec);
  }
  return rec.count < env.refreshFamilyMax;
}

export function incrementFamilyCount(family: string) {
  const now = Date.now();
  let rec = familyCounters.get(family);
  if (!rec || now - rec.windowStart > env.refreshFamilyWindowMs) {
    rec = { count: 0, windowStart: now };
    familyCounters.set(family, rec);
  }
  rec.count++;
}

// ── Dummy bcrypt for constant-time "user not found" (anti email-enumeration) ──
const DUMMY_PASSWORD = crypto.randomBytes(32).toString("hex");
const DUMMY_HASH = bcrypt.hashSync(DUMMY_PASSWORD, 12);

export function dummyCompare(password: string): Promise<boolean> {
  return bcrypt.compare(password, DUMMY_HASH);
}

// ── Cloudflare Turnstile CAPTCHA verification ──
// Test keys (always pass / always fail) short-circuit to avoid network in dev.
export async function verifyCaptcha(
  token: string | undefined,
  remoteip?: string,
): Promise<boolean> {
  if (!token) return false;
  // Dev short-circuit (avoids a network round-trip during local testing)
  if (env.turnstileSecret === "1x0000000000000000000000000000000AA") return true;
  if (env.turnstileSecret === "2x0000000000000000000000000000000AA") return false;
  try {
    const body = new URLSearchParams();
    body.append("secret", env.turnstileSecret);
    body.append("response", token);
    if (remoteip) body.append("remoteip", remoteip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await r.json()) as { success: boolean };
    return data.success === true;
  } catch {
    // Network error — fail closed (treat as unverified)
    return false;
  }
}

// ── Password strength (basic) ──
export function validatePasswordStrength(password: string): string | null {
  if (typeof password !== "string" || password.length < 10) {
    return "Password must be at least 10 characters";
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number";
  }
  return null;
}
