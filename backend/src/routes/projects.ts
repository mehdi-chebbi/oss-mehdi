import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPublicProjectsByThematicSlug,
  getPaginatedPublicProjectsByThematicSlug,
  getPublicProjectBySlug,
  listAllProjectsByThematic,
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

// Projects for a thematic area (by thematic slug)
// GET /api/projects/thematic/:thematicSlug
router.get("/thematic/:thematicSlug", async (req, res) => {
  const items = await getPublicProjectsByThematicSlug(req.params.thematicSlug);
  res.json(items);
});

// Paginated projects for a thematic area, used by the expandable public portfolio.
// GET /api/projects/thematic/:thematicSlug/paginated?page=1&limit=9
router.get("/thematic/:thematicSlug/paginated", async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const limit = Math.min(24, Math.max(1, Number.parseInt(String(req.query.limit || "9"), 10) || 9));
  const { items, total } = await getPaginatedPublicProjectsByThematicSlug(
    req.params.thematicSlug,
    page,
    limit,
  );

  res.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// Single project by slug (joins thematic area for breadcrumb)
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

// List all projects for a thematic area
// GET /api/projects/all/:thematicId
router.get("/all/:thematicId", editorOrAdmin, async (req, res) => {
  const thematicId = Number(req.params.thematicId);
  if (!Number.isFinite(thematicId)) {
    res.status(400).json({ error: "Invalid thematic id" });
    return;
  }
  const items = await listAllProjectsByThematic(thematicId);
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
      thematic_id,
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

    if (!thematic_id || !title_fr || !title_en || !Array.isArray(country_codes) || country_codes.length === 0) {
      res.status(400).json({
        error: "thematic_id, title_fr, title_en and at least one beneficiary country are required",
      });
      return;
    }

    const project = await createProject({
      thematic_id,
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
    if (body.thematic_id !== undefined) {
      body.thematic_id = Number(body.thematic_id) || undefined;
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
