# Chrome template sync via sync-chrome.mjs

図解ギャラリーのヘッダー・フッターは `scripts/chrome-templates.mjs` を正とし、`scripts/sync-chrome.mjs` が `index.html` と全 `articles/*.html` へ注入する。メタデータ（`zukai:published`、OGP、JSON-LD）は `scripts/backfill-articles.mjs` のみが触る。

backfill に chrome 注入を残す案（5a）より、chrome だけ更新したいときにネットワーク付き backfill を走らせなくて済む点を優先した。一覧ヘッダーと図解ヘッダーは導線が異なるため HTML は2種類のまま、見た目の骨格だけ `site-chrome.css` の `.site-chrome-bar` で揃える。フッター HTML は index と記事で同一（`footer site-chrome-footer`）。
