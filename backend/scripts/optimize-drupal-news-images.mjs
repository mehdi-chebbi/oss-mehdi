import { spawn } from "node:child_process";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";

const downloadManifestPath = resolve(
  process.argv[2] || "db/drupal-news-latest-10-images.json",
);
const sourceRoot = resolve(process.argv[3] || "../storage/uploads/news/drupal");
const outputRoot = resolve(process.argv[4] || "../storage/uploads/news/drupal-web");
const outputManifestPath = resolve(
  process.argv[5] || "db/drupal-news-latest-10-images-web.json",
);
const magickPath =
  process.argv[6] ||
  "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

const concurrency = 2;
const targetBytes = 1_000_000;
const variants = [
  { max_dimension: 1920, quality: 82 },
  { max_dimension: 1920, quality: 76 },
  { max_dimension: 1600, quality: 74 },
  { max_dimension: 1440, quality: 72 },
];

async function fileSize(path) {
  try {
    const details = await stat(path);
    return details.isFile() ? details.size : 0;
  } catch {
    return 0;
  }
}

function runMagick(source, destination, variant) {
  return new Promise((accept, reject) => {
    const process = spawn(
      magickPath,
      [
        source,
        "-auto-orient",
        "-resize",
        `${variant.max_dimension}x${variant.max_dimension}>`,
        "-colorspace",
        "sRGB",
        "-strip",
        "-define",
        "webp:method=6",
        "-define",
        "webp:alpha-quality=90",
        "-quality",
        String(variant.quality),
        destination,
      ],
      { windowsHide: true },
    );
    let errorOutput = "";
    process.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });
    process.on("error", reject);
    process.on("close", (code) => {
      if (code === 0) accept();
      else reject(new Error(errorOutput.trim() || `ImageMagick exited with code ${code}`));
    });
  });
}

async function optimizeImage(image) {
  const source = resolve(sourceRoot, image.file_name);
  const stem = basename(image.file_name, extname(image.file_name));
  const outputFileName = `${stem}.webp`;
  const destination = resolve(outputRoot, outputFileName);
  const sourceBytes = await fileSize(source);
  if (sourceBytes === 0) throw new Error(`Source image is missing: ${source}`);

  let outputBytes = 0;
  let selectedVariant = variants[variants.length - 1];
  for (const variant of variants) {
    selectedVariant = variant;
    await unlink(destination).catch(() => undefined);
    await runMagick(source, destination, variant);
    outputBytes = await fileSize(destination);
    if (outputBytes === 0) throw new Error(`Optimized image is empty: ${destination}`);
    if (outputBytes <= targetBytes) break;
  }

  return {
    remote_url: image.remote_url,
    source_file_name: image.file_name,
    file_name: outputFileName,
    local_path: `/uploads/news/drupal-web/${encodeURIComponent(outputFileName)}`,
    source_bytes: sourceBytes,
    size: outputBytes,
    max_dimension: selectedVariant.max_dimension,
    quality: selectedVariant.quality,
    status: "optimized",
  };
}

async function mapWithConcurrency(items, workerCount, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await worker(items[index]);
      } catch (error) {
        results[index] = {
          remote_url: items[index].remote_url,
          local_path: null,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(workerCount, items.length) }, () => runWorker()),
  );
  return results;
}

const downloadManifest = JSON.parse(await readFile(downloadManifestPath, "utf8"));
const sourceImages = Object.values(downloadManifest.images).filter(
  (image) => image.local_path && image.file_name,
);

await mkdir(outputRoot, { recursive: true });
const results = await mapWithConcurrency(sourceImages, concurrency, optimizeImage);
const successful = results.filter((result) => result.local_path);
const failed = results.filter((result) => !result.local_path);
const sourceBytes = successful.reduce(
  (total, result) => total + Number(result.source_bytes || 0),
  0,
);
const outputBytes = successful.reduce(
  (total, result) => total + Number(result.size || 0),
  0,
);

const manifest = {
  format_version: 1,
  generated_at: new Date().toISOString(),
  source_manifest: downloadManifestPath,
  source_root: sourceRoot,
  output_root: outputRoot,
  settings: {
    format: "webp",
    target_bytes: targetBytes,
    variants,
    auto_orient: true,
    strip_metadata: true,
  },
  article_ids: downloadManifest.article_ids,
  counts: {
    images: sourceImages.length,
    optimized: successful.length,
    failed: failed.length,
    source_bytes: sourceBytes,
    output_bytes: outputBytes,
    saved_bytes: sourceBytes - outputBytes,
    reduction_percent:
      sourceBytes > 0 ? Number((((sourceBytes - outputBytes) / sourceBytes) * 100).toFixed(2)) : 0,
    over_target: successful.filter((result) => result.size > targetBytes).length,
  },
  images: Object.fromEntries(results.map((result) => [result.remote_url, result])),
};

await mkdir(dirname(outputManifestPath), { recursive: true });
await writeFile(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(manifest.counts, null, 2)}\n`);
if (failed.length > 0) process.exitCode = 1;
