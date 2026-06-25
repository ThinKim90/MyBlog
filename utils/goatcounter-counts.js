const { canonicalise, toAnalyticsKey } = require('./path-helpers');

const SITE = process.env.GC_SITE || process.env.GATSBY_GC_SITE || 'thin.goatcounter.com';
const CACHE_TTL_SECONDS = Number(process.env.GC_CACHE_TTL || 120);
const FAILED_CACHE_TTL_SECONDS = Number(process.env.GC_FAILED_CACHE_TTL || 30);
const CONCURRENCY_LIMIT = Number(process.env.GC_REQUEST_CONCURRENCY || 4);

const inMemoryCache = new Map();

const nowSeconds = () => Math.floor(Date.now() / 1000);

const isFresh = (entry) => entry && entry.expiresAt > nowSeconds();

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
};

const stripIndex = (value) => value.replace(/(?:^|\/)index$/, '') || value;

const normaliseForLookup = (input) => {
  const raw = safeDecode(String(input ?? '/')).trim();
  const canonical = canonicalise(raw);
  const analyticsKey = toAnalyticsKey(canonical);

  const candidateSet = new Set();

  if (!analyticsKey || analyticsKey === '/') {
    candidateSet.add('');
    candidateSet.add('/');
    candidateSet.add('index');
  } else {
    candidateSet.add(analyticsKey);
    candidateSet.add(stripIndex(analyticsKey));
    candidateSet.add(`${analyticsKey}/`);
  }

  if (canonical && canonical !== '/') {
    const normalized = canonical.replace(/^\/+/, '');
    candidateSet.add(normalized);
    candidateSet.add(stripIndex(normalized));
    candidateSet.add(canonical);
  }

  const candidates = Array.from(candidateSet).filter(Boolean);

  return {
    key: analyticsKey || '/',
    candidates: candidates.length > 0 ? candidates : ['/'],
  };
};

const fetchCountForCandidate = async (candidate) => {
  const encoded = candidate ? encodeURIComponent(candidate) : '';
  const url = `https://${SITE}/counter/${encoded}.json`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`GoatCounter responded with ${response.status}`);
  }

  const payload = await response.json();
  const total =
    Number.parseInt(payload.count ?? payload.views ?? payload.hits ?? payload.total ?? '0', 10) || 0;
  const unique =
    Number.parseInt(
      payload.count_unique ?? payload.unique ?? payload.unique_views ?? payload.users ?? '0',
      10,
    ) || 0;

  return { total, unique, resolved: candidate || '/' };
};

const fetchCountForPath = async (path, { useCache = true } = {}) => {
  const { key, candidates } = normaliseForLookup(path);

  if (useCache) {
    const cached = inMemoryCache.get(key);
    if (isFresh(cached)) {
      return cached.value;
    }
  }

  const decoded = safeDecode(path ?? '/').replace(/^\/+/, '');
  const attempts = Array.from(new Set([...candidates, decoded]));

  for (const candidate of attempts) {
    if (candidate === undefined) {
      continue;
    }
    try {
      const value = await fetchCountForCandidate(candidate);
      const enriched = {
        ...value,
        key,
        requested: path,
        failed: false,
      };
      if (useCache) {
        inMemoryCache.set(key, {
          value: enriched,
          expiresAt: nowSeconds() + CACHE_TTL_SECONDS,
        });
      }
      return enriched;
    } catch (error) {
      // 다음 후보로 폴백
    }
  }

  const fallback = {
    total: 0,
    unique: 0,
    resolved: attempts[0] || '/',
    key,
    requested: path,
    failed: true,
  };

  if (useCache) {
    inMemoryCache.set(key, {
      value: fallback,
      expiresAt: nowSeconds() + FAILED_CACHE_TTL_SECONDS,
    });
  }

  return fallback;
};

const chunk = (items, size) => {
  if (items.length <= size) {
    return [items];
  }
  const groups = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
};

const fetchCountsForPaths = async (paths, options = {}) => {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
  const results = {};

  const batches = chunk(uniquePaths, CONCURRENCY_LIMIT);
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map((path) => fetchCountForPath(path, options)),
    );
    batch.forEach((path, index) => {
      results[path] = batchResults[index];
    });
  }

  return results;
};

/**
 * 빌드 타임 스냅샷용: slugNoTrailingSlash 키로 정규화된 조회수 맵 반환
 */
const fetchCountsForPosts = async (posts, options = {}) => {
  const analyticsKeys = posts.map((post) => post.analyticsKey).filter(Boolean);
  const raw = await fetchCountsForPaths(analyticsKeys, options);
  const builtAt = Date.now();
  const counts = {};

  posts.forEach((post) => {
    const record = raw[post.analyticsKey];
    if (!record || record.failed) {
      return;
    }

    counts[post.slugKey] = {
      total: record.total,
      unique: record.unique,
      resolvedPath: record.resolved || post.analyticsKey,
      fetchedAt: builtAt,
    };
  });

  return counts;
};

module.exports = {
  SITE,
  fetchCountForPath,
  fetchCountsForPaths,
  fetchCountsForPosts,
  normaliseForLookup,
};
