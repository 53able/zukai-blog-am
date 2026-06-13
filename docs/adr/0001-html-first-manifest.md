# HTML-first runtime manifest rendering

`manifest.json` は `articles/*.html` からスクリプトで生成する。`index.html` は固定シェルとしてコミットし、runtime に `manifest.json` を読み込んで一覧を描画する。manifest を手書きせず、図解 HTML を唯一の入力源にすることで、タイトル・リード・元記事 URL の二重管理を避ける。GitHub Actions は使わず、生成物をリポジトリにコミットして GitHub Pages へそのまま公開する。
