import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

// Allowed sections — maps to subfolder names
const VALID_SECTIONS = [
  "hero",
  "fields",
  "tools",
  "partners",
  "socials",
  "news",
  "thematics",
  "projects",
  "project-results",
  "team",
] as const;
type Section = (typeof VALID_SECTIONS)[number];

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/svg",
];

const ALLOWED_RESULT_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".csv",
  ".txt",
  ".zip",
]);

const ALLOWED_RESULT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);

/**
 * Returns a multer storage engine that saves files to
 * `uploads/{section}/{uuid}.{ext}`
 */
function storageForSection(section: Section) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(UPLOAD_ROOT, section);
      // Ensure directory exists
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".bin";
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

/**
 * Returns a configured multer middleware for the given section.
 * Validates section name, file type, and file size.
 */
export function uploadMiddleware(section: string) {
  if (!VALID_SECTIONS.includes(section as Section)) {
    throw new Error(`Invalid upload section: ${section}`);
  }

  return multer({
    storage: storageForSection(section as Section),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (section === "project-results") {
        if (
          ALLOWED_RESULT_EXTENSIONS.has(ext) &&
          ALLOWED_RESULT_MIME_TYPES.has(file.mimetype)
        ) {
          cb(null, true);
        } else {
          cb(new Error(`File type not allowed: ${file.mimetype}`));
        }
        return;
      }

      // Also check by extension for SVGs (some browsers send wrong MIME)
      if (
        ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype) ||
        (ext === ".svg" && file.mimetype === "application/octet-stream")
      ) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`));
      }
    },
  }).single("file");
}

/**
 * Deletes a file from the uploads directory if it exists.
 * Used to clean up old files when an image is replaced.
 */
export function deleteUploadedFile(urlPath: string) {
  if (!urlPath.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), urlPath);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error(`Failed to delete file ${filePath}:`, err.message);
    }
  });
}

export { VALID_SECTIONS };
