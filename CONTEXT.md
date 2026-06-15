# zukai-blog-am — Domain Glossary

## Site

**図解ギャラリー**  
Algomatic Tech Blog 各記事に対応する図解 HTML を一覧し、個別ページへ遷移させる GitHub Pages サイト。主目的は図解の発見と閲覧。元記事へのリンクは各図解内の source-note で提供する。

**公開先**  
GitHub Project Pages。リポジトリ `53able/zukai-blog-am`、`main` ブランチのルート直下を公開。URL は `https://53able.github.io/zukai-blog-am/`。

**一覧メンテナンス**  
`manifest.json` を正とし、`index.html` は固定シェルとして runtime に `manifest.json` を読み込む。GitHub Actions は使わない（ビルドレス公開）。

**manifest の正**  
`articles/*.html` から自動抽出する。`<title>`・`source-note` 内リンク・ファイル名を読み、スクリプトが `manifest.json` を生成する。手書き manifest は行わない。

**公開日**  
各図解 HTML の `<head>` に `<meta name="zukai:published" content="YYYY-MM-DD" />` を置く。値は**元記事（Algomatic Tech Blog）の公開日**とする。一覧はこの日付の降順で並べる。

**図解ページの導線**  
各図解 HTML 上部に **図解ヘッダー** を置く。「← 図解ギャラリー」と「元記事を読む」（`source-note` と同じ URL）。footer のローカル絶対パスは公開用クレジットに差し替える。

**一覧ヘッダー**  
`index.html` 上部の最小ヘッダー。左にサイト名、右に Algomatic Tech Blog へのリンク。図解ヘッダーと導線は異なるが、**chrome ヘッダー bar** の構造は揃える。frosted 背景色は parchment 系で、図解ヘッダーの white 系とは意図的に異なる。
_Avoid_: gallery-topbar（実装名。概念としては一覧ヘッダー）

**図解ヘッダー**  
各 `articles/*.html` 上部の最小ヘッダー。「← 図解ギャラリー」と「元記事を読む」。一覧ヘッダーと **chrome ヘッダー bar** の構造（sticky・blur・hairline・余白・リンク typography）は揃える。frosted 背景色は white 系で、一覧ヘッダーの parchment 系とは意図的に異なる。
_Avoid_: site-chrome-nav（実装名。概念としては図解ヘッダー）

**chrome ヘッダー bar**  
一覧ヘッダーと図解ヘッダーで共有する見た目の骨格（sticky 配置・backdrop blur・下線・内側 max-width・リンク typography）。frosted 背景色はページ canvas に合わせ、一覧と図解で2系統のままにする。

**サイト chrome**  
図解ギャラリー全ページで共有する最小 UI（ヘッダー・フッター・クレジット）。CSS は `assets/site-chrome.css` に集約する。HTML は各ファイルに残すが、**chrome 同期**で **chrome テンプレート** から注入する。

**chrome フッター**  
全ページ共通のクレジット2行（非公式声明 + © 表記）。index と記事で HTML・class は同一（`footer site-chrome-footer`）。DOM 上の位置（`<main>` の内外）はページ種別で異なってよい。
_Avoid_: site-chrome-footer（class 名。概念としては chrome フッター）

**chrome テンプレート**  
一覧ヘッダー・図解ヘッダー・chrome フッターの HTML 断片。正は `scripts/chrome-templates.mjs` に置き、`scripts/sync-chrome.mjs` が読み込んで各 HTML へ注入する。
_Avoid_: backfill 内の直書き定数（テンプレ増加時に散らばる）

**backfill**  
`scripts/backfill-articles.mjs` によるメタデータ同期。`zukai:published` と head meta（OGP / canonical / JSON-LD）だけを更新する。ヘッダー・フッター・CSS リンクは触らない。
_Avoid_: chrome 同期（UI 注入。backfill と混同しやすい）

**chrome 同期**  
`scripts/sync-chrome.mjs` が **chrome テンプレート** を `index.html` と全 `articles/*.html` へ注入する操作。ヘッダー・フッター・`site-chrome.css` リンクを扱う。head meta や `zukai:published` は扱わない。
_Avoid_: backfill（メタデータ同期。chrome 同期と混同しやすい）

**chrome テンプレート同期**  
**chrome テンプレート** を正とし、**chrome 同期**（と記事追加時の backfill）で各 HTML へ反映する運用全体。GitHub Pages は静的 HTML のまま公開する。

**図解本体**  
各 `articles/*.html` 内の hero 以降の図解コンテンツと、そのページ固有スタイル。サイト chrome とは分離する。
_Avoid_: 本文, 記事本体（chrome と混同しやすい）

**一覧カード**  
標準構成: 公開日、`title`、hero の `p.lead`（1行）、元記事タイトルリンク（`source-note` から抽出）、「図解を見る」リンク。公開日降順。

**サイト名**  
index ヒーロー: 「Algomatic Tech Blog 図解ギャラリー」。サブ: 「zukai-creator で再構成した図解一覧」。`<title>`: `Algomatic Tech Blog 図解ギャラリー | zukai-creator`。

**公式性**  
非公式・個人制作（`53able` リポジトリ）。Algomatic 社公式サイトではない。footer に非公式である旨と @53able / zukai-creator クレジットを表記する。

**生成物の git 管理**  
`manifest.json` と固定シェルの `index.html` を両方コミットする。HTML 追加時は `scripts/backfill-articles.mjs` で head meta / `zukai:published` を同期し、続けて `scripts/generate-manifest.mjs` を実行する。chrome 変更時は `scripts/sync-chrome.mjs` を実行する。一覧更新差分は原則 `manifest.json` だけに閉じる。

**head meta（OGP / SEO）**  
`scripts/meta-config.mjs` を正とし、`scripts/backfill-articles.mjs` が `index.html` と各 `articles/*.html` の `<!-- zukai-head-meta -->` ブロックを生成する。入力は `<title>`・hero の `p.lead`・`zukai:published`。共通 OG 画像は `assets/og-default.png`（1200×630）。検証は `scripts/verify-meta.mjs`。

**v1 スコープ**  
初回公開: `index.html`、`assets/site-chrome.css`、既存9図解の backfill（`zukai:published`）と chrome 注入、生成スクリプト、`manifest.json`、README、GitHub Pages 有効化。zukai-creator 記事の図解・404・カスタムドメインは v1 外。OGP 基本セットと共通 OG 画像は v1 以降で追加済み。chrome テンプレート同期（`sync-chrome.mjs`）も v1 以降で追加済み。記事別 OG 画像は未対応。

**元記事 URL**  
`articles/` 内の `source-note` URL をそのまま正とする。Hatena 側で `dvent-calendar` が canonical になっている記事は、動作する URL を維持する。
