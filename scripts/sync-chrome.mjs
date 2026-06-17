/**
 * Sync site chrome (headers, footers, stylesheet link) from chrome templates.
 * Run via: node scripts/sync-chrome.mjs
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildArticleHeaderHtml,
  CHROME_FOOTER_HTML,
  INDEX_HEADER_HTML,
} from "./chrome-templates.mjs";
import { extractAlgomaticSource } from "./html-parse.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_DIR = path.join(ROOT, "articles");
const INDEX_PATH = path.join(ROOT, "index.html");

/**
 * @param {string} html
 * @param {string} linkTag
 * @returns {string}
 */
const upsertChromeStylesheet = (html, linkTag) => {
  if (html.includes("site-chrome.css")) {
    return html.replace(
      /<link rel="stylesheet" href="(?:\.\.\/)?assets\/site-chrome\.css"\s*\/>/,
      linkTag,
    );
  }

  return html.replace("</head>", `  ${linkTag}\n</head>`);
};

/**
 * @param {string} html
 * @returns {string}
 */
const replaceChromeFooter = (html) =>
  html.replace(/<footer class="[^"]*">[\s\S]*?<\/footer>/, CHROME_FOOTER_HTML);

/**
 * @param {string} html
 * @returns {string}
 */
const removeIndexHeaders = (html) =>
  html.replace(/\n?\s*<header class="gallery-topbar[^"]*"[\s\S]*?<\/header>\s*/g, "\n  ");

/**
 * @param {string} html
 * @returns {string}
 */
const upsertIndexHeader = (html) => {
  const withoutHeaders = removeIndexHeaders(html);
  return withoutHeaders.replace(/<body([^>]*)>/, `<body$1>\n  ${INDEX_HEADER_HTML}`);
};

/**
 * @param {string} html
 * @returns {string}
 */
const removeArticleHeaders = (html) =>
  html.replace(/\n?\s*<nav class="site-chrome-nav[^"]*"[\s\S]*?<\/nav>\s*/g, "\n  ");

/**
 * @param {string} html
 * @param {string} sourceUrl
 * @returns {string}
 */
const upsertArticleHeader = (html, sourceUrl) => {
  const headerHtml = buildArticleHeaderHtml(sourceUrl);
  const withoutHeaders = removeArticleHeaders(html);
  return withoutHeaders.replace(/<body([^>]*)>/, `<body$1>\n  ${headerHtml}\n`);
};

/**
 * @param {string} fileName
 * @returns {Promise<void>}
 */
const syncArticle = async (fileName) => {
  const filePath = path.join(ARTICLES_DIR, fileName);
  const html = await readFile(filePath, "utf8");
  const source = extractAlgomaticSource(html);

  if (!source) {
    throw new Error(`${fileName}: source-note link not found`);
  }

  const nextHtml = replaceChromeFooter(
    upsertArticleHeader(
      upsertChromeStylesheet(
        html,
        `<link rel="stylesheet" href="../assets/site-chrome.css" />`,
      ),
      source.sourceUrl,
    ),
  );

  await writeFile(filePath, nextHtml, "utf8");
  console.log(`synced chrome ${fileName}`);
};

/**
 * @returns {Promise<void>}
 */
const syncIndex = async () => {
  const html = await readFile(INDEX_PATH, "utf8");
  const nextHtml = replaceChromeFooter(
    upsertIndexHeader(
      upsertChromeStylesheet(
        html,
        `<link rel="stylesheet" href="assets/site-chrome.css" />`,
      ),
    ),
  );

  await writeFile(INDEX_PATH, nextHtml, "utf8");
  console.log("synced chrome index.html");
};

const main = async () => {
  const files = (await readdir(ARTICLES_DIR))
    .filter((name) => name.endsWith(".html"))
    .sort();

  await Promise.all(files.map(syncArticle));
  await syncIndex();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
