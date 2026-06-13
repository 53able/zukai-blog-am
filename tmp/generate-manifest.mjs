/**
 * Generate manifest.json from articles/*.html.
 * Run via: node tmp/generate-manifest.mjs
 */

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractAlgomaticSource,
  extractLead,
  extractPublishedMeta,
  extractTitle,
  readArticleHtml,
} from "./html-parse.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_DIR = path.join(ROOT, "articles");
const MANIFEST_PATH = path.join(ROOT, "manifest.json");

/**
 * @param {string} fileName
 * @returns {string}
 */
const toSlug = (fileName) =>
  fileName.replace(/^zukai-/, "").replace(/-apple\.html$/, "");

/**
 * @param {unknown} value
 * @returns {value is {
 *   slug: string;
 *   title: string;
 *   publishedAt: string;
 *   htmlPath: string;
 *   sourceUrl: string;
 *   sourceTitle: string;
 *   lead: string;
 * }}
 */
const isManifestEntry = (value) => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const entry = /** @type {Record<string, unknown>} */ (value);
  return (
    typeof entry.slug === "string" &&
    typeof entry.title === "string" &&
    typeof entry.publishedAt === "string" &&
    typeof entry.htmlPath === "string" &&
    typeof entry.sourceUrl === "string" &&
    typeof entry.sourceTitle === "string" &&
    typeof entry.lead === "string"
  );
};

/**
 * @param {string} fileName
 * @returns {Promise<object>}
 */
const buildEntry = async (fileName) => {
  const filePath = path.join(ARTICLES_DIR, fileName);
  const html = await readArticleHtml(filePath);
  const title = extractTitle(html);
  const publishedAt = extractPublishedMeta(html);
  const lead = extractLead(html);
  const source = extractAlgomaticSource(html);

  if (!title || !publishedAt || !lead || !source) {
    throw new Error(`${fileName}: required fields missing (run backfill first)`);
  }

  return {
    slug: toSlug(fileName),
    title,
    publishedAt,
    htmlPath: `articles/${fileName}`,
    sourceUrl: source.sourceUrl,
    sourceTitle: source.sourceTitle,
    lead,
  };
};

const main = async () => {
  const files = (await readdir(ARTICLES_DIR))
    .filter((name) => name.endsWith(".html"))
    .sort();

  const entries = await Promise.all(files.map(buildEntry));
  entries.sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt),
  );

  if (!entries.every(isManifestEntry)) {
    throw new Error("manifest entry validation failed");
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    siteTitle: "Algomatic Tech Blog 図解ギャラリー",
    entries,
  };

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`wrote ${MANIFEST_PATH} (${entries.length} entries)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
