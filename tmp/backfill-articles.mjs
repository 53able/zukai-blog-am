/**
 * Backfill article HTML with published meta, site chrome, and footer.
 * Run via: node tmp/backfill-articles.mjs
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractAlgomaticSource,
  fetchPublishedDate,
} from "./html-parse.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_DIR = path.join(ROOT, "articles");

const FOOTER_HTML = `<footer class="footer site-chrome-footer">
      <p>Algomatic Tech Blog の記事を zukai-creator で再構成した非公式図解です。</p>
      <p>© 図解構成: Go (@53able) · Designed with Apple-style tokens</p>
    </footer>`;

/**
 * @param {string} sourceUrl
 * @returns {string}
 */
const buildNavHtml = (sourceUrl) => `<nav class="site-chrome-nav" aria-label="サイト">
    <div class="site-chrome-nav-inner">
      <a href="../index.html">← 図解ギャラリー</a>
      <a href="${sourceUrl}">元記事を読む</a>
    </div>
  </nav>`;

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
 * @param {string} html
 * @returns {string}
 */
const upsertChromeStylesheet = (html) => {
  const link = `<link rel="stylesheet" href="../assets/site-chrome.css" />`;
  if (html.includes("site-chrome.css")) {
    return html;
  }

  return html.replace("</head>", `  ${link}\n</head>`);
};

/**
 * @param {string} html
 * @param {string} sourceUrl
 * @returns {string}
 */
const upsertNav = (html, sourceUrl) => {
  if (html.includes('class="site-chrome-nav"')) {
    return html.replace(
      /<nav class="site-chrome-nav"[\s\S]*?<\/nav>/,
      buildNavHtml(sourceUrl),
    );
  }

  return html.replace("<body>", `<body>\n  ${buildNavHtml(sourceUrl)}\n`);
};

/**
 * @param {string} html
 * @returns {string}
 */
const replaceFooter = (html) =>
  html.replace(/<footer class="footer[^"]*">[\s\S]*?<\/footer>/, FOOTER_HTML);

/**
 * @param {string} fileName
 * @returns {Promise<void>}
 */
const backfillArticle = async (fileName) => {
  const filePath = path.join(ARTICLES_DIR, fileName);
  const rawHtml = await readFile(filePath, "utf8");
  const html = rawHtml;
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

  const nextHtml = replaceFooter(
    upsertNav(
      upsertChromeStylesheet(upsertPublishedMeta(html, published)),
      source.sourceUrl,
    ),
  );

  await writeFile(filePath, nextHtml, "utf8");
  console.log(`backfilled ${fileName} (${published})`);
};

const main = async () => {
  const files = (await readdir(ARTICLES_DIR))
    .filter((name) => name.endsWith(".html"))
    .sort();

  await Promise.all(files.map(backfillArticle));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
