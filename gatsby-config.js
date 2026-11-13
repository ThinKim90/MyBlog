/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
const { isDraftPreview } = require('./utils/publication');
const notionTestContentPath = `${__dirname}/.notion-test/contents`;
const notionContentPath = process.env.BLOG_NOTION_PREVIEW === 'true'
  ? `${__dirname}/.notion-cache/preview/posts`
  : `${__dirname}/notion-content/posts`;
if (process.env.BLOG_NOTION_TEST === 'true' && !require('fs').existsSync(notionTestContentPath)) {
  throw new Error('Notion 테스트 글이 없습니다. npm run notion:sync를 먼저 실행하세요.');
}
if (process.env.BLOG_NOTION_PREVIEW === 'true' && !require('fs').existsSync(notionContentPath)) {
  throw new Error('Notion 작업본이 없습니다. npm run notion:pull을 먼저 실행하세요.');
}

module.exports = {
  siteMetadata: {
    draftPreview: isDraftPreview(),
    title: `Thin Blog`,
    description: `개인 블로그입니다. 다양한 주제들을 다룹니다.`,
    author: `@yourusername`,
    siteUrl: `https://thinblog.netlify.app/`, // 나중에 실제 도메인으로 변경
    contact: {
      email: `ksehg112@gmail.com`,
      github: `https://github.com/ThinKim90`,
      linkedin: `https://www.linkedin.com/in/designerksh/`
    }
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `contents`,
        path: `${__dirname}/contents`,
      },
    },
    ...(process.env.BLOG_NOTION_TEST === 'true' ? [{
      resolve: 'gatsby-source-filesystem',
      options: { name: 'notion-test', path: notionTestContentPath },
    }] : []),
    ...(require('fs').existsSync(notionContentPath) ? [{
      resolve: 'gatsby-source-filesystem',
      options: { name: 'notion-cms', path: notionContentPath },
    }] : []),
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Thin Blog`,
        short_name: `ThinBlog`,
        start_url: `/`,
        background_color: `#f8f6f0`,
        theme_color: `#8b7d6b`,
        display: `minimal-ui`,
        icon: `static/favicon.png`, // 512x512 이상의 PNG 파일 하나만 필요
      },
    },
      {
          resolve: `gatsby-plugin-google-adsense`,
          options: {
              publisherId: `ca-pub-2944637253847543`,
          },
      },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
