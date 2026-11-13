const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { pageIdFrom, metadataFrom, createNotionClient, normaliseMarkdown, downloadImage, syncTestPage } = require('../utils/notion-test-sync');

const id = 'e7f189ab-42e8-46ba-828a-b9f5720b56cf';
const photoURL = 'https://prod-files-secure.s3.us-west-2.amazonaws.com/test/photo.png?signature=private';
const makePage = (draft = true) => ({
  id,
  created_time: '2026-11-13T00:00:00.000Z',
  last_edited_time: '2026-11-13T01:00:00.000Z',
  properties: {
    제목: { type: 'title', title: [{ plain_text: '노션 CMS 테스트' }] },
    초안: { type: 'checkbox', checkbox: draft },
  },
});

async function harness(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'thin-blog-notion-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const state = {
    page: makePage(),
    markdown: `사진 확인 전 문장\n\n![사진 설명](${photoURL})`,
    image: await fs.readFile(path.join(__dirname, '../static/favicon.png')),
    calls: [],
    imageError: false,
  };
  const request = async endpoint => {
    if (endpoint.includes('/markdown')) return { markdown: state.markdown, truncated: false, unknown_block_ids: [] };
    return structuredClone(state.page);
  };
  const fetchImpl = async (url, options) => {
    state.calls.push({ url, options });
    return state.imageError ? new Response('failed', { status: 500 }) : new Response(state.image, { headers: { 'content-type': 'image/png' } });
  };
  const sync = () => syncTestPage({ request, pageId: id, outputRoot: root, fetchImpl });
  const read = () => fs.readFile(path.join(root, 'contents/notion-cms-test.md'), 'utf8');
  return { root, state, request, fetchImpl, sync, read };
}

test('accepts a Notion page URL or UUID without mistaking URL query parameters for its page ID', () => {
  assert.equal(pageIdFrom(id), id);
  assert.equal(pageIdFrom(`https://www.notion.so/테스트-${id.replace(/-/g, '')}?v=ignored`), id);
  assert.equal(pageIdFrom(`https://app.notion.com/p/${id.replace(/-/g, '')}?pvs=204`), id);
  assert.throws(() => pageIdFrom('not-a-page-id'), /NOTION_TEST_PAGE_ID/);
  assert.throws(() => pageIdFrom(`https://example.com/${id}`), /Notion/);
});

test('existing CMS Status and Date fields work without changing the Notion database schema', () => {
  const page = makePage();
  delete page.properties.초안;
  delete page.created_time;
  page.properties.Date = { type: 'date', date: { start: '2026-11-13' } };
  page.properties.Status = { type: 'select', select: { name: 'Published' } };
  assert.deepEqual(metadataFrom(page), { title: '노션 CMS 테스트', date: '2026-11-13', draft: false });
  page.properties.Status.select.name = 'Draft';
  assert.equal(metadataFrom(page).draft, true);
  page.properties.Status.select.name = 'Unrecognised';
  assert.equal(metadataFrom(page).draft, true);
  page.properties.Status.select.name = 'Published';
  page.properties.초안 = { type: 'checkbox', checkbox: true };
  assert.throws(() => metadataFrom(page), /서로 다릅니다/);
});

test('real connector response format resolves stable uploaded-file references without inventing page metadata', () => {
  const { connectorSnapshot } = require('../utils/notion-connector-snapshot');
  const reference = `notion-file-block://${id}/photo?space_id=${id}&name=test.png`;
  const snapshot = {
    id,
    title: 'Notion 테스트',
    text: `<page>\n<properties>\n${JSON.stringify({ Title: 'Notion 테스트', Status: 'Draft', 'date:Date:start': '2026-11-13' })}\n</properties>\n<content>\n수정한 문장\n\n<image source="${reference}" />\n</content>\n</page>`,
    page_last_edited_at: '2026-11-13T01:00:00.000Z',
    metadata: { references: { [reference]: photoURL } },
  };
  const converted = connectorSnapshot(snapshot);
  assert.equal(converted.page.last_edited_time, snapshot.page_last_edited_at);
  assert.equal(metadataFrom(converted.page).draft, true);
  assert.ok(converted.markdown.includes(photoURL));
  assert.ok(!converted.markdown.includes('notion-file-block://'));
  assert.throws(() => connectorSnapshot({ ...snapshot, truncated: true }), /읽지 못한/);
  assert.throws(() => connectorSnapshot({ ...snapshot, metadata: {} }), /다운로드 URL/);
});

test('missing draft is always a draft; invalid and contradictory fields fail visibly', () => {
  const page = makePage();
  delete page.properties.초안;
  assert.equal(metadataFrom(page).draft, true);
  page.properties.Draft = { type: 'checkbox', checkbox: false };
  assert.equal(metadataFrom(page).draft, false);
  page.properties.초안 = { type: 'checkbox', checkbox: true };
  assert.throws(() => metadataFrom(page), /서로 다릅니다/);
  delete page.properties.초안;
  page.properties.Draft = { type: 'rich_text', rich_text: [] };
  assert.throws(() => metadataFrom(page), /체크박스/);
  assert.equal(metadataFrom({ ...makePage(false), archived: true }).draft, true);
});

test('downloads uploaded photos without an API credential and replaces temporary URLs with local files', async t => {
  const h = await harness(t);
  const report = await h.sync();
  const content = await h.read();
  assert.equal(report.imageCount, 1);
  assert.equal(report.draft, true);
  assert.match(content, /draft: true/);
  assert.match(content, /!\[사진 설명\]\(\.\/images\/[a-f0-9]{64}\.png\)/);
  assert.doesNotMatch(content, /signature=|amazonaws/);
  assert.equal(h.state.calls[0].options.headers, undefined);
  const filename = content.match(/\.\/images\/([a-f0-9]+\.png)/)[1];
  assert.deepEqual(await fs.readFile(path.join(h.root, 'contents/images', filename)), h.state.image);
});

test('text and photo edits update the same slug; repeat sync with renewed signed URL is stable', async t => {
  const h = await harness(t);
  await h.sync();
  const oldContent = await h.read();
  h.state.page.properties.제목.title[0].plain_text = '바뀐 제목';
  h.state.markdown = h.state.markdown.replace('사진 확인 전 문장', '수정 반영 확인 문장');
  // 다른 실제 이미지로 교체합니다.
  h.state.image = await fs.readFile(path.join(__dirname, '../static/images/layout-essentials-book.png'));
  assert.equal((await h.sync()).changed, true);
  const content = await h.read();
  assert.match(content, /바뀐 제목/);
  assert.match(content, /수정 반영 확인 문장/);
  assert.match(content, /slug: "\/notion-cms-test\/"/);
  assert.notEqual(content.match(/images\/([a-f0-9]+)/)[1], oldContent.match(/images\/([a-f0-9]+)/)[1]);
  h.state.markdown = h.state.markdown.replace('private', 'renewed');
  assert.equal((await h.sync()).changed, false);
});

test('unchecking and rechecking Notion draft maps to the existing publication policy', async t => {
  const h = await harness(t);
  const { isDraft, allowedDraftStates } = require('../utils/publication');
  h.state.page.properties.초안.checkbox = false;
  const published = await h.sync();
  assert.match(await h.read(), /draft: false/);
  assert.ok(allowedDraftStates({ NODE_ENV: 'production' }).includes(isDraft(published)));
  h.state.page.properties.초안.checkbox = true;
  const draft = await h.sync();
  assert.match(await h.read(), /draft: true/);
  assert.ok(!allowedDraftStates({ NODE_ENV: 'production', BLOG_PREVIEW_DRAFTS: 'true' }).includes(isDraft(draft)));
  assert.ok(allowedDraftStates({ NODE_ENV: 'development', BLOG_PREVIEW_DRAFTS: 'true' }).includes(isDraft(draft)));
});

test('image errors, unsupported blocks and incomplete responses preserve the previous good article', async t => {
  const h = await harness(t);
  await h.sync();
  const original = await h.read();
  h.state.imageError = true;
  await assert.rejects(h.sync(), /사진 다운로드/);
  assert.equal(await h.read(), original);
  h.state.imageError = false;
  h.state.markdown = '<toggle>아직 지원하지 않는 내용</toggle>';
  await assert.rejects(h.sync(), /전용 서식/);
  assert.equal(await h.read(), original);
  await assert.rejects(syncTestPage({ request: async endpoint => endpoint.includes('markdown') ? { truncated: true, markdown: 'partial' } : makePage(), pageId: id, outputRoot: h.root }), /일부를 읽지 못했습니다/);
  assert.equal(await h.read(), original);
});

test('concurrent Notion editing cannot replace the last successful article with mixed revisions', async t => {
  const h = await harness(t);
  await h.sync();
  const original = await h.read();
  let readCount = 0;
  const request = async endpoint => {
    if (endpoint.includes('markdown')) return { markdown: 'new revision', truncated: false };
    return { ...makePage(), last_edited_time: String(readCount++) };
  };
  await assert.rejects(syncTestPage({ request, pageId: id, outputRoot: h.root }), /동기화 중/);
  assert.equal(await h.read(), original);
});

test('image-looking text inside code is untouched; reference photos and Notion XML images are downloaded', async t => {
  const h = await harness(t);
  h.state.markdown = `\`\`\`md\n![코드 속 사진](${photoURL})\n\`\`\`\n\n![실제 사진][photo]\n\n[photo]: ${photoURL}\n\n<image source="${photoURL}">XML 사진</image>`;
  const report = await h.sync();
  const content = await h.read();
  assert.equal(report.imageCount, 2);
  assert.equal(h.state.calls.length, 1);
  assert.match(content, /코드 속 사진/);
  assert.equal((content.match(/\.\/images\//g) || []).length, 2);
  assert.doesNotMatch(content, /\[photo\]:/);
  assert.equal(normaliseMarkdown(`<image source="${photoURL}" />`), `![](<${photoURL}>)`);
  assert.equal(normaliseMarkdown('```html\n<toggle>코드 예시</toggle>\n```'), '```html\n<toggle>코드 예시</toggle>\n```');
});

test('untrusted image hosts, redirects and non-images fail without publishing their response', async () => {
  let called = false;
  await assert.rejects(downloadImage('http://127.0.0.1/secret', async () => { called = true; }), /직접 업로드/);
  assert.equal(called, false);
  await assert.rejects(downloadImage(photoURL, async () => new Response('redirect', { status: 302 })), /사진 다운로드/);
  await assert.rejects(downloadImage(photoURL, async () => new Response('<script>bad</script>')), /사진 다운로드/);
});

test('Notion Markdown v2 inline emphasis in links and quotes preserves ordinary article formatting', async t => {
  const h = await harness(t);
  h.state.markdown = '[<b>Decap CMS</b>](https://www.netlify.com/integrations/decap/)\n\n> 다음번엔 <b>작은 성공</b>부터\n\n<i>기울임</i> <s>취소선</s> <u>밑줄</u>\n\n```html\n<b>코드 예시</b>\n```';
  await h.sync();
  assert.ok((await h.read()).includes(h.state.markdown));
  assert.throws(() => normaliseMarkdown('<b onclick="run()">지원하지 않는 속성</b>'), /전용 서식/);
  assert.throws(() => normaliseMarkdown('<span color="red">색상</span>'), /전용 서식/);
});

test('credentials, permissions and retry failures are distinguishable without exposing secret values', async () => {
  for (const [status, reason] of [[401, /키/], [403, /권한/], [404, /접근 권한/]]) {
    const request = createNotionClient({ token: 'secret-key', fetchImpl: async () => new Response('secret response', { status }) });
    await assert.rejects(request(`/pages/${id}`), error => reason.test(error.message) && !/secret/.test(error.message));
  }
  let calls = 0;
  const sleeps = [];
  const request = createNotionClient({ token: 'test-only', sleep: async ms => sleeps.push(ms), fetchImpl: async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer test-only');
    calls++;
    return calls < 3 ? new Response('temporary HTML error', { status: 503 }) : Response.json({ ok: true });
  } });
  assert.deepEqual(await request(`/pages/${id}`), { ok: true });
  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [1000, 1000]);
});

test('normal Gatsby config never imports test content', () => {
  const original = process.env.BLOG_NOTION_TEST;
  try {
    delete process.env.BLOG_NOTION_TEST;
    delete require.cache[require.resolve('../gatsby-config')];
    const config = require('../gatsby-config');
    assert.ok(!config.plugins.some(plugin => plugin.options?.name === 'notion-test'));
  } finally {
    if (original === undefined) delete process.env.BLOG_NOTION_TEST;
    else process.env.BLOG_NOTION_TEST = original;
    delete require.cache[require.resolve('../gatsby-config')];
  }
});
