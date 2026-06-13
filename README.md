# Algomatic Tech Blog 図解ギャラリー

[Algomatic Tech Blog](https://tech.algomatic.jp/) の記事を [zukai-creator](https://tech.algomatic.jp/entry/advent-calendar/2026-06/zukai-creator) で再構成した**非公式**図解の GitHub Pages 置き場です。

公開 URL（設定後）: `https://53able.github.io/zukai-blog-am/`

## 図解を追加する手順

1. `articles/` に Apple トンマナの図解 HTML（`zukai-*-apple.html`）を追加する  
   - `<head>` に `<meta name="zukai:published" content="YYYY-MM-DD" />`（元記事の公開日）  
   - hero に `p.lead` と `p.source-note`（Algomatic Tech Blog へのリンク）を含める
2. 生成スクリプトを実行する

```bash
node tmp/backfill-articles.mjs
node tmp/generate-manifest.mjs
node tmp/verify-meta.mjs
```

`backfill-articles.mjs` は nav・footer・`site-chrome.css` に加え、`index.html` と各記事の OGP・Twitter Card・canonical・JSON-LD を `<!-- zukai-head-meta -->` ブロックとして同期します。

OG 画像や apple-touch-icon の SVG 原稿を編集した場合は `node tmp/generate-assets.mjs` で PNG を再生成します（macOS の `qlmanage` / `sips` が必要）。

3. `manifest.json` の diff を確認して commit / push する

初回追加時は `backfill-articles.mjs` が nav・footer・`site-chrome.css` リンクを自動挿入します。公開日 meta が既にある場合はその値を優先します。

## GitHub Pages の有効化

1. GitHub で `53able/zukai-blog-am` リポジトリを作成する
2. **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **`main`** / **`/ (root)`**
3. push 後、数分待って `https://53able.github.io/zukai-blog-am/` を開く

## ディレクトリ

```text
index.html              図解一覧（固定シェル）
manifest.json           図解メタデータ（生成物）
assets/site-chrome.css  共通 nav / footer / 一覧スタイル
assets/favicon.svg      サイト favicon（図解ノードマーク）
assets/apple-touch-icon.svg
assets/apple-touch-icon.png
assets/og-default.png   OGP / Twitter Card 既定画像（1200x630）
assets/og-default.svg   OG 画像の SVG 原稿（1200x630）
articles/*.html         図解本体（各 HTML はスタイル自己完結 + chrome リンク）
DESIGN-apple.md         トンマナ定義
CONTEXT.md              用語・設計合意
```

## ライセンス / 表記

図解構成は Go (@53able) による非公式再構成です。元記事の著作権は Algomatic Tech Blog の各著者に帰属します。
