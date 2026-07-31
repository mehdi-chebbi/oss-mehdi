import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

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

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
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

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refresh(token: string) {
  const payload = verifyRefreshToken(token);
  return {
    accessToken: signAccessToken({ userId: payload.userId, role: payload.role }),
  };
}

export async function me(userId: number) {
  const result = await query("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0] || null;
}
