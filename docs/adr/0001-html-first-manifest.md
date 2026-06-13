# HTML-first manifest generation

`manifest.json` と `index.html` は `articles/*.html` からスクリプトで生成する。manifest を手書きせず、図解 HTML を唯一の入力源にすることで、タイトル・リード・元記事 URL の二重管理を避ける。GitHub Actions は使わず、生成物をリポジトリにコミットして GitHub Pages へそのまま公開する。
