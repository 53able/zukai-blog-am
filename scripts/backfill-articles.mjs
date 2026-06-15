/**
 * Backfill article HTML with published meta and head meta blocks.
 * Run via: node scripts/backfill-articles.mjs
 *
 * Site chrome (nav / footer) is synced separately:
 *   node scripts/sync-chrome.mjs
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractAlgomaticSource,
  extractLead,
  extractTitle,
  fetchPublishedDate,
} from "./html-parse.mjs";
import { buildArticleHeadMeta, buildIndexHeadMeta, upsertHeadMetaBlock } from "./meta-build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_DIR = path.join(ROOT, "articles");
const INDEX_PATH = path.join(ROOT, "index.html");

/**
 * @param {string} html
 * @param {string} published
 * @returns {string}
 */
const upsertPublishedMeta = (html, published) => {
  const meta = `<meta name="zukai:published" content="${published}" />`;
  if (html.includes('name="zukai:published"')) {
    return html.replace(
      /<meta\s+name="zukai:published"\s+content="[^"]+"\s*\/?>/,
      meta,
    );
  }

  return html.replace("</head>", `  ${meta}\n</head>`);
};

/**
 * @param {string} fileName
 * @returns {Promise<void>}
 */
const backfillArticle = async (fileName) => {
  const filePath = path.join(ARTICLES_DIR, fileName);
  const html = await readFile(filePath, "utf8");
  const source = extractAlgomaticSource(html);

  if (!source) {
    throw new Error(`${fileName}: source-note link not found`);
  }

  const published =
    html.match(/name="zukai:published"\s+content="(\d{4}-\d{2}-\d{2})"/)?.[1] ??
    (await fetchPublishedDate(source.sourceUrl));

  if (!published) {
    throw new Error(`${fileName}: published date unavailable`);
  }

  const title = extractTitle(html);
  const lead = extractLead(html);

  if (!title || !lead) {
    throw new Error(`${fileName}: title or lead missing for head meta`);
  }

  const withPublished = upsertPublishedMeta(html, published);
  const nextHtml = upsertHeadMetaBlock(
    withPublished,
    buildArticleHeadMeta({
      fileName,
      title,
      lead,
      publishedAt: published,
    }),
  );

  await writeFile(filePath, nextHtml, "utf8");
  console.log(`backfilled ${fileName} (${published})`);
};

/**
 * @returns {Promise<void>}
 */
const backfillIndex = async () => {
  const html = await readFile(INDEX_PATH, "utf8");
  const nextHtml = upsertHeadMetaBlock(html, buildIndexHeadMeta());

  await writeFile(INDEX_PATH, nextHtml, "utf8");
  console.log("backfilled index.html");
};

const main = async () => {
  const files = (await readdir(ARTICLES_DIR))
    .filter((name) => name.endsWith(".html"))
    .sort();

  await Promise.all(files.map(backfillArticle));
  await backfillIndex();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
