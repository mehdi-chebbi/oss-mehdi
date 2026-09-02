import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import { uploadMiddleware, VALID_SECTIONS } from "../middleware/upload.js";

const router = Router();

/**
 * POST /api/upload/:section
 * Upload a single file to the given section's folder.
 * Returns { url, filename, originalName, size, mimeType }
 */
router.post("/:section", editorOrAdmin, (req, res) => {
  const section = req.params.section;

  if (!VALID_SECTIONS.includes(section as any)) {
    res.status(400).json({ error: `Invalid section. Allowed: ${VALID_SECTIONS.join(", ")}` });
    return;
  }

  const upload = uploadMiddleware(section);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        const limit = section === "videos" ? "250 MB" : "10 MB";
        res.status(413).json({ error: `File too large (max ${limit})` });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    // Build the public URL path
    const url = `/uploads/${section}/${file.filename}`;

    res.status(201).json({
      url,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });
  });
});

export default router;
