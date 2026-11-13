const { canonicalise, toAnalyticsKey } = require('./path-helpers');
const { parseCount, fetchJSON } = require('./view-count-values');
const { counts: buildSnapshot = {} } = require('../static/blog-view-counts.json');

const SITE = process.env.GC_SITE || process.env.GATSBY_GC_SITE || 'thin.goatcounter.com';
const positive = (value, fallback) => Number(value) > 0 ? Number(value) : fallback;
const CACHE_TTL_SECONDS = positive(process.env.GC_CACHE_TTL, 900);
const FAILED_CACHE_TTL_SECONDS = positive(process.env.GC_FAILED_CACHE_TTL, 30);
const CONCURRENCY_LIMIT = Math.max(1, Math.floor(positive(process.env.GC_REQUEST_CONCURRENCY, 4)));
const REQUEST_TIMEOUT_MS = positive(process.env.GC_REQUEST_TIMEOUT_MS, 1000);
const BATCH_TIMEOUT_MS = positive(process.env.GC_BATCH_TIMEOUT_MS, 2500);

const inMemoryCache = new Map();
const inFlight = new Map();
const resolvedPaths = new Map();
for (const [slug, entry] of Object.entries(buildSnapshot)) {
  const total = parseCount(entry.total);
  if (total === undefined) continue;
  const key = toAnalyticsKey(slug);
  if (entry.resolvedPath) resolvedPaths.set(key, entry.resolvedPath);
  inMemoryCache.set(key, {
    value: { total, resolved: entry.resolvedPath || key, key, fetchedAt: entry.fetchedAt || 0, failed: false },
    expiresAt: 0,
  });
}

const normaliseForLookup = (input) => {
  let raw = String(input ?? '/');
  try { raw = decodeURIComponent(raw); } catch { /* Keep malformed paths harmless. */ }
  const canonical = canonicalise(raw);
  const key = toAnalyticsKey(canonical);
  // Primary keys match gatsby-browser.js. Only a missing path merits legacy lookups.
  const candidates = key === '/' ? ['/', 'index'] : [key, `${key}/`, canonical];
  return { key, candidates: Array.from(new Set([resolvedPaths.get(key), ...candidates].filter(Boolean))) };
};

const fetchCountForCandidate = async (candidate, timeoutMs) => {
  const payload = await fetchJSON(
    `https://${SITE}/counter/${encodeURIComponent(candidate)}.json`,
    { headers: { Accept: 'application/json' } },
    timeoutMs,
  );
  const total = parseCount(payload.count ?? payload.views ?? payload.hits ?? payload.total);
  if (total === undefined) throw new Error('Invalid GoatCounter count');
  // count_unique is an alias of count, not an independent unique-visitor metric.
  return { total, resolved: candidate, fetchedAt: Date.now() };
};

const fetchCountForPath = (path, { useCache = true, deadline = Date.now() + BATCH_TIMEOUT_MS } = {}) => {
  const { key, candidates } = normaliseForLookup(path);
  const cached = inMemoryCache.get(key);
  if (useCache && cached?.expiresAt > Date.now()) return Promise.resolve(cached.value);
  if (inFlight.has(key)) return inFlight.get(key);

  const request = (async () => {
    for (const candidate of candidates) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      try {
        const value = { ...await fetchCountForCandidate(candidate, Math.min(REQUEST_TIMEOUT_MS, remaining)), key, failed: false };
        resolvedPaths.set(key, candidate);
        inMemoryCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000 });
        return value;
      } catch (error) {
        // A timeout, 429 or 5xx affects every alias; don't multiply failing requests.
        if (error.status !== 404) break;
      }
    }
    const fallback = { ...cached?.value, key, failed: true };
    inMemoryCache.set(key, { value: fallback, expiresAt: Date.now() + FAILED_CACHE_TTL_SECONDS * 1000 });
    return fallback;
  })().finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
};

const fetchCountsForPaths = async (paths, options = {}) => {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
  const results = {};
  const deadline = Date.now() + BATCH_TIMEOUT_MS;
  let index = 0;
  // A worker pool avoids waiting for a whole group before starting the next path.
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY_LIMIT, uniquePaths.length) }, async () => {
    while (index < uniquePaths.length) {
      const path = uniquePaths[index++];
      results[path] = await fetchCountForPath(path, { ...options, deadline });
    }
  }));
  return results;
};

const fetchCountsForPosts = async (posts, options = {}) => {
  const raw = await fetchCountsForPaths(posts.map(post => post.analyticsKey).filter(Boolean), options);
  const counts = {};
  for (const post of posts) {
    const record = raw[post.analyticsKey];
    if (!record || parseCount(record.total) === undefined) continue;
    counts[post.slugKey] = {
      total: record.total,
      resolvedPath: record.resolved || post.analyticsKey,
      fetchedAt: record.fetchedAt || 0,
    };
  }
  return counts;
};

module.exports = { SITE, fetchCountForPath, fetchCountsForPaths, fetchCountsForPosts, normaliseForLookup };
