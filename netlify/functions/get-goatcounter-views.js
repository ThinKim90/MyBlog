const { SITE, fetchCountsForPaths } = require('../../utils/goatcounter-counts');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
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

    const responsePayload = await fetchCountsForPaths(requestedPaths);
    const failed = Object.values(responsePayload).some(record => record.failed);

    return {
      statusCode: 200,
      headers: {
        ...HEADERS,
        'Cache-Control': failed
          ? 'public, max-age=30'
          : 'public, max-age=900, stale-while-revalidate=3600',
      },
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
