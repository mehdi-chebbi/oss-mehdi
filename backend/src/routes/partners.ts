import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPagePartners,
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
} from "../services/partners.js";

const router = Router();

router.get("/", async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const partners = await getPagePartners(pageId);
  res.json(partners);
});

router.get("/all", editorOrAdmin, async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const partners = await listPartners(pageId);
  res.json(partners);
});

router.get("/:id", editorOrAdmin, async (req, res) => {
  const partner = await getPartner(Number(req.params.id));
  if (!partner) {
    res.status(404).json({ error: "Partner not found" });
    return;
  }
  res.json(partner);
});

router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const partner = await createPartner(req.body);
    res.status(201).json(partner);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const partner = await updatePartner(Number(req.params.id), req.body);
    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }
    res.json(partner);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deletePartner(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Partner not found" });
    return;
  }
  res.json({ message: "Partner deleted" });
});

export default router;
