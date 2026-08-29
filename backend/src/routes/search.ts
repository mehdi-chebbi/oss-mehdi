import { Router } from "express";
import { globalSearch, type SearchLocale } from "../services/search.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const searchTerm = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const locale: SearchLocale = req.query.lang === "en" ? "en" : "fr";
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));

    if (searchTerm.length < 2) {
      res.status(400).json({ error: "Search query must contain at least 2 characters" });
      return;
    }

    res.json(await globalSearch(searchTerm, locale, limit));
  } catch (error) {
    console.error("Global search failed:", error);
    res.status(500).json({ error: "Search is temporarily unavailable" });
  }
});

export default router;
