import { Router, type Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  cleanupIncomingFiles,
  deleteAllResourceAssets,
  deleteResourceFile,
  generatePdfCover,
  getUploadedFile,
  publicUrlForUploadedFile,
  resourceUploadMiddleware,
  type ResourceUploadFiles,
} from "../services/resourceFiles.js";
import {
  createResource,
  deleteResourceRecord,
  getPublishedResourceYears,
  getResource,
  isResourceDocumentType,
  isResourceField,
  listAllResources,
  listPublishedResources,
  updateResource,
  type ResourceField,
  type ResourceInput,
  type ResourceLanguage,
} from "../services/resources.js";

const router = Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasValidResourceId(id: string) {
  return UUID_PATTERN.test(id);
}

function parseBoolean(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === "1";
}

function parseFields(value: unknown): ResourceField[] {
  let values: unknown = value;
  if (typeof value === "string") {
    try {
      values = JSON.parse(value);
    } catch {
      values = value.split(",").map((item) => item.trim());
    }
  }

  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((item): item is ResourceField => typeof item === "string" && isResourceField(item)))];
}

function validateMetadata(body: Record<string, unknown>) {
  const titleFr = typeof body.title_fr === "string" ? body.title_fr.trim() : "";
  const titleEn = typeof body.title_en === "string" ? body.title_en.trim() : "";
  const summaryFr = typeof body.summary_fr === "string" ? body.summary_fr.trim() : "";
  const summaryEn = typeof body.summary_en === "string" ? body.summary_en.trim() : "";
  const documentType = typeof body.document_type === "string" ? body.document_type : "";
  const publicationDate = typeof body.publication_date === "string" ? body.publication_date : "";
  const fields = parseFields(body.fields);

  if (!titleFr || !titleEn) throw new Error("French and English titles are required");
  if (!isResourceDocumentType(documentType)) throw new Error("Invalid document type");
  if (fields.length === 0) throw new Error("At least one field is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publicationDate) || Number.isNaN(Date.parse(`${publicationDate}T00:00:00Z`))) {
    throw new Error("A valid publication date is required");
  }

  return {
    title_fr: titleFr,
    title_en: titleEn,
    summary_fr: summaryFr,
    summary_en: summaryEn,
    document_type: documentType,
    fields,
    publication_date: publicationDate,
    is_published: parseBoolean(body.is_published),
  };
}

function uploadedFiles(req: Request) {
  return req.files as ResourceUploadFiles | undefined;
}

function uploadedFileData(file: Express.Multer.File | null) {
  return file
    ? {
        path: publicUrlForUploadedFile(file),
        originalName: file.originalname,
        size: file.size,
      }
    : null;
}

// Public filters and paginated resource library.
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));
    const documentTypeValue = req.query.type ? String(req.query.type) : undefined;
    const fieldValue = req.query.field ? String(req.query.field) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const languageValue = req.query.language ? String(req.query.language) : undefined;
    const q = req.query.q ? String(req.query.q).slice(0, 200) : undefined;

    if (documentTypeValue && !isResourceDocumentType(documentTypeValue)) {
      res.status(400).json({ error: "Invalid document type" });
      return;
    }
    if (fieldValue && !isResourceField(fieldValue)) {
      res.status(400).json({ error: "Invalid resource field" });
      return;
    }
    if (languageValue && languageValue !== "fr" && languageValue !== "en") {
      res.status(400).json({ error: "Invalid language" });
      return;
    }
    if (year !== undefined && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
      res.status(400).json({ error: "Invalid publication year" });
      return;
    }

    const result = await listPublishedResources({
      page,
      limit,
      documentType: documentTypeValue && isResourceDocumentType(documentTypeValue) ? documentTypeValue : undefined,
      field: fieldValue && isResourceField(fieldValue) ? fieldValue : undefined,
      year,
      language: languageValue as ResourceLanguage | undefined,
      q,
    });

    res.json({
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not load resources" });
  }
});

router.get("/years", async (_req, res) => {
  try {
    res.json(await getPublishedResourceYears());
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not load publication years" });
  }
});

router.get("/all", editorOrAdmin, async (_req, res) => {
  try {
    res.json(await listAllResources());
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not load resources" });
  }
});

router.get("/:id", editorOrAdmin, async (req, res) => {
  if (!hasValidResourceId(req.params.id)) {
    res.status(400).json({ error: "Invalid resource id" });
    return;
  }
  try {
    const resource = await getResource(req.params.id);
    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(resource);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not load resource" });
  }
});

router.post("/", editorOrAdmin, (req, res) => {
  const resourceId = uuidv4();
  const upload = resourceUploadMiddleware(resourceId);

  upload(req, res, async (uploadError) => {
    const files = uploadedFiles(req);
    let generatedCoverPath = "";

    try {
      if (uploadError) {
        throw new Error(uploadError.code === "LIMIT_FILE_SIZE" ? "File too large (maximum 50 MB)" : uploadError.message);
      }

      const metadata = validateMetadata(req.body);
      const fileFr = uploadedFileData(getUploadedFile(files, "file_fr"));
      const fileEn = uploadedFileData(getUploadedFile(files, "file_en"));
      const customCover = uploadedFileData(getUploadedFile(files, "cover"));

      if (!fileFr && !fileEn) throw new Error("At least one French or English PDF is required");

      const coverImagePath = customCover?.path || await generatePdfCover(resourceId, (fileFr || fileEn)!.path);
      if (!customCover) generatedCoverPath = coverImagePath;

      const input: ResourceInput = {
        id: resourceId,
        ...metadata,
        cover_image_path: coverImagePath,
        cover_is_custom: Boolean(customCover),
        file_fr_path: fileFr?.path || null,
        file_fr_original_name: fileFr?.originalName || null,
        file_fr_size: fileFr?.size || null,
        file_en_path: fileEn?.path || null,
        file_en_original_name: fileEn?.originalName || null,
        file_en_size: fileEn?.size || null,
      };

      const resource = await createResource(input);
      res.status(201).json(resource);
    } catch (error: any) {
      await cleanupIncomingFiles(files);
      if (generatedCoverPath) await deleteResourceFile(generatedCoverPath);
      res.status(400).json({ error: error.message || "Could not create resource" });
    }
  });
});

router.patch("/:id", editorOrAdmin, async (req, res) => {
  if (!hasValidResourceId(req.params.id)) {
    res.status(400).json({ error: "Invalid resource id" });
    return;
  }
  let existing: Awaited<ReturnType<typeof getResource>>;
  try {
    existing = await getResource(req.params.id);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not load resource" });
    return;
  }
  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const upload = resourceUploadMiddleware(existing.id);
  upload(req, res, async (uploadError) => {
    const files = uploadedFiles(req);
    let generatedCoverPath = "";

    try {
      if (uploadError) {
        throw new Error(uploadError.code === "LIMIT_FILE_SIZE" ? "File too large (maximum 50 MB)" : uploadError.message);
      }

      const metadata = validateMetadata(req.body);
      const newFr = uploadedFileData(getUploadedFile(files, "file_fr"));
      const newEn = uploadedFileData(getUploadedFile(files, "file_en"));
      const newCustomCover = uploadedFileData(getUploadedFile(files, "cover"));
      const removeFr = parseBoolean(req.body.remove_file_fr);
      const removeEn = parseBoolean(req.body.remove_file_en);
      const removeCustomCover = parseBoolean(req.body.remove_custom_cover);

      const fileFr = newFr || (removeFr ? null : {
        path: existing.file_fr_path!,
        originalName: existing.file_fr_original_name!,
        size: existing.file_fr_size,
      });
      const fileEn = newEn || (removeEn ? null : {
        path: existing.file_en_path!,
        originalName: existing.file_en_original_name!,
        size: existing.file_en_size,
      });

      const usableFr = fileFr?.path ? fileFr : null;
      const usableEn = fileEn?.path ? fileEn : null;
      if (!usableFr && !usableEn) throw new Error("At least one French or English PDF is required");

      const pdfChanged = Boolean(newFr || newEn || removeFr || removeEn);
      let coverImagePath = existing.cover_image_path;
      let coverIsCustom = existing.cover_is_custom;

      if (newCustomCover) {
        coverImagePath = newCustomCover.path;
        coverIsCustom = true;
      } else if (removeCustomCover || !coverImagePath || (!coverIsCustom && pdfChanged)) {
        coverImagePath = await generatePdfCover(existing.id, (usableFr || usableEn)!.path);
        generatedCoverPath = coverImagePath;
        coverIsCustom = false;
      }

      const input: Omit<ResourceInput, "id"> = {
        ...metadata,
        cover_image_path: coverImagePath,
        cover_is_custom: coverIsCustom,
        file_fr_path: usableFr?.path || null,
        file_fr_original_name: usableFr?.originalName || null,
        file_fr_size: usableFr?.size || null,
        file_en_path: usableEn?.path || null,
        file_en_original_name: usableEn?.originalName || null,
        file_en_size: usableEn?.size || null,
      };

      const updated = await updateResource(existing.id, input);
      if (!updated) throw new Error("Resource not found");

      const oldFilesToDelete = [
        (newFr || removeFr) ? existing.file_fr_path : null,
        (newEn || removeEn) ? existing.file_en_path : null,
        coverImagePath !== existing.cover_image_path ? existing.cover_image_path : null,
      ];
      await Promise.all(oldFilesToDelete.map((filePath) => deleteResourceFile(filePath)));

      res.json(updated);
    } catch (error: any) {
      await cleanupIncomingFiles(files);
      if (generatedCoverPath) await deleteResourceFile(generatedCoverPath);
      res.status(400).json({ error: error.message || "Could not update resource" });
    }
  });
});

router.delete("/:id", editorOrAdmin, async (req, res) => {
  if (!hasValidResourceId(req.params.id)) {
    res.status(400).json({ error: "Invalid resource id" });
    return;
  }
  try {
    const deleted = await deleteResourceRecord(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    await deleteAllResourceAssets(deleted.id);
    res.json({ message: "Resource deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not delete resource" });
  }
});

export default router;
