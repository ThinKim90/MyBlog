# Thin Blog 글 작성과 발행

Notion CMS 단일 글 검증은 [Notion 테스트 가이드](docs/notion-cms-test.md)를 참고하세요.
운영 글 작성과 자동 배포는 [Notion CMS 사용법](docs/notion-cms.md)을 참고하세요.

글은 `contents/`의 Markdown 파일에서 수정합니다. 파일 상단에 다음처럼
`draft: true`를 넣으면 초안이 됩니다. `draft`를 생략하거나 `false`로 바꾸면 발행 대상입니다.
값에는 따옴표를 붙이지 마세요.

```yaml
---
title: "새 글 제목"
date: "2026-11-13"
description: "글 소개"
category: "회고"
draft: true
---
```

## 로컬에서 초안 확인하기

기존 개발 서버를 실행 중이라면 Ctrl+C로 종료한 뒤 실행하세요.

```sh
npm run develop:preview
```

`http://127.0.0.1:8000/`에서 발행된 글과 초안을 함께 볼 수 있습니다.
상단에는 ‘초안 미리보기’, 초안 목록과 본문에는 ‘초안 · 미발행’ 표시가 나옵니다.
Markdown을 수정하고 저장하면 화면에 반영됩니다. `draft` 상태 변경도 반영되며,
초안에서는 댓글과 조회수를 표시하지 않습니다.

## 발행 화면 확인과 배포

```sh
npm run develop
```

일반 개발 모드는 초안을 목록·카테고리·이전/다음 글에서 제외하고 상세 페이지도 만들지 않습니다.
모드를 바꿀 때는 서버를 종료하고 해당 명령으로 다시 실행하세요.

발행하려면 글을 완성하고 `draft: false`로 바꾼 뒤 기존 배포 절차를 진행합니다.
`npm run build`는 미리보기 환경 변수가 설정돼 있어도 항상 초안을 제외합니다.
미리보기는 로컬 개발 전용이며 운영 사이트에서 URL이나 버튼으로 켤 수 없습니다.
이 기능은 빌드 결과의 발행을 제어하며, Git 저장소에 저장한 원문을 비공개로 만들지는 않습니다.

발행 제어 회귀 검사는 `npm run test:publishing`으로 실행합니다.

## 조회수 집계와 표시

GoatCounter 집계를 유지하면서 저장된 숫자를 먼저 표시하고, 15분 이상 지난 글의 숫자만
백그라운드에서 갱신합니다. 브라우저에서 중복 요청을 공유하고, 서버는 정상 응답을
15분 캐시합니다. 외부 요청은 건당 1초, 한 번의 목록 조회는 총 2.5초로 제한합니다.
오류가 나면 마지막으로 받은 숫자를 유지하고, 확인한 적 없는 숫자는 `—`로 표시합니다.

발행된 글을 처음 열면 방문 당시 숫자에 1을 더해 즉시 보여줍니다. 같은 브라우저에서는
localStorage로 8시간 동안 중복 증가를 막아 새로고침·재방문·새 탭에서도 다시 더하지 않습니다.
예를 들어 100을 보고 들어왔으면 101을 표시하고, 서버가 101이나 105를 반환하면 각각
101이나 105를 표시합니다. 임시 증가분을 실제 집계값에 영구적으로 더하지 않습니다.

이 표시는 추정값입니다. GoatCounter는 IP·User-Agent를 이용한 자체 세션 판별을 사용하므로
브라우저별 중복 방지와 정확히 일치하지 않으며, 공개 카운터도 최대 4시간 캐시됩니다.
방문 전 기준값이 없으면 우선 1을 표시하고, 첫 집계 응답이 도착하면 그 값을 우선합니다.
공개 카운터로 내 방문이 포함됐는지를 직접 확인할 수 없어 일시적인 1회 차이는 날 수 있습니다.
`count_unique`는 `count`와 같은 값이라 별도의 ‘고유 방문자’ 수치로 표시하지 않습니다.

로컬 개발에서는 GoatCounter에 방문을 전송하지 않으며, 기본 `gatsby develop`에서
제공되지 않는 Netlify Function을 호출하지 않습니다. 저장된 값과 옵티미스틱 표시를
확인할 수 있고, 초안은 임시 증가에서도 제외합니다. 함수 연동은 `netlify dev`와
`GATSBY_VIEWCOUNT_DEV_API=true`를 사용해 확인할 수 있습니다.
회귀 검사는 `npm run test:views`로 실행합니다.

---

<!-- AUTO-GENERATED-CONTENT:START (STARTER) -->
<p align="center">
  <a href="https://www.gatsbyjs.com">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby's default starter
</h1>

Kick off your project with this default boilerplate. This starter ships with the main Gatsby configuration files you might need to get up and running blazing fast with the blazing fast app generator for React.

_Have another more specific idea? You may want to check out our vibrant collection of [official and community-created starters](https://www.gatsbyjs.com/docs/gatsby-starters/)._

## 🚀 Quick start

1.  **Create a Gatsby site.**

    Use the Gatsby CLI ([install instructions](https://www.gatsbyjs.com/docs/tutorial/getting-started/part-0/#gatsby-cli)) to create a new site, specifying the default starter.

    ```shell
    # create a new Gatsby site using the default starter
    gatsby new my-default-starter https://github.com/gatsbyjs/gatsby-starter-default
    ```

1.  **Start developing.**

    Navigate into your new site’s directory and start it up.

    ```shell
    cd my-default-starter/
    gatsby develop
    ```

1.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:8000`!

    Note: You'll also see a second link: `http://localhost:8000/___graphql`. This is a tool you can use to experiment with querying your data. Learn more about using this tool in the [Gatsby Tutorial](https://www.gatsbyjs.com/docs/tutorial/getting-started/part-4/#use-graphiql-to-explore-the-data-layer-and-write-graphql-queries).

    Open the `my-default-starter` directory in your code editor of choice and edit `src/pages/index.js`. Save your changes and the browser will update in real time!

## 🚀 Quick start (Netlify)

Deploy this starter with one click on [Netlify](https://app.netlify.com/signup):

[<img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" />](https://app.netlify.com/start/deploy?repository=https://github.com/gatsbyjs/gatsby-starter-default)

## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in a typical Gatsby project.

    .
    ├── node_modules
    ├── src
    ├── .gitignore
    ├── gatsby-browser.js
    ├── gatsby-config.js
    ├── gatsby-node.js
    ├── gatsby-ssr.js
    ├── LICENSE
    ├── package.json
    └── README.md

1.  **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

1.  **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser) such as your site header or a page template. `src` is a convention for “source code”.

1.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

1.  **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.

1.  **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/) for more detail).

1.  **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.

1.  **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

1.  **`LICENSE`**: This Gatsby starter is licensed under the 0BSD license. This means that you can see this file as a placeholder and replace it with your own license.

1.  **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

1.  **`README.md`**: A text file containing useful reference information about your project.

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.com/). Here are some places to start:

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.com/docs/tutorial/getting-started/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.com/docs/).** In particular, check out the _Guides_, _API Reference_, and _Advanced Tutorials_ sections in the sidebar.

## 💫 Deploy

[Build, Deploy, and Host On Netlify](https://netlify.com)

The fastest way to combine your favorite tools and APIs to build the fastest sites, stores, and apps for the web. And also the best place to build, deploy, and host your Gatsby sites.

<!-- AUTO-GENERATED-CONTENT:END -->
