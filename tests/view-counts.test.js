const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const values = require('../utils/view-count-values');

// Run the actual browser modules with isolated storage, without contacting GoatCounter.
function browserRuntime(initial = {}, { blockedStorage = false, env = 'production', ssr = false } = {}) {
  const storage = new Map(Object.entries(initial));
  const window = new EventTarget();
  window.localStorage = {
    getItem(key) { if (blockedStorage) throw new Error('blocked'); return storage.get(key) ?? null; },
    setItem(key, value) { if (blockedStorage) throw new Error('blocked'); storage.set(key, value); },
  };
  const modules = new Map();
  function load(file) {
    file = path.resolve(__dirname, '..', file);
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports, window: ssr ? undefined : window, CustomEvent, URLSearchParams, Date,
      process: { env: { NODE_ENV: env } },
      require(specifier) {
        if (!specifier.startsWith('.')) return require(specifier);
        const target = path.resolve(path.dirname(file), specifier);
        if (target.startsWith(path.resolve(__dirname, '../src'))) return load(`${target}.ts`);
        return require(target);
      },
    }, { filename: file });
    return module.exports;
  }
  return { window, storage, load, cache: load('src/utils/viewCountCache.ts'), optimistic: load('src/utils/viewCountOptimistic.ts') };
}

async function withBackend(run) {
  const originalFetch = global.fetch;
  const keys = ['GC_REQUEST_TIMEOUT_MS', 'GC_BATCH_TIMEOUT_MS', 'GC_REQUEST_CONCURRENCY'];
  const previous = keys.map(key => process.env[key]);
  process.env.GC_REQUEST_TIMEOUT_MS = '25';
  process.env.GC_BATCH_TIMEOUT_MS = '70';
  process.env.GC_REQUEST_CONCURRENCY = '2';
  delete require.cache[require.resolve('../utils/goatcounter-counts')];
  try { await run(require('../utils/goatcounter-counts')); }
  finally {
    global.fetch = originalFetch;
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
}
const ok = payload => ({ ok: true, json: async () => payload });

test('formatted counts preserve thousands and reject invalid data instead of inventing zero', () => {
  for (const [input, expected] of [['1,234', 1234], ['12\u202f345', 12345], ['0', 0], [28, 28]]) {
    assert.equal(values.parseCount(input), expected);
  }
  for (const invalid of [undefined, null, '', 'oops', '-1', '1.2', NaN, Infinity, {}, '9007199254740992']) {
    assert.equal(values.parseCount(invalid), undefined);
  }
});

test('optimistic display converges to server totals instead of permanently adding one', () => {
  assert.equal(values.optimisticTotal(100, 100), 101);
  assert.equal(values.optimisticTotal(101, 100), 101);
  assert.equal(values.optimisticTotal(105, 100), 105);
  assert.equal(values.optimisticTotal(99, 100), 101);
  assert.equal(values.optimisticTotal(undefined, 100), 101);
  assert.equal(values.optimisticTotal(undefined, undefined), 1);
  assert.equal(values.optimisticTotal(100, undefined), 100);
  const visit = { visitedAt: 1000 };
  assert.equal(values.isActiveVisit(visit, 1001), true);
  assert.equal(values.isActiveVisit(visit, 1000 + values.VISIT_WINDOW_MS), false);
});

test('same-browser revisits, reloads and new tabs share one optimistic visit for 8 hours', () => {
  const runtime = browserRuntime();
  runtime.window.__BLOG_VIEW_COUNTS__ = { '/post': { total: 100, fetchedAt: Date.now() } };
  runtime.optimistic.markOptimisticView('/post/');
  assert.equal(runtime.optimistic.getOptimisticTotal('/post', 100), 101);
  runtime.optimistic.markOptimisticView('/post');
  assert.equal(runtime.optimistic.getOptimisticTotal('/post', 101), 101);
  assert.equal(runtime.optimistic.getOptimisticTotal('/post', 105), 105);
  const tab = browserRuntime(Object.fromEntries(runtime.storage));
  tab.optimistic.markOptimisticView('/post/');
  assert.equal(tab.optimistic.getOptimisticTotal('/post', 105), 105);
  const visits = JSON.parse(tab.storage.get('blog_optimistic_views_v2'));
  visits['/post'].visitedAt = Date.now() - values.VISIT_WINDOW_MS - 1;
  tab.storage.set('blog_optimistic_views_v2', JSON.stringify(visits));
  tab.window.__BLOG_VIEW_COUNTS__ = { '/post': { total: 105, fetchedAt: Date.now() } };
  // Use a fresh module instance as after a full reload, with an expired visit.
  const reload = browserRuntime(Object.fromEntries(tab.storage));
  reload.window.__BLOG_VIEW_COUNTS__ = tab.window.__BLOG_VIEW_COUNTS__;
  reload.optimistic.markOptimisticView('/post');
  assert.equal(reload.optimistic.getOptimisticTotal('/post', 105), 106);
});

test('late first counts establish a fixed baseline and storage failure still deduplicates', () => {
  const { optimistic } = browserRuntime({}, { blockedStorage: true });
  optimistic.markOptimisticView('/new/');
  assert.equal(optimistic.getOptimisticTotal('/new'), 1);
  assert.equal(optimistic.getOptimisticTotal('/new', 100), 100);
  optimistic.markOptimisticView('/new/');
  assert.equal(optimistic.getOptimisticTotal('/new', 105), 105);
  optimistic.markOptimisticView('/about');
  assert.equal(optimistic.getOptimisticTotal('/about', 7), 7);
});

test('backend shares canonical requests and correctly reads formatted public counters', async () => {
  await withBackend(async backend => {
    let calls = 0;
    global.fetch = async () => { calls++; await new Promise(resolve => setTimeout(resolve, 5)); return ok({ count: '1,234', count_unique: '1,234' }); };
    const result = await backend.fetchCountsForPaths(['format-test', '/format-test/', 'format-test']);
    assert.equal(calls, 1);
    assert.equal(result['format-test'].total, 1234);
    assert.equal(result['/format-test/'].total, 1234);
    assert.equal('unique' in result['format-test'], false);
    await backend.fetchCountForPath('format-test');
    assert.equal(calls, 1);
  });
});

test('legacy paths are tried only on 404, and a successful path is remembered', async () => {
  await withBackend(async backend => {
    const calls = [];
    global.fetch = async url => {
      calls.push(url);
      return url.endsWith('legacy-test%2F.json') ? ok({ count: '33' }) : { ok: false, status: 404 };
    };
    assert.equal((await backend.fetchCountForPath('legacy-test')).total, 33);
    assert.equal(calls.length, 2);
    calls.length = 0;
    await backend.fetchCountForPath('legacy-test', { useCache: false });
    assert.equal(calls.length, 1);
    assert.match(calls[0], /legacy-test%2F.json$/);
  });
});

test('upstream errors preserve the last successful count and do not fan out aliases', async () => {
  await withBackend(async backend => {
    global.fetch = async () => ok({ count: '100' });
    await backend.fetchCountForPath('fallback-test');
    let calls = 0;
    global.fetch = async () => { calls++; return { ok: false, status: 429 }; };
    const fallback = await backend.fetchCountForPath('fallback-test', { useCache: false });
    assert.equal(fallback.failed, true);
    assert.equal(fallback.total, 100);
    assert.equal(calls, 1);
    const missing = await backend.fetchCountForPath('unknown-test');
    assert.equal(missing.failed, true);
    assert.equal(missing.total, undefined);
  });
});

test('a stalled response body cannot hang a whole list request', async () => {
  await withBackend(async backend => {
    global.fetch = async () => ({ ok: true, json: () => new Promise(() => {}) });
    const start = Date.now();
    const results = await backend.fetchCountsForPaths(Array.from({ length: 20 }, (_, i) => `timeout-${i}`));
    assert.ok(Date.now() - start < 500, 'whole batch exceeded its time budget');
    assert.equal(Object.keys(results).length, 20);
    assert.ok(Object.values(results).every(record => record.failed && record.total === undefined));
  });
});

test('browser shows saved counts immediately and refreshes only stale paths', async () => {
  const originalFetch = global.fetch;
  try {
    const { cache, window } = browserRuntime();
    window.__BLOG_VIEW_COUNTS__ = {
      '/fresh': { total: 20, fetchedAt: Date.now() },
      '/stale': { total: 100, fetchedAt: 1 },
    };
    assert.equal(cache.getViewCountSnapshot(['/stale'])['/stale'].total, 100);
    const urls = [];
    global.fetch = async url => { urls.push(url); return ok({ counts: { stale: { total: '1,234', fetchedAt: Date.now() } } }); };
    await cache.requestViewCounts(['/fresh', '/stale']);
    assert.equal(urls.length, 1);
    assert.ok(!urls[0].includes('fresh'));
    assert.equal(cache.getCachedViewCount('/stale/').total, 1234);
    await cache.requestViewCounts(['/fresh', '/stale']);
    assert.equal(urls.length, 1);
  } finally { global.fetch = originalFetch; }
});

test('overlapping browser batches share individual pending paths', async () => {
  const originalFetch = global.fetch;
  try {
    const { cache } = browserRuntime();
    const requests = [];
    global.fetch = async url => {
      requests.push(url);
      await new Promise(resolve => setTimeout(resolve, 5));
      const counts = {};
      for (const slug of new URL(url, 'https://example.com').searchParams.getAll('paths')) counts[slug] = { total: 9 };
      return ok({ counts });
    };
    await Promise.all([cache.requestViewCounts(['/a', '/b']), cache.requestViewCounts(['/b', '/c'])]);
    assert.equal(requests.length, 2);
    assert.equal(requests.filter(url => new URL(url, 'https://example.com').searchParams.getAll('paths').includes('b')).length, 1);
    assert.equal(cache.getCachedViewCount('/c').total, 9);
  } finally { global.fetch = originalFetch; }
});

test('failed or partial refresh preserves saved data, does not invent zero, and backs off', async () => {
  const originalFetch = global.fetch;
  try {
    const { cache, window } = browserRuntime();
    window.__BLOG_VIEW_COUNTS__ = { '/kept': { total: 100, fetchedAt: 1 } };
    let calls = 0;
    global.fetch = async () => { calls++; return ok({ counts: { kept: { failed: true }, missing: { failed: true } } }); };
    await cache.requestViewCounts(['/kept', '/missing']);
    assert.equal(cache.getCachedViewCount('/kept').total, 100);
    assert.equal(cache.getCachedViewCount('/missing'), undefined);
    await cache.requestViewCounts(['/missing']);
    assert.equal(calls, 1);
  } finally { global.fetch = originalFetch; }
});

test('local Gatsby preview does not request absent Netlify Functions', async () => {
  const originalFetch = global.fetch;
  try {
    const { cache } = browserRuntime({}, { env: 'development' });
    global.fetch = () => assert.fail('local Gatsby should use saved counts');
    await cache.requestViewCounts(['/local']);
  } finally { global.fetch = originalFetch; }
});

test('manual tracking configuration precedes the async tracker in generated head order', () => {
  const ssr = require('../gatsby-ssr');
  const React = require('react');
  const tracker = React.createElement('script', { key: 'tracker', src: '//gc.zgo.at/count.js', async: true });
  let head = [tracker];
  ssr.onRenderBody({ setHtmlAttributes() {}, setHeadComponents: entries => head.push(...entries) });
  ssr.onPreRenderHTML({ getHeadComponents: () => head, replaceHeadComponents: entries => { head = entries; } });
  assert.equal(head[0].key, 'goatcounter-config');
  assert.match(head[0].props.dangerouslySetInnerHTML.__html, /no_onload:true/);
  assert.ok(head.indexOf(tracker) > 0);
});

test('server and initial browser render match even when saved counts exist', () => {
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  const saved = { blog_view_counts_v4: JSON.stringify({ '/post': { total: 1234, fetchedAt: Date.now() } }) };
  const server = browserRuntime({}, { ssr: true });
  const client = browserRuntime(saved);
  const render = runtime => {
    const { useCachedViewCounts } = runtime.load('src/hooks/useCachedViewCounts.ts');
    function Counter() {
      const { viewCounts } = useCachedViewCounts(['/post']);
      return React.createElement('span', {}, viewCounts['/post']?.total ?? '—');
    }
    return renderToString(React.createElement(Counter));
  };
  assert.equal(render(server), render(client));
  assert.equal(client.cache.getCachedViewCount('/post').total, 1234);
});
