/**
 * Build SEO / OGP / Twitter Card / JSON-LD head blocks.
 * Run via: node tmp/backfill-articles.mjs
 */

import {
  ASSETS,
  SITE,
  escapeHtmlAttr,
  toAbsoluteAssetUrl,
  toAbsolutePageUrl,
  toCanonicalUrl,
  toPublishedDateTime,
} from "./meta-config.mjs";

const META_START = "<!-- zukai-head-meta:start -->";
const META_END = "<!-- zukai-head-meta:end -->";

/**
 * @param {Record<string, string>} values
 * @returns {string}
 */
const buildJsonLd = (values) =>
  JSON.stringify(values, null, 2).replace(/</g, "\\u003c");

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   canonicalPath: string;
 *   assetPrefix: string;
 *   ogType: "website" | "article";
 *   publishedAt?: string;
 *   imageAlt: string;
 *   jsonLd: Record<string, unknown>;
 * }} input
 * @returns {string}
 */
const buildHeadMetaBlock = ({
  title,
  description,
  canonicalPath,
  assetPrefix,
  ogType,
  publishedAt,
  imageAlt,
  jsonLd,
}) => {
  const canonicalUrl = toCanonicalUrl(canonicalPath);
  const ogImageUrl = toAbsoluteAssetUrl(ASSETS.ogImagePath);
  const safeTitle = escapeHtmlAttr(title);
  const safeDescription = escapeHtmlAttr(description);
  const safeImageAlt = escapeHtmlAttr(imageAlt);
  const articlePublished =
    ogType === "article" && publishedAt
      ? `\n  <meta property="article:published_time" content="${toPublishedDateTime(publishedAt)}" />`
      : "";

  return `${META_START}
  <meta name="description" content="${safeDescription}" />
  <meta name="author" content="${escapeHtmlAttr(SITE.author)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" href="${assetPrefix}${ASSETS.faviconPath}" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="${assetPrefix}${ASSETS.appleTouchIconPath}" />
  <meta name="theme-color" content="${SITE.themeColor}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${escapeHtmlAttr(SITE.name)}" />
  <meta property="og:locale" content="${SITE.locale}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeImageAlt}" />${articlePublished}
  <meta name="twitter:card" content="${SITE.twitterCard}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${ogImageUrl}" />
  <meta name="twitter:image:alt" content="${safeImageAlt}" />
  <script type="application/ld+json">
${buildJsonLd(jsonLd)}
  </script>
${META_END}`;
};

/**
 * @param {string} html
 * @param {string} block
 * @returns {string}
 */
export const upsertHeadMetaBlock = (html, block) => {
  const wrappedBlock = `\n  ${block}\n`;
  const existing = new RegExp(
    `${META_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${META_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
  );

  if (existing.test(html)) {
    return html.replace(existing, wrappedBlock.trim());
  }

  return html.replace("</head>", `${wrappedBlock}</head>`);
};

/**
 * @param {{
 *   fileName: string;
 *   title: string;
 *   lead: string;
 *   publishedAt: string;
 * }} input
 * @returns {string}
 */
export const buildArticleHeadMeta = ({ fileName, title, lead, publishedAt }) => {
  const canonicalPath = `articles/${fileName}`;

  return buildHeadMetaBlock({
    title,
    description: lead,
    canonicalPath,
    assetPrefix: "../",
    ogType: "article",
    publishedAt,
    imageAlt: title,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: lead,
      datePublished: toPublishedDateTime(publishedAt),
      author: {
        "@type": "Person",
        name: SITE.author,
      },
      isPartOf: {
        "@type": "WebSite",
        name: SITE.name,
        url: `${SITE.origin}/`,
      },
      mainEntityOfPage: toAbsolutePageUrl(canonicalPath),
      image: [toAbsoluteAssetUrl(ASSETS.ogImagePath)],
      inLanguage: "ja",
    },
  });
};

/**
 * @returns {string}
 */
export const buildIndexHeadMeta = () =>
  buildHeadMetaBlock({
    title: `${SITE.name} | zukai-creator`,
    description: SITE.description,
    canonicalPath: "index.html",
    assetPrefix: "",
    ogType: "website",
    imageAlt: SITE.name,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: SITE.name,
      description: SITE.description,
      url: `${SITE.origin}/`,
      inLanguage: "ja",
      isPartOf: {
        "@type": "WebSite",
        name: SITE.name,
        url: `${SITE.origin}/`,
      },
      publisher: {
        "@type": "Person",
        name: SITE.author,
      },
      image: [toAbsoluteAssetUrl(ASSETS.ogImagePath)],
    },
  });
