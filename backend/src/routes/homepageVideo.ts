import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import { deleteUploadedFile } from "../middleware/upload.js";
import {
  getHomepageVideo,
  saveHomepageVideo,
} from "../services/homepageVideo.js";

const router = Router();

router.get("/", async (_req, res) => {
  const video = await getHomepageVideo();
  res.json(video);
});

router.put("/", editorOrAdmin, async (req, res) => {
  try {
    const titleFr = String(req.body.title_fr || "").trim();
    const titleEn = String(req.body.title_en || "").trim();
    const videoUrl = String(req.body.video_url || "").trim();
    const posterUrl = String(req.body.poster_url || "").trim();

    if (!titleFr || !titleEn || !videoUrl) {
      res.status(400).json({ error: "Both titles and a video file are required" });
      return;
    }
    if (!/^\/uploads\/videos\/[^/]+\.(mp4|webm)$/i.test(videoUrl)) {
      res.status(400).json({ error: "Invalid homepage video path" });
      return;
    }
    if (
      posterUrl &&
      !/^\/uploads\/videos\/[^/]+\.(jpe?g|png|webp)$/i.test(posterUrl)
    ) {
      res.status(400).json({ error: "Invalid homepage video poster path" });
      return;
    }

    const previous = await getHomepageVideo();
    const saved = await saveHomepageVideo({
      title_fr: titleFr,
      title_en: titleEn,
      video_url: videoUrl,
      poster_url: posterUrl,
    });

    if (previous?.video_url && previous.video_url !== saved.video_url) {
      deleteUploadedFile(previous.video_url);
    }
    if (previous?.poster_url && previous.poster_url !== saved.poster_url) {
      deleteUploadedFile(previous.poster_url);
    }

    res.json(saved);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
