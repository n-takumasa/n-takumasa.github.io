---
draft: false
date: 2023-04-20T10:24:58+09:00
title: "ここのつくりかた"
description: "Hugo + GitHub Pages"
tags: ["Hugo", "GitHub Pages"]
---

* [Quick Start | Hugo](https://gohugo.io/getting-started/quick-start/)
* `winget install Hugo.Hugo.Extended`
* GitHub でリポジトリを作る
* `gh repo clone n-takumasa/n-takumasa.github.io`
* `hugo new site n-takumasa.github.io --force`
* `cd n-takumasa.github.io`
* `git submodule add https://github.com/luizdepra/hugo-coder.git themes/hugo-coder`
* `config.toml` を編集する
  * [Configure Hugo | Hugo](https://gohugo.io/getting-started/configuration/)
  * [hugo-coder / minimal configuration](https://github.com/luizdepra/hugo-coder/blob/main/docs/configurations.md#complete-example)
  * [hugo-coder / exampleSite / config.toml](https://github.com/luizdepra/hugo-coder/blob/master/exampleSite/config.toml)
* `archetypes/default.md` と `archtypes/posts.md` を編集する
  * GitHub で front matter をきれいに表示したいなら yaml
  * [Front Matter | Hugo](https://gohugo.io/content-management/front-matter/)
* `hugo server`
* `hugo new about.md`
* `.gitignore` を作成する
* `.nojekyll` を作成する
* `.github/workflows/gh-pages.yml` を作成する
