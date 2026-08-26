import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPageTools,
  listTools,
  getTool,
  createTool,
  updateTool,
  deleteTool,
} from "../services/tools.js";

const router = Router();

// Public: get tools for a page
router.get("/", async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const tools = await getPageTools(pageId);
  res.json(tools);
});

// Authenticated: list all tools
router.get("/all", editorOrAdmin, async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const tools = await listTools(pageId);
  res.json(tools);
});

// Authenticated: get single tool
router.get("/:id", editorOrAdmin, async (req, res) => {
  const tool = await getTool(Number(req.params.id));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  res.json(tool);
});

// Authenticated: create tool
router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const tool = await createTool(req.body);
    res.status(201).json(tool);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Authenticated: update tool
router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const tool = await updateTool(Number(req.params.id), req.body);
    if (!tool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    res.json(tool);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Authenticated: delete tool
router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteTool(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  res.json({ message: "Tool deleted" });
});

export default router;
