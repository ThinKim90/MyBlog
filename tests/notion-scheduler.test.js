const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const scheduler = import('../netlify/functions/poll-notion-publication.mjs');
const cmsConfig = require('../notion-cms.config.json');
const token = 'test-only-action-token';
const notionToken = 'test-only-notion-token';
const id = 'e7f189ab-42e8-46ba-828a-b9f5720b56cf';
const first = '2026-11-13T01:00:00.000Z';
const second = '2026-11-13T02:00:00.000Z';
const workflowURL = 'https://api.github.com/repos/ThinKim90/MyBlog/actions/workflows/notion-publish.yml';
const manifestURL = 'https://api.github.com/repos/ThinKim90/MyBlog/contents/notion-content/manifest.json?ref=main';

function harness() {
  const state = {
    manifest: { version: 1, dataSourceId: cmsConfig.dataSourceId, pages: { [id]: { published: true, requestedAt: first } } },
    pages: [{ id, properties: { Status: { select: { name: 'Published' } }, [cmsConfig.requestProperty]: { date: { start: second } } } }],
    calls: [], active: null, dispatchStatus: 204, missing: { in_trash: true },
  };
  const fetchImpl = async (url, options) => {
    state.calls.push({ url, options });
    if (url === manifestURL) return state.manifestResponse?.() || Response.json(state.manifest);
    if (url.startsWith('https://api.notion.com/v1/')) {
      assert.equal(options.headers.Authorization, 'Bearer ' + notionToken);
      assert.ok(!JSON.stringify(options).includes(token));
      assert.ok(!url.includes('/markdown'));
      if (url.endsWith('/query')) return state.notionResponse?.() || Response.json({ results: state.pages, has_more: false });
      if (state.missing === 404) return new Response('private detail', { status: 404 });
      return Response.json(state.missing);
    }
    assert.ok(url.startsWith(workflowURL + '/'));
    assert.equal(options.headers.Authorization, 'Bearer ' + token);
    assert.ok(!JSON.stringify(options).includes(notionToken));
    if (options.method === 'POST') return new Response(null, { status: state.dispatchStatus });
    if (state.jobResponse) return state.jobResponse();
    const status = new URL(url).searchParams.get('status');
    return Response.json({ workflow_runs: status === state.active ? [{ id: 1 }] : [] });
  };
  return { state, fetchImpl, run: async () => (await scheduler).triggerNotionPublication({ token, notionToken, fetchImpl }) };
}

test('only new requests dispatch the main publisher; credentials stay on their own API hosts', async () => {
  const h = harness();
  assert.deepEqual(await h.run(), { status: 'requested' });
  assert.deepEqual((await scheduler).config, { schedule: '*/5 * * * *' });
  assert.equal(h.state.calls.length, 5);
  const manifest = h.state.calls[0];
  assert.equal(manifest.url, manifestURL);
  assert.equal(manifest.options.headers.Authorization, undefined);
  assert.equal(manifest.options.cache, 'no-store');
  assert.match(h.state.calls[2].url, /branch=main&status=queued/);
  assert.match(h.state.calls[3].url, /branch=main&status=in_progress/);
  const dispatch = h.state.calls[4];
  assert.equal(dispatch.url, workflowURL + '/dispatches');
  assert.deepEqual(JSON.parse(dispatch.options.body), { ref: 'main', inputs: { source: 'netlify-schedule' } });
  for (const { options } of h.state.calls) {
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
  }
});

test('unchanged or older requests and unpublished edits create no Actions requests', async () => {
  for (const timestamp of [first, '2026-11-13T00:00:00Z', null]) {
    const h = harness();
    h.state.pages[0].last_edited_time = second;
    h.state.pages[0].properties[cmsConfig.requestProperty].date = timestamp ? { start: timestamp } : null;
    assert.deepEqual(await h.run(), { status: 'no_changes' });
    assert.equal(h.state.calls.length, 2);
  }
});

test('new drafts and Published without a request do not dispatch; first requests do', async () => {
  for (const status of ['Draft', 'Published']) {
    const h = harness();
    h.state.manifest.pages = {};
    h.state.pages[0].properties.Status.select.name = status;
    h.state.pages[0].properties[cmsConfig.requestProperty].date = status === 'Draft' ? { start: second } : null;
    assert.deepEqual(await h.run(), { status: 'no_changes' });
    assert.equal(h.state.calls.length, 2);
  }
  const h = harness();
  h.state.manifest.pages = {};
  assert.deepEqual(await h.run(), { status: 'requested' });
});

test('the latest main manifest prevents duplicate dispatch while a deployment lags behind', async () => {
  const h = harness();
  assert.equal((await h.run()).status, 'requested');
  h.state.manifest.pages[id].requestedAt = second;
  h.state.calls.length = 0;
  assert.deepEqual(await h.run(), { status: 'no_changes' });
  assert.equal(h.state.calls.length, 2);
});

test('Draft unpublishing and confirmed trash, archive, or database moves still dispatch', async () => {
  const draft = harness();
  draft.state.pages[0].properties.Status.select.name = 'Draft';
  assert.equal((await draft.run()).status, 'requested');
  for (const missing of [{ in_trash: true }, { archived: true }, { parent: { data_source_id: id } }]) {
    const h = harness();
    h.state.pages = [];
    h.state.missing = missing;
    assert.equal((await h.run()).status, 'requested');
    assert.ok(h.state.calls.some(c => c.url === 'https://api.notion.com/v1/pages/' + id));
  }
});

test('already removed snapshots and stale republish requests do not dispatch', async () => {
  const h = harness();
  h.state.manifest.pages[id].published = false;
  h.state.pages[0].properties[cmsConfig.requestProperty].date.start = first;
  assert.equal((await h.run()).status, 'no_changes');
  h.state.pages = [];
  assert.equal((await h.run()).status, 'no_changes');
});

test('missing-page permission errors or unconfirmed removal never dispatch', async () => {
  for (const missing of [404, { parent: { data_source_id: cmsConfig.dataSourceId } }]) {
    const h = harness();
    h.state.pages = [];
    h.state.missing = missing;
    await assert.rejects(h.run(), /404|일치하지/);
    assert.ok(!h.state.calls.some(c => c.url.startsWith(workflowURL)));
  }
});

test('queued or running publications are not dispatched again', async () => {
  for (const active of ['queued', 'in_progress']) {
    const h = harness();
    h.state.active = active;
    assert.deepEqual(await h.run(), { status: 'already_running' });
    assert.ok(!h.state.calls.some(c => c.url.endsWith('/dispatches')));
  }
});

test('missing or malformed credentials make no external request', async () => {
  const { triggerNotionPublication } = await scheduler;
  for (const field of ['token', 'notionToken']) for (const invalid of [undefined, '', ' ', 'token\nextra']) {
    let called = false;
    await assert.rejects(triggerNotionPublication({ token, notionToken, [field]: invalid, fetchImpl: async () => { called = true; } }), /missing or invalid/);
    assert.equal(called, false);
  }
});

test('bad manifests, invalid timestamps, incomplete pagination and Notion failures never dispatch', async () => {
  for (const response of [() => new Response('private detail', { status: 403 }), () => Response.json({}), () => new Response('bad json')]) {
    const h = harness();
    h.state.manifestResponse = response;
    await assert.rejects(h.run());
    assert.ok(!h.state.calls.some(c => c.url.startsWith(workflowURL)));
  }
  for (const response of [() => new Response('private detail', { status: 403 }), () => Response.json({ results: [], has_more: true })]) {
    const h = harness();
    h.state.notionResponse = response;
    await assert.rejects(h.run());
    assert.ok(!h.state.calls.some(c => c.url.startsWith(workflowURL)));
  }
  const h = harness();
  h.state.pages[0].properties[cmsConfig.requestProperty].date.start = '2026-11-13';
  await assert.rejects(h.run(), /시간/);
  assert.ok(!h.state.calls.some(c => c.url.startsWith(workflowURL)));
});

test('failed job checks, dispatch failures and network errors expose no private response or credentials', async () => {
  for (const response of [() => new Response('private failure detail', { status: 403 }), () => Response.json({}), () => new Response('bad json')]) {
    const h = harness();
    h.state.jobResponse = response;
    await assert.rejects(h.run(), error => /GitHub publication/.test(error.message) && !/private|test-only/.test(error.message));
    assert.ok(!h.state.calls.some(c => c.url.endsWith('/dispatches')));
  }
  const h = harness();
  h.state.dispatchStatus = 401;
  await assert.rejects(h.run(), /HTTP 401/);
  h.state.jobResponse = () => { throw new Error(token); };
  await assert.rejects(h.run(), error => /timed out/.test(error.message) && !error.message.includes(token));
});

test('GitHub polling cron and its keep-alive commits are removed', () => {
  const workflow = fs.readFileSync(require.resolve('../.github/workflows/notion-publish.yml'), 'utf8');
  assert.doesNotMatch(workflow, /\bschedule:|\bcron:|--allow-empty/);
  assert.match(workflow, /workflow_dispatch:/);
});
