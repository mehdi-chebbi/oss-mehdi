import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPublishedHero,
  listHero,
  getHero,
  createHero,
  updateHero,
  deleteHero,
} from "../services/hero.js";

const router = Router();

// Public: get published hero for a page
router.get("/", async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const hero = await getPublishedHero(pageId);
  if (!hero) {
    res.status(404).json({ error: "No published hero found" });
    return;
  }
  res.json(hero);
});

// Authenticated: list all hero entries
router.get("/all", editorOrAdmin, async (req, res) => {
  const pageId = Number(req.query.page_id) || 1;
  const heroes = await listHero(pageId);
  res.json(heroes);
});

// Authenticated: get single hero
router.get("/:id", editorOrAdmin, async (req, res) => {
  const hero = await getHero(Number(req.params.id));
  if (!hero) {
    res.status(404).json({ error: "Hero not found" });
    return;
  }
  res.json(hero);
});

// Authenticated: create hero
router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const hero = await createHero(req.body);
    res.status(201).json(hero);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Authenticated: update hero
router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const hero = await updateHero(Number(req.params.id), req.body);
    if (!hero) {
      res.status(404).json({ error: "Hero not found" });
      return;
    }
    res.json(hero);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Authenticated: delete hero
router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteHero(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Hero not found" });
    return;
  }
  res.json({ message: "Hero deleted" });
});

export default router;
