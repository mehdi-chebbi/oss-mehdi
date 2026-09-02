import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import { deleteUploadedFile } from "../middleware/upload.js";
import {
  getHomepagePublication,
  saveHomepagePublication,
} from "../services/homepagePublication.js";

const router = Router();

function isSafeUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

router.get("/", async (_req, res) => {
  const publication = await getHomepagePublication();
  res.json(publication);
});

router.put("/", editorOrAdmin, async (req, res) => {
  try {
    const titleFr = String(req.body.title_fr || "").trim();
    const titleEn = String(req.body.title_en || "").trim();
    const descriptionFr = String(req.body.description_fr || "").trim();
    const descriptionEn = String(req.body.description_en || "").trim();
    const imageUrl = String(req.body.image_url || "").trim();
    const urlFr = String(req.body.url_fr || "").trim() || null;
    const urlEn = String(req.body.url_en || "").trim() || null;

    if (!titleFr || !titleEn || !descriptionFr || !descriptionEn || !imageUrl) {
      res.status(400).json({ error: "Titles, descriptions and a cover image are required" });
      return;
    }
    if (!urlFr && !urlEn) {
      res.status(400).json({ error: "At least one publication URL is required" });
      return;
    }
    if (!isSafeUrl(imageUrl) || (urlFr && !isSafeUrl(urlFr)) || (urlEn && !isSafeUrl(urlEn))) {
      res.status(400).json({ error: "Invalid publication URL" });
      return;
    }

    const previous = await getHomepagePublication();
    const saved = await saveHomepagePublication({
      title_fr: titleFr,
      title_en: titleEn,
      description_fr: descriptionFr,
      description_en: descriptionEn,
      image_url: imageUrl,
      url_fr: urlFr,
      url_en: urlEn,
    });

    if (previous?.image_url && previous.image_url !== saved.image_url) {
      deleteUploadedFile(previous.image_url);
    }

    res.json(saved);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
