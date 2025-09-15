/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Thin Blog`,
    description: `개인 블로그입니다. 다양한 주제들을 다룹니다.`,
    author: `@yourusername`,
    siteUrl: `https://thinblog.netlify.app/`, // 나중에 실제 도메인으로 변경
    contact: {
      email: `ksehg112@gmail.com`,
      github: `https://github.com/kimsaehyoung`,
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
      {
        resolve: `gatsby-plugin-google-gtag`,
        options: {
          // Google Analytics 4 측정 ID를 여기에 입력하세요
          trackingIds: [
            "G-VRP0Q2EFL6", // 실제 GA4 측정 ID
          ],
          // 페이지뷰 자동 추적 활성화
          gtagConfig: {
            anonymize_ip: true,
            cookie_expires: 0,
          },
          // 개발 환경에서도 추적 (선택사항)
          pluginConfig: {
            head: true,
            respectDNT: true,
          },
        },
      },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};