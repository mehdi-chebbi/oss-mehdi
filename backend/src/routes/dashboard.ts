import { Router } from "express";
import { query } from "../config/db.js";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";

const router = Router();

router.get("/stats", editorOrAdmin, async (_req, res) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM news) AS news,
        (SELECT COUNT(*)::int FROM projects) AS projects,
        (SELECT COUNT(*)::int FROM resources) AS resources,
        (SELECT COUNT(*)::int FROM newsletter_subscribers WHERE is_active = true) AS newsletter_subscribers,
        (SELECT COUNT(*)::int FROM reports) AS reports_total,
        (
          SELECT COUNT(*)::int
          FROM reports
          WHERE created_at >= NOW() - INTERVAL '30 days'
        ) AS reports_last_30_days
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("[DASHBOARD] Failed to load statistics:", error);
    res.status(500).json({ error: "Unable to load dashboard statistics" });
  }
});

export default router;
