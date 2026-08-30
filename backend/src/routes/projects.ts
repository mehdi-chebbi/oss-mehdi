import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPublicProjectsByDeptSlug,
  getPublicProjectBySlug,
  listAllProjectsByDept,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listAfricanCountries,
} from "../services/projects.js";

const router = Router();

// ── Public routes ──

// Shared African-country catalogue for project forms and public metadata.
router.get("/countries", async (_req, res) => {
  const countries = await listAfricanCountries();
  res.json(countries);
});

// Projects for a department (by dept slug)
// GET /api/projects/dept/:deptSlug
router.get("/dept/:deptSlug", async (req, res) => {
  const items = await getPublicProjectsByDeptSlug(req.params.deptSlug);
  res.json(items);
});

// Single project by slug (joins department for breadcrumb)
// GET /api/projects/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  const project = await getPublicProjectBySlug(req.params.slug);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

// ── Authenticated routes (admin) ──

// List all projects for a department
// GET /api/projects/all/:deptId
router.get("/all/:deptId", editorOrAdmin, async (req, res) => {
  const deptId = Number(req.params.deptId);
  if (!Number.isFinite(deptId)) {
    res.status(400).json({ error: "Invalid department id" });
    return;
  }
  const items = await listAllProjectsByDept(deptId);
  res.json(items);
});

// Get single project by id (for editing)
router.get("/:id", editorOrAdmin, async (req, res) => {
  const project = await getProject(Number(req.params.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

// Create project
router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const {
      department_id,
      title_fr,
      title_en,
      description_fr,
      description_en,
      results_fr,
      results_en,
      result_files,
      image,
      year_start,
      year_end,
      status,
      budget,
      sort_order,
      country_codes,
    } = req.body;

    if (!department_id || !title_fr || !title_en || !Array.isArray(country_codes) || country_codes.length === 0) {
      res.status(400).json({
        error: "department_id, title_fr, title_en and at least one beneficiary country are required",
      });
      return;
    }

    const project = await createProject({
      department_id,
      title_fr,
      title_en,
      description_fr,
      description_en,
      results_fr,
      results_en,
      result_files,
      image,
      year_start: year_start === undefined ? null : Number(year_start) || null,
      year_end: year_end === undefined ? null : Number(year_end) || null,
      status,
      budget,
      sort_order,
      country_codes,
    });
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update project
router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    // Coerce year fields to int|null so partial updates don't store strings
    const body = { ...req.body };
    if (body.year_start !== undefined) {
      body.year_start = body.year_start === null || body.year_start === "" ? null : Number(body.year_start) || null;
    }
    if (body.year_end !== undefined) {
      body.year_end = body.year_end === null || body.year_end === "" ? null : Number(body.year_end) || null;
    }
    if (body.department_id !== undefined) {
      body.department_id = Number(body.department_id) || undefined;
    }

    const project = await updateProject(Number(req.params.id), body);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete project
router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteProject(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ message: "Project deleted" });
});

export default router;
