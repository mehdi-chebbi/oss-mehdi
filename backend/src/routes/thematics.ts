import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPublicThematics,
  getPublicThematicBySlug,
  listAllThematics,
  getThematic,
  createThematic,
  updateThematic,
  deleteThematic,
} from "../services/thematics.js";

const router = Router();

// ── Public routes ──

// All thematic areas
// GET /api/thematics
router.get("/", async (_req, res) => {
  const items = await getPublicThematics();
  res.json(items);
});

// Single thematic area by slug
// GET /api/thematics/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  const thematic = await getPublicThematicBySlug(req.params.slug);
  if (!thematic) {
    res.status(404).json({ error: "Thematic area not found" });
    return;
  }
  res.json(thematic);
});

// ── Authenticated routes (admin) ──

// List all thematic areas
router.get("/all", editorOrAdmin, async (_req, res) => {
  const items = await listAllThematics();
  res.json(items);
});

// Get single thematic area by id (for editing)
router.get("/:id", editorOrAdmin, async (req, res) => {
  const thematic = await getThematic(Number(req.params.id));
  if (!thematic) {
    res.status(404).json({ error: "Thematic area not found" });
    return;
  }
  res.json(thematic);
});

// Create thematic area
router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const { title_fr, title_en, description_fr, description_en, sort_order } = req.body;
    if (!title_fr || !title_en) {
      res.status(400).json({ error: "title_fr and title_en are required" });
      return;
    }
    const thematic = await createThematic({
      title_fr,
      title_en,
      description_fr,
      description_en,
      sort_order,
    });
    res.status(201).json(thematic);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update thematic area
router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const thematic = await updateThematic(Number(req.params.id), req.body);
    if (!thematic) {
      res.status(404).json({ error: "Thematic area not found" });
      return;
    }
    res.json(thematic);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete thematic area
router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteThematic(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Thematic area not found" });
    return;
  }
  res.json({ message: "Thematic area deleted" });
});

export default router;
