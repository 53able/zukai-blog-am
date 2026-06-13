/**
 * Generate index.html from manifest.json.
 * Run via: node tmp/generate-index.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = path.join(ROOT, "manifest.json");
const INDEX_PATH = path.join(ROOT, "index.html");

/**
 * @param {string} value
 * @returns {string}
 */
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * @param {string} isoDate
 * @returns {{ label: string; datetime: string }}
 */
const formatDate = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00+09:00`);
  return {
    datetime: isoDate,
    label: new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tokyo",
    }).format(date),
  };
};

/**
 * @param {{
 *   slug: string;
 *   title: string;
 *   publishedAt: string;
 *   htmlPath: string;
 *   sourceUrl: string;
 *   sourceTitle: string;
 *   lead: string;
 * }} entry
 * @returns {string}
 */
const renderCard = (entry) => {
  const date = formatDate(entry.publishedAt);
  return `<article class="gallery-card">
        <div class="gallery-card-meta">
          <time class="gallery-card-date" datetime="${escapeHtml(date.datetime)}">${escapeHtml(date.label)}</time>
        </div>
        <div class="gallery-card-body">
          <h2><a href="${escapeHtml(entry.htmlPath)}">${escapeHtml(entry.title)}</a></h2>
          <p class="gallery-card-lead">${escapeHtml(entry.lead)}</p>
          <div class="gallery-card-foot">
            <p class="gallery-card-source">元記事 <a href="${escapeHtml(entry.sourceUrl)}">${escapeHtml(entry.sourceTitle)}</a></p>
            <a class="gallery-card-cta" href="${escapeHtml(entry.htmlPath)}">図解を見る</a>
          </div>
        </div>
      </article>`;
};

const main = async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const entries = /** @type {Array<{
    slug: string;
    title: string;
    publishedAt: string;
    htmlPath: string;
    sourceUrl: string;
    sourceTitle: string;
    lead: string;
  }>} */ (manifest.entries);

  const cards = entries.map(renderCard).join("\n");
  const countLabel = `<span class="tabular-nums">${entries.length}</span> 件の図解`;
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Algomatic Tech Blog 図解ギャラリー | zukai-creator</title>
  <meta name="description" content="Algomatic Tech Blog の記事を zukai-creator で再構成した非公式図解一覧です。" />
  <link rel="stylesheet" href="assets/site-chrome.css" />
</head>
<body class="page-index">
  <header class="gallery-topbar" aria-label="サイト">
    <div class="gallery-topbar-inner">
      <span class="gallery-topbar-brand">図解ギャラリー</span>
      <a class="gallery-topbar-link" href="https://tech.algomatic.jp/">Algomatic Tech Blog</a>
    </div>
  </header>
  <section class="gallery-hero" aria-labelledby="gallery-title">
    <div class="gallery-hero-inner">
      <p class="gallery-kicker"><span class="gallery-kicker-dot" aria-hidden="true"></span>zukai-creator · 非公式図解</p>
      <h1 id="gallery-title">Algomatic Tech Blog<br />図解ギャラリー</h1>
      <p class="gallery-lead">Tech Blog の記事を、読みやすい図解構成に再編集した一覧です。全文は各元記事へ。</p>
      <p class="gallery-stat">${countLabel}</p>
    </div>
  </section>
  <main class="gallery-main">
    <div class="gallery-list" aria-label="図解一覧">
${cards}
    </div>
  </main>
  <footer class="site-chrome-footer">
    <p>Algomatic Tech Blog の記事を zukai-creator で再構成した非公式図解です。</p>
    <p>© 図解構成: Go (@53able) · Designed with Apple-style tokens</p>
  </footer>
</body>
</html>
`;

  await writeFile(INDEX_PATH, html, "utf8");
  console.log(`wrote ${INDEX_PATH} (${entries.length} cards)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
