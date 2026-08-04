import { query } from "../config/db.js";

export interface ReportRow {
  id: number;
  category: string;
  subject: string;
  description: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

export async function listReports() {
  const result = await query(
    "SELECT * FROM reports ORDER BY created_at DESC"
  );
  return result.rows as ReportRow[];
}

export async function getReport(id: number) {
  const result = await query("SELECT * FROM reports WHERE id = $1", [id]);
  return (result.rows[0] as ReportRow) || null;
}

export async function createReport(data: {
  category: string;
  subject: string;
  description: string;
  name?: string;
  email?: string;
}) {
  const result = await query(
    `INSERT INTO reports (category, subject, description, name, email)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.category, data.subject, data.description, data.name || null, data.email || null],
  );
  return result.rows[0] as ReportRow;
}

export async function deleteReport(id: number) {
  const result = await query("DELETE FROM reports WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}
