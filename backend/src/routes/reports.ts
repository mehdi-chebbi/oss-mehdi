import { Router } from "express";
import { adminOnly } from "../middleware/admin.js";
import { listReports, getReport, createReport, deleteReport } from "../services/reports.js";

const router = Router();

// Public: submit a new report (no auth required)
router.post("/", async (req, res) => {
  try {
    const { category, subject, description, name, email } = req.body;
    if (!category || !subject || !description) {
      res.status(400).json({ error: "category, subject, and description are required" });
      return;
    }
    const report = await createReport({ category, subject, description, name, email });
    res.status(201).json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: list all reports
router.get("/", adminOnly, async (_req, res) => {
  const reports = await listReports();
  res.json(reports);
});

// Admin: get single report
router.get("/:id", adminOnly, async (req, res) => {
  const report = await getReport(Number(req.params.id));
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

// Admin: delete report
router.delete("/:id", adminOnly, async (req, res) => {
  const deleted = await deleteReport(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json({ message: "Report deleted" });
});

export default router;
