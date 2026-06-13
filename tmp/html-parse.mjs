/**
 * HTML parsing helpers for zukai-blog-am manifest generation.
 * Run via: node tmp/generate-manifest.mjs
 */

import { readFile } from "node:fs/promises";

const ALGOMATIC_HOST = "tech.algomatic.jp";

/**
 * @param {string} html
 * @returns {{ sourceUrl: string; sourceTitle: string } | null}
 */
export const extractAlgomaticSource = (html) => {
  const sourceBlock = html.match(/<p class="source-note">[\s\S]*?<\/p>/);
  if (!sourceBlock) {
    return null;
  }

  const linkMatch = sourceBlock[0].match(
    new RegExp(`href="(https://${ALGOMATIC_HOST.replace(".", "\\.")}[^"]+)"[^>]*>([^<]+)<`),
  );
  if (!linkMatch) {
    return null;
  }

  return {
    sourceUrl: linkMatch[1],
    sourceTitle: linkMatch[2].trim(),
  };
};

/**
 * @param {string} html
 * @returns {string | null}
 */
export const extractTitle = (html) => {
  const match = html.match(/<title>([^<]+)<\/title>/);
  return match ? match[1].trim() : null;
};

/**
 * @param {string} html
 * @returns {string | null}
 */
export const extractPublishedMeta = (html) => {
  const match = html.match(
    /<meta\s+name="zukai:published"\s+content="(\d{4}-\d{2}-\d{2})"\s*\/?>/,
  );
  return match ? match[1] : null;
};

/**
 * @param {string} html
 * @returns {string | null}
 */
export const extractLead = (html) => {
  const heroBlock = html.match(/<section class="hero"[\s\S]*?<\/section>/);
  if (!heroBlock) {
    return null;
  }

  const leadMatch = heroBlock[0].match(/<p class="lead">([^<]+)<\/p>/);
  return leadMatch ? leadMatch[1].trim() : null;
};

/**
 * @param {string} sourceUrl
 * @returns {Promise<string | null>}
 */
export const fetchPublishedDate = async (sourceUrl) => {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    return null;
  }

  const pageHtml = await response.text();
  const match = pageHtml.match(/<time[^>]+datetime="(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
};

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export const readArticleHtml = async (filePath) => readFile(filePath, "utf8");
