import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPublishedDepartments,
  getPublishedDepartmentBySlug,
  listAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departments.js";

const router = Router();

// ── Public routes ──

// All published departments (for the /projects landing page later)
// GET /api/departments
router.get("/", async (_req, res) => {
  const items = await getPublishedDepartments();
  res.json(items);
});

// Single department by slug
// GET /api/departments/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  const dept = await getPublishedDepartmentBySlug(req.params.slug);
  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(dept);
});

// ── Authenticated routes (admin) ──

// List all departments (including drafts)
router.get("/all", editorOrAdmin, async (_req, res) => {
  const items = await listAllDepartments();
  res.json(items);
});

// Get single department by id (for editing)
router.get("/:id", editorOrAdmin, async (req, res) => {
  const dept = await getDepartment(Number(req.params.id));
  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(dept);
});

// Create department
router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const { title_fr, title_en, description_fr, description_en, image, sort_order, is_published } = req.body;
    if (!title_fr || !title_en) {
      res.status(400).json({ error: "title_fr and title_en are required" });
      return;
    }
    const dept = await createDepartment({
      title_fr,
      title_en,
      description_fr,
      description_en,
      image,
      sort_order,
      is_published,
    });
    res.status(201).json(dept);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update department
router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const dept = await updateDepartment(Number(req.params.id), req.body);
    if (!dept) {
      res.status(404).json({ error: "Department not found" });
      return;
    }
    res.json(dept);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete department
router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteDepartment(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json({ message: "Department deleted" });
});

export default router;
