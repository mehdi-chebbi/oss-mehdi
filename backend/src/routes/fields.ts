import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPageFields,
  listFields,
  getField,
  createField,
  updateField,
  deleteField,
} from "../services/fields.js";

const router = Router();

// Public: get fields for a page
router.get("/", async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const fields = await getPageFields(pageId);
  res.json(fields);
});

// Authenticated: list all fields
router.get("/all", editorOrAdmin, async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const fields = await listFields(pageId);
  res.json(fields);
});

// Authenticated: get single field
router.get("/:id", editorOrAdmin, async (req, res) => {
  const field = await getField(Number(req.params.id));
  if (!field) {
    res.status(404).json({ error: "Field not found" });
    return;
  }
  res.json(field);
});

// Authenticated: create field
router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const field = await createField(req.body);
    res.status(201).json(field);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Authenticated: update field
router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const field = await updateField(Number(req.params.id), req.body);
    if (!field) {
      res.status(404).json({ error: "Field not found" });
      return;
    }
    res.json(field);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Authenticated: delete field
router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteField(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Field not found" });
    return;
  }
  res.json({ message: "Field deleted" });
});

export default router;
