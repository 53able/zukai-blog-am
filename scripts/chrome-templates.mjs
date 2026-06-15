/**
 * Site chrome HTML templates for zukai-blog-am.
 * Consumed by scripts/sync-chrome.mjs
 */

/** @type {string} */
export const CHROME_FOOTER_HTML = `<footer class="footer site-chrome-footer">
      <p>Algomatic Tech Blog の記事を zukai-creator で再構成した非公式図解です。</p>
      <p>© 図解構成: Go (@53able) · Designed with Apple-style tokens</p>
    </footer>`;

/** @type {string} */
export const INDEX_HEADER_HTML = `<header class="gallery-topbar site-chrome-bar" aria-label="サイト">
    <div class="gallery-topbar-inner">
      <span class="gallery-topbar-brand">図解ギャラリー</span>
      <a class="gallery-topbar-link" href="https://tech.algomatic.jp/">Algomatic Tech Blog</a>
    </div>
  </header>`;

/**
 * @param {string} sourceUrl
 * @returns {string}
 */
export const buildArticleHeaderHtml = (sourceUrl) => `<nav class="site-chrome-nav site-chrome-bar" aria-label="サイト">
    <div class="site-chrome-nav-inner">
      <a href="../index.html">← 図解ギャラリー</a>
      <a href="${sourceUrl}">元記事を読む</a>
    </div>
  </nav>`;
