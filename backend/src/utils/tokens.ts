import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";
import type { AuthPayload } from "../middleware/auth.js";
import { query, pool } from "../config/db.js";

// ── JWT signing ──

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessTokenTTL as any });
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTTL as any });
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as AuthPayload;
}

// ── Token hashing (SHA-256 — fast, appropriate for high-entropy tokens) ──

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ── Refresh token DB operations ──

interface RefreshTokenRow {
  id: number;
  user_id: number;
  token_hash: string;
  family: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

/** Store a new refresh token in the DB */
export async function storeRefreshToken(
  userId: number,
  token: string,
  family: string,
  client?: any, // optional pg Client for transactions
): Promise<void> {
  const tokenHash = hashToken(token);
  const decoded = jwt.decode(token) as { exp: number } | null;
  const expiresAt = decoded ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const q = client || query;
  await q(
    `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, tokenHash, family, expiresAt],
  );
}

/**
 * Find a refresh token by its value.
 *
 * When called inside a transaction (client provided), we lock the row with
 * FOR UPDATE. This is CRITICAL: it serializes concurrent refresh attempts
 * that use the SAME token, so two parallel requests can't both observe
 * `revoked_at IS NULL`, both rotate, and both commit — which would mint two
 * live tokens from one and silently bypass reuse detection.
 */
export async function findRefreshToken(
  token: string,
  client?: any,
): Promise<RefreshTokenRow | null> {
  const tokenHash = hashToken(token);
  const q = client || query;
  const lock = client ? " FOR UPDATE" : "";
  const result = await q(
    `SELECT id, user_id, token_hash, family, expires_at, revoked_at, created_at
     FROM refresh_tokens
     WHERE token_hash = $1${lock}`,
    [tokenHash],
  );
  return result.rows[0] || null;
}

/** Revoke a single refresh token (rotation). Only flips an active token. */
export async function revokeRefreshToken(tokenHash: string, client?: any): Promise<void> {
  const q = client || query;
  await q(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash],
  );
}

/** Revoke all tokens in a family (reuse detection — kill entire session) */
export async function revokeTokenFamily(family: string, client?: any): Promise<void> {
  const q = client || query;
  await q(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE family = $1`,
    [family],
  );
}

/** Revoke all refresh tokens for a user ("log out everywhere") */
export async function revokeAllUserTokens(userId: number, client?: any): Promise<void> {
  const q = client || query;
  await q(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1`,
    [userId],
  );
}

/**
 * Harden a revoked token so it can't be used again during the grace period.
 *
 * Sets `revoked_at` to a timestamp far enough in the past that the next request
 * with this token will fail the grace-period check and kill the family.
 *
 * The offset is DERIVED from `env.refreshTokenGracePeriodMs` (not a magic SQL
 * string) so the invariant holds if the grace period is ever changed. We add a
 * buffer equal to the grace period so the hardened timestamp is guaranteed to
 * be outside the window regardless of clock skew between JS and Postgres.
 */
export async function hardenRevokedToken(tokenHash: string, client?: any): Promise<void> {
  const q = client || query;
  const offsetMs = env.refreshTokenGracePeriodMs * 2;
  const hardenedAt = new Date(Date.now() - offsetMs);
  await q(
    `UPDATE refresh_tokens SET revoked_at = $2 WHERE token_hash = $1`,
    [tokenHash, hardenedAt],
  );
}

/** Clean up expired tokens (run periodically) */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await query(
    `DELETE FROM refresh_tokens WHERE expires_at < now()`,
  );
  return result.rowCount ?? 0;
}

/** Get a pool client for transactions */
export function getPoolClient() {
  return pool.connect();
}
