const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const SITE = process.env.GC_SITE || process.env.GATSBY_GC_SITE || 'thin.goatcounter.com';
const CACHE_TTL_SECONDS = Number(process.env.GC_CACHE_TTL || 120);
const CONCURRENCY_LIMIT = Number(process.env.GC_REQUEST_CONCURRENCY || 4);

// Netlify Lambda 재사용 시 인메모리 캐시로 API 호출 수를 줄인다.
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

const normaliseForLookup = (input) => {
  const raw = safeDecode(String(input ?? '/')).trim();
  const withoutHash = raw.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0];
  const trimmedLeading = withoutQuery.replace(/^\/+/g, '');
  const trimmedWhitespace = trimmedLeading.replace(/\s+/g, ' ');
  const withoutTrailing = trimmedWhitespace.replace(/\/+$|\/+$/g, '');

  if (!withoutTrailing) {
    return {
      key: '/',
      candidates: ['', 'index', '/'],
    };
  }

  const candidateSet = new Set();
  const canonical = withoutTrailing.replace(/\/{2,}/g, '/');
  candidateSet.add(canonical);
  candidateSet.add(withoutTrailing);
  candidateSet.add(`${canonical}/`);
  candidateSet.add(`${withoutTrailing}/`);

  return {
    key: input,
    candidates: Array.from(candidateSet).filter(Boolean),
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
  const total = Number.parseInt(
    payload.count ?? payload.views ?? payload.hits ?? payload.total ?? '0',
    10,
  ) || 0;
  const unique = Number.parseInt(
    payload.count_unique ?? payload.unique ?? payload.unique_views ?? payload.users ?? '0',
    10,
  ) || 0;

  return { total, unique, resolved: candidate || '/' };
};

const fetchCountForPath = async (path) => {
  const { key, candidates } = normaliseForLookup(path);
  const cached = inMemoryCache.get(key);
  if (isFresh(cached)) {
    return cached.value;
  }

  const attempts = [...candidates, safeDecode(path ?? '/').replace(/^\/+/g, '')];
  for (const candidate of attempts) {
    if (candidate === undefined) {
      continue;
    }
    try {
      const value = await fetchCountForCandidate(candidate);
      inMemoryCache.set(key, {
        value,
        expiresAt: nowSeconds() + CACHE_TTL_SECONDS,
      });
      return value;
    } catch (error) {
      // 다음 후보로 폴백
    }
  }

  const fallback = { total: 0, unique: 0, resolved: attempts[0] || '/' };
  inMemoryCache.set(key, {
    value: fallback,
    expiresAt: nowSeconds() + CACHE_TTL_SECONDS,
  });
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

const parseRequestedPaths = (event) => {
  const paths = [];
  const { searchParams } = new URL(event.rawUrl);

  const single = searchParams.get('pathname');
  if (single) {
    paths.push(single);
  }

  const multi = searchParams.getAll('paths');
  if (multi.length > 0) {
    paths.push(...multi);
  }

  if (event.httpMethod === 'POST' && event.body) {
    try {
      const body = JSON.parse(event.body);
      if (Array.isArray(body.paths)) {
        paths.push(...body.paths);
      } else if (Array.isArray(body.slugs)) {
        paths.push(...body.slugs);
      }
    } catch (error) {
      throw new Error(`Invalid JSON body: ${error}`);
    }
  }

  return Array.from(new Set(paths.filter(Boolean)));
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (!SITE) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'GC_SITE is not configured' }),
    };
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const requestedPaths = parseRequestedPaths(event);

    if (requestedPaths.length === 0) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'No paths supplied' }),
      };
    }

    const responsePayload = {};
    const batches = chunk(requestedPaths, CONCURRENCY_LIMIT);

    for (const batch of batches) {
      const batchResults = await Promise.all(batch.map((path) => fetchCountForPath(path)));
      batch.forEach((path, index) => {
        responsePayload[path] = batchResults[index];
      });
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ counts: responsePayload, site: SITE }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Proxy failed', detail: String(error) }),
    };
  }
};
