/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: <https://www.gatsbyjs.com/docs/node-apis/>
 */

// You can delete this file if you're not using it

const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');
const {
  canonicalise,
  stripTrailingSlash,
  toAnalyticsKey,
  normaliseExplicitSlug,
  normaliseLegacyPath,
} = require('./utils/path-helpers');

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type MarkdownRemarkFields {
      slug: String!
      slugNoTrailingSlash: String!
      analyticsKey: String!
      redirects: [String!]!
    }

    type MarkdownRemarkFrontmatter {
      slug: String
      aliases: [String]
      redirect_from: [String]
      redirectFrom: [String]
      oldSlugs: [String]
    }
  `);
};

// Setup Import Alias
exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
  const output = getConfig().output || {};

  actions.setWebpackConfig({
    output,
    resolve: {
      alias: {
        components: path.resolve(__dirname, 'src/components'),
        utils: path.resolve(__dirname, 'src/utils'),
        hooks: path.resolve(__dirname, 'src/hooks'),
      },
    },
  });
};

// Create blog post pages dynamically
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage, createRedirect } = actions;

  // Define a template for blog post
  const blogPostTemplate = path.resolve(`./src/templates/blog-post.tsx`);

  // Get all markdown blog posts sorted by date
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { frontmatter: { date: ASC } }
          limit: 1000
        ) {
          nodes {
            id
            fields {
              slug
              slugNoTrailingSlash
              analyticsKey
              redirects
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    );
    return;
  }

  const posts = result.data.allMarkdownRemark.nodes;

  // Create blog posts pages
  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id;
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id;

      const { slug, slugNoTrailingSlash, analyticsKey, redirects = [] } = post.fields;

      createPage({
        path: slug,
        component: blogPostTemplate,
        context: {
          id: post.id,
          slug,
          slugNoTrailingSlash,
          analyticsKey,
          previousPostId,
          nextPostId,
        },
      });

      redirects
        .filter((fromPath) => fromPath && fromPath !== slug)
        .forEach((fromPath) => {
          createRedirect({
            fromPath,
            toPath: slug,
            isPermanent: true,
            redirectInBrowser: true,
          });
        });
    });
  }
};

// Add slug field to each blog post
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const filePath = createFilePath({ node, getNode, basePath: 'contents', trailingSlash: true });
    const fileSlug = canonicalise(filePath);

    const frontmatterSlugRaw = node.frontmatter?.slug;
    const explicitSlug = frontmatterSlugRaw ? normaliseExplicitSlug(frontmatterSlugRaw) : null;
    const canonicalSlug = explicitSlug || fileSlug;

    const redirectSet = new Set();
    if (fileSlug && fileSlug !== canonicalSlug) {
      redirectSet.add(fileSlug);
    }

    const aliasFields = [
      node.frontmatter?.aliases,
      node.frontmatter?.redirect_from,
      node.frontmatter?.redirectFrom,
      node.frontmatter?.oldSlugs,
    ];

    aliasFields
      .flat()
      .filter(Boolean)
      .forEach((value) => {
        const normalised = normaliseLegacyPath(value);
        if (normalised && normalised !== canonicalSlug) {
          redirectSet.add(normalised);
        }
      });

    createNodeField({
      name: 'slug',
      node,
      value: canonicalSlug,
    });

    createNodeField({
      name: 'slugNoTrailingSlash',
      node,
      value: stripTrailingSlash(canonicalSlug),
    });

    createNodeField({
      name: 'analyticsKey',
      node,
      value: toAnalyticsKey(canonicalSlug),
    });

    createNodeField({
      name: 'redirects',
      node,
      value: Array.from(redirectSet),
    });
  }
};
