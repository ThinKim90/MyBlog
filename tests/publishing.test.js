const assert = require('node:assert/strict');
const { test } = require('node:test');
const { isDraft, isDraftPreview, allowedDraftStates } = require('../utils/publication');
const { createPages, onCreatePage } = require('../gatsby-node');

test('existing posts remain published; invalid draft values cannot silently publish', () => {
  assert.equal(isDraft({}), false);
  assert.equal(isDraft({ draft: false }), false);
  assert.equal(isDraft({ draft: true }), true);
  assert.throws(() => isDraft({ draft: 'true' }), /draft/);
  assert.throws(() => isDraft({ draft: 'false' }), /draft/);
});

test('preview is explicit and cannot enable drafts in production', () => {
  assert.equal(isDraftPreview({ NODE_ENV: 'development' }), false);
  assert.deepEqual(allowedDraftStates({ NODE_ENV: 'development', BLOG_PREVIEW_DRAFTS: 'true' }), [false, true]);
  assert.deepEqual(allowedDraftStates({ NODE_ENV: 'production', BLOG_PREVIEW_DRAFTS: 'true' }), [false]);
  assert.deepEqual(allowedDraftStates({ BLOG_PREVIEW_DRAFTS: 'true' }), [false]);
});

test('draft detail pages, redirects, navigation and listing pages use the same policy across modes', async () => {
  const originalEnv = { NODE_ENV: process.env.NODE_ENV, BLOG_PREVIEW_DRAFTS: process.env.BLOG_PREVIEW_DRAFTS };
  const posts = [false, true, false].map((draft, index) => ({
    id: `post-${index}`,
    fields: {
      isDraft: draft,
      slug: `/post-${index}/`,
      slugNoTrailingSlash: `/post-${index}`,
      analyticsKey: `post-${index}`,
      redirects: [`/old-${index}/`],
    },
  }));

  try {
    for (const [mode, preview, expectedIds] of [
      ['development', 'true', ['post-0', 'post-1', 'post-2']],
      ['production', 'true', ['post-0', 'post-2']],
      ['development', 'false', ['post-0', 'post-2']],
    ]) {
      process.env.NODE_ENV = mode;
      process.env.BLOG_PREVIEW_DRAFTS = preview;
      const pages = [];
      const redirects = [];
      const actions = { createPage: page => pages.push(page), createRedirect: redirect => redirects.push(redirect) };
      await createPages({
        graphql: async (query, variables) => {
          assert.match(query, /filter: \{ fields: \{ isDraft: \{ in: \$allowedDraftStates/);
          assert.deepEqual(variables.allowedDraftStates, allowedDraftStates());
          return { data: { allMarkdownRemark: { nodes: posts.filter(post => variables.allowedDraftStates.includes(post.fields.isDraft)) } } };
        },
        actions,
        reporter: { panicOnBuild: message => assert.fail(message) },
      });
      assert.deepEqual(pages.map(page => page.context.id), expectedIds);
      assert.equal(pages[0].context.previousPostId, null);
      assert.equal(pages[0].context.nextPostId, expectedIds[1]);
      assert.equal(pages.at(-1).context.previousPostId, expectedIds.at(-2));
      assert.equal(pages.at(-1).context.nextPostId, null);
      assert.equal(redirects.some(redirect => redirect.fromPath === '/old-1/'), expectedIds.includes('post-1'));

      for (const pagePath of ['/', '/playground/', '/playground']) {
        let page;
        onCreatePage({ page: { path: pagePath, context: { draftPreview: !isDraftPreview(), existing: 'kept' } }, actions: { createPage: next => { page = next; } } });
        assert.deepEqual(page.context.allowedDraftStates, allowedDraftStates());
        assert.equal(page.context.existing, 'kept');
        onCreatePage({ page, actions: { createPage: () => assert.fail('onCreatePage must not recurse') } });
      }
    }
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
