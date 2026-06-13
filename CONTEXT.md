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
各図解 HTML 上部に最小ヘッダーを置く。「← 図解ギャラリー」と「元記事を読む」（`source-note` と同じ URL）。footer のローカル絶対パスは公開用クレジットに差し替える。

**サイト chrome**  
nav と footer クレジット用 CSS は `assets/site-chrome.css` に集約する。図解本体のスタイルは各 HTML 内のまま。`index.html` も同じ `site-chrome.css` を使う。

**一覧カード**  
標準構成: 公開日、`title`、hero の `p.lead`（1行）、元記事タイトルリンク（`source-note` から抽出）、「図解を見る」リンク。公開日降順。

**サイト名**  
index ヒーロー: 「Algomatic Tech Blog 図解ギャラリー」。サブ: 「zukai-creator で再構成した図解一覧」。`<title>`: `Algomatic Tech Blog 図解ギャラリー | zukai-creator`。

**公式性**  
非公式・個人制作（`53able` リポジトリ）。Algomatic 社公式サイトではない。footer に非公式である旨と @53able / zukai-creator クレジットを表記する。

**生成物の git 管理**  
`manifest.json` と固定シェルの `index.html` を両方コミットする。HTML 追加時は `tmp/backfill-articles.mjs` で nav / footer / head meta を同期し、続けて `tmp/generate-manifest.mjs` を実行する。一覧更新差分は原則 `manifest.json` だけに閉じる。

**head meta（OGP / SEO）**  
`tmp/meta-config.mjs` を正とし、`tmp/backfill-articles.mjs` が `index.html` と各 `articles/*.html` の `<!-- zukai-head-meta -->` ブロックを生成する。入力は `<title>`・hero の `p.lead`・`zukai:published`。共通 OG 画像は `assets/og-default.png`（1200×630）。検証は `tmp/verify-meta.mjs`。

**v1 スコープ**  
初回公開: `index.html`、`assets/site-chrome.css`、既存9図解の backfill（`zukai:published` / nav / footer）、生成スクリプト、`manifest.json`、README、GitHub Pages 有効化。zukai-creator 記事の図解・404・カスタムドメインは v1 外。OGP 基本セットと共通 OG 画像は v1 以降で追加済み。記事別 OG 画像は未対応。

**元記事 URL**  
`articles/` 内の `source-note` URL をそのまま正とする。Hatena 側で `dvent-calendar` が canonical になっている記事は、動作する URL を維持する。
