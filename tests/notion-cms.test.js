const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { syncCms, readManifest, listPages, slugFor, publicStatus } = require('../utils/notion-cms');
const { createPages } = require('../gatsby-node');

const id = 'e7f189ab-42e8-46ba-828a-b9f5720b56cf';
const id2 = 'e7f189ab-42e8-46ba-828a-b9f5720b56ce';
const config = { dataSourceId: id, requestProperty: '발행 요청 시각', excludedPageIds: [] };
const firstRequest = '2026-11-13T01:00:00.000Z';
function page(pageId = id, status = 'Published', requestedAt = firstRequest, slug = 'cms-post') {
  return { id: pageId, created_time: firstRequest, last_edited_time: firstRequest, properties: {
    Title: { type: 'title', title: [{ plain_text: 'CMS 글' }] },
    Status: { type: 'select', select: { name: status } },
    Slug: { type: 'rich_text', rich_text: [{ plain_text: slug }] },
    Description: { type: 'rich_text', rich_text: [{ plain_text: '설명' }] },
    Category: { type: 'select', select: { name: 'AI 활용하기' } },
    '발행 요청 시각': { type: 'date', date: requestedAt ? { start: requestedAt } : null },
  } };
}

async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'thin-blog-cms-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const state = { pages: [page()], text: '처음 본문', failPhoto: false, calls: [] };
  const request = async (endpoint, options) => {
    state.calls.push({ endpoint, options });
    if (endpoint.endsWith('/query')) return { results: state.pages, has_more: false };
    if (endpoint.includes('/markdown')) return { markdown: state.text, truncated: false, unknown_block_ids: [] };
    return structuredClone(state.pages.find(p => endpoint.endsWith(p.id)));
  };
  const sync = (mode = 'publish', extra = {}) => syncCms({ root, request, config, mode, ...extra });
  const read = () => fs.readFile(path.join(root, 'notion-content/posts', id, 'index.md'), 'utf8');
  return { root, state, request, sync, read };
}

test('all Notion pages paginate completely; repeated or missing cursors cannot truncate a sync', async () => {
  const requests = [];
  const pages = await listPages(async (_endpoint, options) => {
    requests.push(options);
    return options.body.start_cursor ? { results: [page(id2)], has_more: false } : { results: [page()], has_more: true, next_cursor: 'second' };
  }, id);
  assert.equal(pages.length, 2);
  assert.equal(requests[1].body.start_cursor, 'second');
  assert.equal(requests[0].method, 'POST');
  await assert.rejects(listPages(async () => ({ results: [], has_more: true, next_cursor: null }), id), /끝까지/);
});

test('publication requests create public snapshots; later edits remain private until a new request', async t => {
  const h = await setup(t);
  assert.equal((await h.sync()).changed, true);
  const first = await h.read();
  assert.match(first, /처음 본문/);
  assert.match(first, /category: "AI 활용 - 바이브코딩"/);
  h.state.text = '아직 발행하지 않은 수정';
  h.state.pages[0].last_edited_time = '2026-11-13T02:00:00.000Z';
  assert.equal((await h.sync()).changed, false);
  assert.equal(await h.read(), first);
  h.state.pages[0].properties['발행 요청 시각'].date.start = '2026-11-13T03:00:00.000Z';
  assert.equal((await h.sync()).changed, true);
  assert.match(await h.read(), /아직 발행하지 않은 수정/);
  assert.equal((await readManifest(h.root)).pages[id].slug, '/cms-post/');
});

test('preview sync contains drafts only in the ignored cache and never creates a public snapshot', async t => {
  const h = await setup(t);
  h.state.pages[0] = page(id, 'Draft', null);
  const result = await h.sync('preview');
  assert.equal(result.updated[0].draft, true);
  assert.match(await fs.readFile(path.join(h.root, '.notion-cache/preview/posts', id, 'index.md'), 'utf8'), /draft: true/);
  assert.deepEqual((await readManifest(h.root)).pages, {});
  assert.ok(!(await h.sync()).updated.length);
  assert.deepEqual((await readManifest(h.root)).pages, {});
});

test('Published without a request never publishes, and test pages remain excluded even if requested', async t => {
  const h = await setup(t);
  h.state.pages[0].properties['발행 요청 시각'].date = null;
  await h.sync();
  assert.deepEqual((await readManifest(h.root)).pages, {});
  h.state.pages[0] = page();
  await h.sync('publish', { config: { ...config, excludedPageIds: [id] } });
  assert.deepEqual((await readManifest(h.root)).pages, {});
});

test('Draft removes the public snapshot while retaining its request watermark; stale requests do not republish', async t => {
  const h = await setup(t);
  await h.sync();
  h.state.pages[0].properties.Status.select.name = 'Draft';
  assert.deepEqual((await h.sync()).removed, ['/cms-post/']);
  assert.equal((await readManifest(h.root)).pages[id].published, false);
  await assert.rejects(h.read(), { code: 'ENOENT' });
  h.state.pages[0].properties.Status.select.name = 'Published';
  assert.equal((await h.sync()).changed, false);
  h.state.pages[0].properties['발행 요청 시각'].date.start = '2026-11-13T04:00:00.000Z';
  await h.sync();
  assert.equal((await readManifest(h.root)).pages[id].published, true);
});

test('invalid requests, changed slugs, empty content, unsupported blocks and image failures keep the last public version', async t => {
  const h = await setup(t);
  await h.sync();
  const original = await h.read();
  const manifest = await readManifest(h.root);
  h.state.pages[0].properties['발행 요청 시각'].date.start = '2026-11-13';
  await assert.rejects(h.sync(), /시간/);
  h.state.pages[0].properties['발행 요청 시각'].date.start = '2026-11-13T04:00:00.000Z';
  h.state.pages[0].properties.Slug.rich_text[0].plain_text = 'changed-address';
  await assert.rejects(h.sync(), /Slug는 유지/);
  h.state.pages[0].properties.Slug.rich_text[0].plain_text = 'cms-post';
  for (const body of ['', '<toggle>내용</toggle>', '![사진](https://prod-files-secure.s3.us-west-2.amazonaws.com/test/photo.png)']) {
    h.state.text = body;
    await assert.rejects(h.sync('publish', { fetchImpl: async () => new Response('error', { status: 500 }) }));
    assert.equal(await h.read(), original);
    assert.deepEqual(await readManifest(h.root), manifest);
  }
});

test('duplicate CMS slugs fail the whole batch without writing a partial public set', async t => {
  const h = await setup(t);
  await h.sync();
  const before = await readManifest(h.root);
  h.state.pages.push(page(id2));
  await assert.rejects(h.sync(), /Slug가 중복/);
  assert.deepEqual(await readManifest(h.root), before);
});

test('missing pages require confirmation; 404 permissions errors cannot silently delete published posts', async t => {
  const h = await setup(t);
  await h.sync();
  const before = await h.read();
  const request = async endpoint => {
    if (endpoint.endsWith('/query')) return { results: [], has_more: false };
    throw new Error('Notion HTTP 404');
  };
  await assert.rejects(h.sync('publish', { request }), /404/);
  assert.equal(await h.read(), before);
  const archivedRequest = async endpoint => endpoint.endsWith('/query') ? { results: [], has_more: false } : { archived: true };
  assert.deepEqual((await h.sync('publish', { request: archivedRequest })).removed, ['/cms-post/']);
});

test('stable slugs reject traversal and reserved routes; production status exposes only published routes and hashes', () => {
  for (const slug of ['../escape', 'about', 'foo/../../file', 'https://example.com']) assert.throws(() => slugFor(page(id, 'Published', firstRequest, slug)));
  assert.equal(slugFor(page(id, 'Published', firstRequest, '')), '/notion-e7f189ab/');
  const status = publicStatus({ pages: { [id]: { slug: '/public/', published: true, revision: 'abc', requestedAt: firstRequest }, [id2]: { slug: '/removed/', published: false } } });
  assert.deepEqual(status.posts, [{ slug: '/public/', revision: 'abc' }]);
  assert.ok(!JSON.stringify(status).includes('requestedAt'));
});

test('Gatsby rejects collisions between existing Markdown and imported CMS URLs before creating pages', async () => {
  let count = 0;
  let error;
  await createPages({ graphql: async () => ({ data: { allMarkdownRemark: { nodes: [{ fields: { slug: '/same/' } }, { fields: { slug: '/same/' } }] } } }), actions: { createPage: () => count++ }, reporter: { panicOnBuild: message => { error = message; } } });
  assert.match(error, /주소가 중복/);
  assert.equal(count, 0);
});
