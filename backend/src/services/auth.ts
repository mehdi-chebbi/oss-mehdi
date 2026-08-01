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
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/api/auth",
    domain: env.cookieDomain,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/api/auth",
    domain: env.cookieDomain,
  };
}

// ── Auth operations ──

export async function register(name: string, email: string, password: string) {
  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
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

export async function login(email: string, password: string) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  const user: UserRow | undefined = result.rows[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

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
          `[SECURITY] Refresh token reuse detected for family ${row.family}, user ${row.user_id}. Entire family revoked.`,
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
      await client.query("COMMIT");

      return {
        accessToken: signAccessToken({ userId: payload.userId, role: payload.role }),
        reusedGrace: true,
      };
    }

    // 6. Normal rotation: revoke old token, issue new one in same family
    await revokeRefreshToken(row.token_hash, client);

    const newPayload = { userId: payload.userId, role: payload.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await storeRefreshToken(payload.userId, newRefreshToken, row.family, client);
    await client.query("COMMIT");

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
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
export async function logout(token: string) {
  const row = await findRefreshToken(token);
  if (row && !row.revoked_at) {
    await revokeRefreshToken(row.token_hash);
  }
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
