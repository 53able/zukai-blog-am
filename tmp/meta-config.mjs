/**
 * Shared site metadata for OGP, SEO, and JSON-LD.
 * Run via: node tmp/backfill-articles.mjs
 */

/** @type {const} */
export const SITE = {
  origin: "https://53able.github.io/zukai-blog-am",
  name: "Algomatic Tech Blog 図解ギャラリー",
  description:
    "Algomatic Tech Blog の記事を zukai-creator で再構成した非公式図解一覧です。",
  locale: "ja_JP",
  author: "Go (@53able)",
  themeColor: "#0066cc",
  twitterCard: "summary_large_image",
};

/** @type {const} */
export const ASSETS = {
  faviconPath: "assets/favicon.svg",
  appleTouchIconPath: "assets/apple-touch-icon.png",
  ogImagePath: "assets/og-default.png",
};

/**
 * @param {string} assetPath
 * @returns {string}
 */
export const toAbsoluteAssetUrl = (assetPath) =>
  `${SITE.origin}/${assetPath.replace(/^\//, "")}`;

/**
 * @param {string} htmlPath
 * @returns {string}
 */
export const toAbsolutePageUrl = (htmlPath) =>
  `${SITE.origin}/${htmlPath.replace(/^\//, "")}`;

/**
 * @param {string} htmlPath
 * @returns {string}
 */
export const toCanonicalUrl = (htmlPath) => {
  const normalized = htmlPath.replace(/^\//, "");
  if (normalized === "" || normalized === "index.html") {
    return `${SITE.origin}/`;
  }

  return toAbsolutePageUrl(normalized);
};

/**
 * @param {string} value
 * @returns {string}
 */
export const escapeHtmlAttr = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");

/**
 * @param {string} isoDate
 * @returns {string}
 */
export const toPublishedDateTime = (isoDate) => `${isoDate}T00:00:00+09:00`;
