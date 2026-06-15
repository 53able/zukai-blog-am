/**
 * Verify OGP / SEO head meta across index and articles.
 * Run via: node scripts/verify-meta.mjs
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_DIR = path.join(ROOT, "articles");

/** @type {readonly string[]} */
const REQUIRED_MARKERS = [
  "zukai-head-meta:start",
  'property="og:title"',
  'property="og:image"',
  'name="twitter:card"',
  'rel="canonical"',
  'type="application/ld+json"',
];

/**
 * @param {string} label
 * @param {string} html
 * @returns {string[]}
 */
const findMissingMarkers = (label, html) => {
  const missing = REQUIRED_MARKERS.filter((marker) => !html.includes(marker));
  return missing.map((marker) => `${label}: missing ${marker}`);
};

const main = async () => {
  const indexHtml = await readFile(path.join(ROOT, "index.html"), "utf8");
  const issues = findMissingMarkers("index.html", indexHtml);

  const files = (await readdir(ARTICLES_DIR))
    .filter((name) => name.endsWith(".html"))
    .sort();

  for (const fileName of files) {
    const html = await readFile(path.join(ARTICLES_DIR, fileName), "utf8");
    issues.push(...findMissingMarkers(fileName, html));
  }

  if (issues.length > 0) {
    console.error(issues.join("\n"));
    process.exit(1);
  }

  console.log(`meta verification passed (${files.length + 1} pages)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
