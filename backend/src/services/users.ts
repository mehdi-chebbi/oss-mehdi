import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

const SALT_ROUNDS = 12;

export async function listUsers() {
  const result = await query(
    "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id ASC",
  );
  return result.rows;
}

export async function getUser(id: number) {
  const result = await query(
    "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
}

export async function createUser(name: string, email: string, password: string, role: string) {
  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at",
    [name, email, hash, role],
  );
  return result.rows[0];
}

export async function updateUser(
  id: number,
  data: { name?: string; email?: string; role?: string; password?: string },
) {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    sets.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    sets.push(`email = $${idx++}`);
    values.push(data.email);
  }
  if (data.role !== undefined) {
    sets.push(`role = $${idx++}`);
    values.push(data.role);
  }
  if (data.password !== undefined) {
    const hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    sets.push(`password = $${idx++}`);
    values.push(hash);
  }

  if (sets.length === 0) return null;

  sets.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id, name, email, role, created_at, updated_at`,
    values,
  );
  return result.rows[0] || null;
}

export async function deleteUser(id: number) {
  const result = await query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
