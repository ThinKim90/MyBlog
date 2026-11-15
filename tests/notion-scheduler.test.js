const { test } = require('node:test');
const assert = require('node:assert/strict');

const scheduler = import('../netlify/functions/poll-notion-publication.mjs');
const token = 'test-only-action-token';

test('Netlify scheduler dispatches only the configured main-branch publisher after checking active jobs', async () => {
  const { triggerNotionPublication, config } = await scheduler;
  const calls = [];
  const result = await triggerNotionPublication({ token, fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return options.method === 'POST' ? new Response(null, { status: 204 }) : Response.json({ workflow_runs: [] });
  } });
  assert.deepEqual(config, { schedule: '*/5 * * * *' });
  assert.deepEqual(result, { status: 'requested' });
  assert.equal(calls.length, 3);
  for (const { url, options } of calls) {
    assert.ok(url.startsWith('https://api.github.com/repos/ThinKim90/MyBlog/actions/workflows/notion-publish.yml/'));
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.match(calls[0].url, /branch=main&status=queued/);
  assert.match(calls[1].url, /branch=main&status=in_progress/);
  assert.equal(calls[2].url.endsWith('/dispatches'), true);
  assert.deepEqual(JSON.parse(calls[2].options.body), { ref: 'main', inputs: { source: 'netlify-schedule' } });
});

test('queued or running publications are not dispatched again', async () => {
  const { triggerNotionPublication } = await scheduler;
  for (const active of ['queued', 'in_progress']) {
    let posts = 0;
    const result = await triggerNotionPublication({ token, fetchImpl: async (url, options) => {
      if (options.method === 'POST') posts++;
      const status = new URL(url).searchParams.get('status');
      return Response.json({ workflow_runs: status === active ? [{ id: 1 }] : [] });
    } });
    assert.equal(posts, 0);
    assert.deepEqual(result, { status: 'already_running' });
  }
});

test('missing or malformed credentials make no external request', async () => {
  const { triggerNotionPublication } = await scheduler;
  for (const invalid of [undefined, '', ' ', 'token\nextra']) {
    let called = false;
    await assert.rejects(triggerNotionPublication({ token: invalid, fetchImpl: async () => { called = true; } }), /missing or invalid/);
    assert.equal(called, false);
  }
});

test('failed or incomplete job checks fail closed without dispatch or exposing response data', async () => {
  const { triggerNotionPublication } = await scheduler;
  for (const response of [() => new Response('private failure detail', { status: 403 }), () => Response.json({}), () => new Response('bad json')]) {
    let posts = 0;
    await assert.rejects(triggerNotionPublication({ token, fetchImpl: async (_url, options) => {
      if (options.method === 'POST') posts++;
      return response();
    } }), error => /GitHub publication/.test(error.message) && !/private|test-only/.test(error.message));
    assert.equal(posts, 0);
  }
});

test('dispatch failures and network errors remain visible without echoing credentials', async () => {
  const { triggerNotionPublication } = await scheduler;
  await assert.rejects(triggerNotionPublication({ token, fetchImpl: async (_url, options) => options.method === 'POST'
    ? new Response('private detail', { status: 401 }) : Response.json({ workflow_runs: [] }) }), /HTTP 401/);
  await assert.rejects(triggerNotionPublication({ token, fetchImpl: async () => { throw new Error(token); } }), error => /timed out/.test(error.message) && !error.message.includes(token));
});
