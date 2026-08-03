import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeTokenFamily,
  revokeAllUserTokens,
  hardenRevokedToken,
  getPoolClient,
} from "../utils/tokens.js";
import {
  getFailRecord,
  recordFailedLogin,
  clearFailRecord,
  dummyCompare,
  verifyCaptcha,
  validatePasswordStrength,
  sleep,
  checkFamilyLimit,
  incrementFamilyCount,
} from "../utils/security.js";
import { env } from "../config/env.js";
import crypto from "crypto";

const SALT_ROUNDS = 12;

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// ── Cookie config ──

export const REFRESH_COOKIE_NAME = "refreshToken";

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax" as const,
    path: "/api/auth",
    domain: env.cookieDomain,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax" as const,
    path: "/api/auth",
    domain: env.cookieDomain,
  };
}

// ── Auth operations ──

/**
 * Register a new account.
 * CAPTCHA is ALWAYS required on registration (account-spam / email-harvesting surface).
 * Email existence is NOT revealed (generic error) to prevent enumeration.
 */
export async function register(
  name: string,
  email: string,
  password: string,
  captchaToken?: string,
  remoteip?: string,
) {
  // 1. CAPTCHA always required
  const captchaOk = await verifyCaptcha(captchaToken, remoteip);
  if (!captchaOk) {
    throw new Error("CAPTCHA_REQUIRED");
  }

  // 2. Password strength
  const pwErr = validatePasswordStrength(password);
  if (pwErr) {
    throw new Error(pwErr);
  }

  // 3. Email uniqueness — generic error to avoid enumeration
  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("UNABLE_TO_REGISTER");
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [name, email, hash, "editor"],
  );

  const user = result.rows[0];
  const payload = { userId: user.id, role: user.role };
  const family = crypto.randomUUID();

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(user.id, refreshToken, family);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

/**
 * Login with progressive-delay + CAPTCHA-gate fail tracking and constant-time
 * "user not found" handling.
 *
 * Flow:
 *   1. Lookup fail record for this email.
 *   2. If CAPTCHA is required (>= maxFails), verify the token — reject early.
 *   3. If a delay is pending, sleep BEFORE bcrypt (collapses attacker throughput).
 *   4. Real bcrypt (user exists) OR dummy bcrypt (no user) — same timing.
 *   5. On failure: record fail (escalates delay + CAPTCHA), throw generic error.
 *   6. On success: clear fail record, issue tokens.
 *
 * Email lookup stays case-sensitive to match existing DB rows; the fail tracker
 * key is normalized (lowercased) so Foo@x.com and foo@x.com share a counter.
 */
export async function login(
  email: string,
  password: string,
  captchaToken?: string,
  remoteip?: string,
) {
  // 1. Existing fail record for this email (normalized key)
  const failRec = getFailRecord(email);

  // 2. CAPTCHA gate (only enforced once the account has been flagged)
  if (failRec?.captchaRequired) {
    const ok = await verifyCaptcha(captchaToken, remoteip);
    if (!ok) {
      throw new Error("CAPTCHA_REQUIRED");
    }
  }

  // 3. Progressive delay before the expensive compare
  if (failRec && failRec.nextDelayMs > 0) {
    await sleep(failRec.nextDelayMs);
  }

  // 4. Lookup + compare (constant-time for nonexistent users)
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  const user: UserRow | undefined = result.rows[0];

  let valid = false;
  if (user) {
    valid = await bcrypt.compare(password, user.password);
  } else {
    // Burn comparable time so a missing account isn't distinguishable by timing
    await dummyCompare(password);
  }

  // 5. Failure path
  if (!user || !valid) {
    recordFailedLogin(email);
    throw new Error("Invalid credentials");
  }

  // 6. Success — reset the fail tracker and issue tokens
  clearFailRecord(email);

  const payload = { userId: user.id, role: user.role };
  const family = crypto.randomUUID();

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(user.id, refreshToken, family);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh: rotate the token (revoke old, issue new in same family).
 * Detects reuse of revoked tokens and kills the entire family.
 *
 * All DB operations run inside a transaction for atomicity.
 *
 * Grace period: if a token was revoked very recently (within 5s), we allow
 * ONE access token to be issued (for concurrent tab race conditions), then
 * harden the revoked_at so the token can't be reused. This means:
 * - Legitimate tab 2 gets one access token, then the next request uses
 *   the updated cookie (set by tab 1's response)
 * - Attacker gets at most 1 access token (15 min blast radius), then the
 *   next request with the same token kills the family
 */
export async function refresh(token: string) {
  // 1. Verify JWT signature & expiry
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new Error("TOKEN_INVALID");
  }

  // 2. Use a transaction for all DB operations
  const client = await getPoolClient();
  try {
    await client.query("BEGIN");

    // 3. Look up the token in DB
    const row = await findRefreshToken(token, client);
    if (!row) {
      await client.query("ROLLBACK");
      throw new Error("TOKEN_INVALID");
    }

    // 4. Check if token is expired in DB
    if (new Date(row.expires_at) < new Date()) {
      await client.query("ROLLBACK");
      throw new Error("TOKEN_EXPIRED");
    }

    // 4b. Per-family abuse limit (belt-and-suspenders on top of rotation/reuse detection)
    if (!checkFamilyLimit(row.family)) {
      await client.query("ROLLBACK");
      throw new Error("FAMILY_RATE_LIMIT");
    }

    // 5. Reuse detection: if token was already revoked
    if (row.revoked_at) {
      const revokedMs = new Date(row.revoked_at).getTime();
      const nowMs = Date.now();

      if (nowMs - revokedMs > env.refreshTokenGracePeriodMs) {
        // Outside grace period — this is real reuse (potential theft)
        // Revoke entire family atomically
        await revokeTokenFamily(row.family, client);
        await client.query("COMMIT");
        console.warn(
          `[AUTH] SECURITY: refresh token reuse detected — family ${row.family} revoked (user ${row.user_id})`,
        );
        throw new Error("TOKEN_REUSED");
      }

      // Inside grace period — allow ONCE, then harden
      // This prevents the attacker from getting multiple access tokens
      // by repeatedly hitting the same old token within the grace window
      // Note: Tab 2 gets this access token, then its next request uses the
      // updated cookie (Token B) — this works because the browser's cookie jar
      // is shared across tabs at the browser level (no explicit frontend sync needed).
      // Tab 1's Set-Cookie response already updated the cookie for the entire origin.
      await hardenRevokedToken(row.token_hash, client);
      incrementFamilyCount(row.family);
      await client.query("COMMIT");

      return {
        accessToken: signAccessToken({ userId: payload.userId, role: payload.role }),
        userId: payload.userId,
        family: row.family,
        reusedGrace: true,
      };
    }

    // 6. Normal rotation: revoke old token, issue new one in same family
    await revokeRefreshToken(row.token_hash, client);

    const newPayload = { userId: payload.userId, role: payload.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await storeRefreshToken(payload.userId, newRefreshToken, row.family, client);
    incrementFamilyCount(row.family);
    await client.query("COMMIT");

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userId: payload.userId,
      family: row.family,
      reusedGrace: false,
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Logout: revoke the current refresh token and clear the cookie */
export async function logout(token: string): Promise<{ userId?: number }> {
  const row = await findRefreshToken(token);
  if (row && !row.revoked_at) {
    await revokeRefreshToken(row.token_hash);
    return { userId: row.user_id };
  }
  return {};
}

/** Logout everywhere: revoke all tokens for the user */
export async function logoutEverywhere(userId: number) {
  await revokeAllUserTokens(userId);
}

export async function me(userId: number) {
  const result = await query("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0] || null;
}
