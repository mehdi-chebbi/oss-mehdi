import { execFile } from "child_process";
import fs from "fs";
import multer from "multer";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const execFileAsync = promisify(execFile);
const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const RESOURCE_ROOT = path.join(UPLOAD_ROOT, "resources");
const RESOURCE_FILES_ROOT = path.join(RESOURCE_ROOT, "files");
const RESOURCE_COVERS_ROOT = path.join(RESOURCE_ROOT, "covers");

const MAX_RESOURCE_FILE_SIZE = 50 * 1024 * 1024;
const PDF_FIELDS = new Set(["file_fr", "file_en"]);
const COVER_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const COVER_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export type ResourceUploadFiles = Record<string, Express.Multer.File[]>;

function sanitizeBaseName(originalName: string, fallback: string) {
  const parsed = path.parse(originalName);
  return (
    parsed.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 120) || fallback
  );
}

function destinationForField(resourceId: string, fieldName: string) {
  if (fieldName === "file_fr") return path.join(RESOURCE_FILES_ROOT, resourceId, "fr");
  if (fieldName === "file_en") return path.join(RESOURCE_FILES_ROOT, resourceId, "en");
  return RESOURCE_COVERS_ROOT;
}

export function resourceUploadMiddleware(resourceId: string) {
  const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
      const destination = destinationForField(resourceId, file.fieldname);
      fs.mkdirSync(destination, { recursive: true });
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const isPdf = PDF_FIELDS.has(file.fieldname);
      const extension = isPdf ? ".pdf" : COVER_EXTENSIONS[file.mimetype] || ".jpg";
      const baseName = sanitizeBaseName(file.originalname, isPdf ? "document" : "cover");
      const prefix = file.fieldname === "cover" ? `${resourceId}--` : "";
      cb(null, `${prefix}${baseName}--${uuidv4()}${extension}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_RESOURCE_FILE_SIZE,
      files: 3,
    },
    fileFilter: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();

      if (PDF_FIELDS.has(file.fieldname)) {
        const validMime = file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream";
        if (validMime && extension === ".pdf") {
          cb(null, true);
        } else {
          cb(new Error("Only PDF files are allowed"));
        }
        return;
      }

      if (file.fieldname === "cover") {
        if (COVER_MIME_TYPES.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Cover must be JPEG, PNG, or WebP"));
        }
        return;
      }

      cb(new Error(`Unexpected file field: ${file.fieldname}`));
    },
  }).fields([
    { name: "file_fr", maxCount: 1 },
    { name: "file_en", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]);
}

export function getUploadedFile(files: ResourceUploadFiles | undefined, fieldName: string) {
  return files?.[fieldName]?.[0] || null;
}

export function publicUrlForUploadedFile(file: Express.Multer.File) {
  const relative = path.relative(UPLOAD_ROOT, file.path).split(path.sep).join("/");
  return `/uploads/${relative}`;
}

function localPathFromPublicUrl(urlPath: string) {
  if (!urlPath.startsWith("/uploads/")) return null;
  const relative = urlPath.slice("/uploads/".length);
  const resolved = path.resolve(UPLOAD_ROOT, relative);
  const rootWithSeparator = `${UPLOAD_ROOT}${path.sep}`;
  return resolved.startsWith(rootWithSeparator) ? resolved : null;
}

export async function generatePdfCover(resourceId: string, pdfUrlPath: string) {
  const pdfPath = localPathFromPublicUrl(pdfUrlPath);
  if (!pdfPath) throw new Error("Invalid PDF path for cover generation");

  await fs.promises.mkdir(RESOURCE_COVERS_ROOT, { recursive: true });
  const pdfBaseName = sanitizeBaseName(path.basename(pdfPath), "document");
  const coverBaseName = `${resourceId}--${pdfBaseName}--${uuidv4()}`;
  const outputBase = path.join(RESOURCE_COVERS_ROOT, coverBaseName);

  try {
    await execFileAsync("pdftoppm", [
      "-f", "1",
      "-l", "1",
      "-singlefile",
      "-jpeg",
      "-jpegopt", "quality=86",
      "-scale-to", "1200",
      pdfPath,
      outputBase,
    ]);
  } catch (error: any) {
    await fs.promises.unlink(`${outputBase}.jpg`).catch(() => undefined);
    throw new Error(`Could not generate the PDF cover: ${error.message}`);
  }

  const coverPath = `${outputBase}.jpg`;
  await fs.promises.access(coverPath);
  return `/uploads/resources/covers/${path.basename(coverPath)}`;
}

export async function deleteResourceFile(urlPath: string | null | undefined) {
  if (!urlPath) return;
  const filePath = localPathFromPublicUrl(urlPath);
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete resource file ${filePath}:`, error.message);
    }
  }
}

export async function cleanupIncomingFiles(files: ResourceUploadFiles | undefined) {
  if (!files) return;
  await Promise.all(
    Object.values(files)
      .flat()
      .map((file) => fs.promises.unlink(file.path).catch(() => undefined)),
  );
}

export async function deleteAllResourceAssets(resourceId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(resourceId)) return;

  await fs.promises.rm(path.join(RESOURCE_FILES_ROOT, resourceId), { recursive: true, force: true });

  try {
    const covers = await fs.promises.readdir(RESOURCE_COVERS_ROOT);
    await Promise.all(
      covers
        .filter((name) => name.startsWith(`${resourceId}--`))
        .map((name) => fs.promises.unlink(path.join(RESOURCE_COVERS_ROOT, name)).catch(() => undefined)),
    );
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }
}
