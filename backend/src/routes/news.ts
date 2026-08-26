import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getLatestNews,
  listPublicNews,
  getPublicNewsBySlug,
  getPublicNewsYears,
  listAllNews,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  isNewsCategory,
  queueNewsIndexing,
} from "../services/news.js";

const router = Router();

// ── Public routes ──

// Latest news (for the home page)
// GET /api/news/latest?limit=4
router.get("/latest", async (req, res) => {
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 4));
  const items = await getLatestNews(limit);
  res.json(items);
});

// Paginated list with optional year + keyword filter (for /news page)
// GET /api/news?page=1&limit=12&year=2025&category=event&q=keyword
router.get("/", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const categoryValue = req.query.category ? String(req.query.category) : undefined;
  const q = req.query.q ? String(req.query.q) : undefined;

  if (categoryValue && !isNewsCategory(categoryValue)) {
    res.status(400).json({ error: "Invalid news category" });
    return;
  }

  const category = categoryValue && isNewsCategory(categoryValue) ? categoryValue : undefined;
  const { items, total } = await listPublicNews({ page, limit, year, category, q });
  res.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// Distinct article years (for the year filter dropdown)
router.get("/years", async (_req, res) => {
  const years = await getPublicNewsYears();
  res.json(years);
});

// Single article by slug
// GET /api/news/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  const article = await getPublicNewsBySlug(req.params.slug);
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

// ── Authenticated routes (admin) ──

// List all news
router.get("/all", editorOrAdmin, async (_req, res) => {
  const items = await listAllNews();
  res.json(items);
});

// Get single news by id (for editing)
router.get("/:id", editorOrAdmin, async (req, res) => {
  const article = await getNews(Number(req.params.id));
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

// Create news
router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const { title_fr, title_en, body_fr, body_en, category, images, thumbnail_index, date } = req.body;
    if (!title_fr || !title_en || !isNewsCategory(category)) {
      res.status(400).json({ error: "title_fr, title_en and a valid category are required" });
      return;
    }
    const article = await createNews({
      title_fr,
      title_en,
      body_fr,
      body_en,
      category,
      images,
      thumbnail_index,
      date,
    });
    res.status(201).json(await queueNewsIndexing(article.id));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update news
router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    if (req.body.category !== undefined && !isNewsCategory(req.body.category)) {
      res.status(400).json({ error: "Invalid news category" });
      return;
    }
    const articleId = Number(req.params.id);
    const existing = await getNews(articleId);
    if (!existing) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    const indexableContentChanged = ["title_fr", "title_en", "body_fr", "body_en", "category", "date"]
      .some((field) => req.body[field] !== undefined && req.body[field] !== existing[field]);
    const article = await updateNews(articleId, req.body);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(indexableContentChanged ? await queueNewsIndexing(articleId) : article);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:id/reindex", editorOrAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid article id" });
      return;
    }
    const article = await queueNewsIndexing(id);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Could not queue article indexing" });
  }
});

// Delete news
router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteNews(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json({ message: "Article deleted" });
});

export default router;
