import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getSocials,
  getSocial,
  createSocial,
  updateSocial,
  deleteSocial,
} from "../services/socials.js";

const router = Router();

// Public: get all socials (always visible)
router.get("/", async (_req, res) => {
  const socials = await getSocials();
  res.json(socials);
});

router.get("/:id", editorOrAdmin, async (req, res) => {
  const social = await getSocial(Number(req.params.id));
  if (!social) {
    res.status(404).json({ error: "Social not found" });
    return;
  }
  res.json(social);
});

router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const social = await createSocial(req.body);
    res.status(201).json(social);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const social = await updateSocial(Number(req.params.id), req.body);
    if (!social) {
      res.status(404).json({ error: "Social not found" });
      return;
    }
    res.json(social);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteSocial(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Social not found" });
    return;
  }
  res.json({ message: "Social deleted" });
});

export default router;
