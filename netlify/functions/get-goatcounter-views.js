// 캐시 저장소 (메모리 기반, 실제 배포에서는 Redis나 Netlify KV 사용 권장)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const SITE = process.env.GC_SITE || 'thin.goatcounter.com';
    const API_TOKEN = process.env.GC_API_TOKEN;
    
    let slugs = [];
    
    // POST 요청에서 슬러그 배열 받기
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      slugs = body.slugs || [];
    } else {
      // GET 요청에서는 기존 방식 지원 (하위 호환성)
      const { searchParams } = new URL(event.rawUrl);
      const pagePath = searchParams.get('pathname') || '/';
      slugs = [pagePath];
    }

    if (slugs.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No slugs provided' }),
      };
    }

    // 캐시 키 생성
    const cacheKey = `views_${SITE}_${slugs.sort().join(',')}`;
    const now = Date.now();
    
    // 캐시 확인
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(cached.data),
        };
      }
    }

    let results = {};
    
    if (API_TOKEN && slugs.length > 1) {
      // API 토큰이 있고 여러 슬러그인 경우 GoatCounter API 사용
      try {
        const apiUrl = `https://${SITE}/api/v0/stats/pages`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const apiData = await response.json();
          // API 응답을 슬러그별로 매핑
          slugs.forEach(slug => {
            const pageData = apiData.find(page => page.path === slug);
            results[slug] = {
              count: pageData?.count || '0',
              count_unique: pageData?.count_unique || '0',
            };
          });
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      } catch (apiError) {
        console.warn('API request failed, falling back to individual requests:', apiError);
        // API 실패 시 개별 요청으로 폴백
        results = await fetchIndividualCounts(SITE, slugs);
      }
    } else {
      // 개별 요청 방식
      results = await fetchIndividualCounts(SITE, slugs);
    }

    // 캐시에 저장
    cache.set(cacheKey, {
      data: results,
      timestamp: now,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Proxy failed', detail: String(e) }),
    };
  }
};

// 개별 요청 함수
async function fetchIndividualCounts(site, slugs) {
  const results = {};
  
  const promises = slugs.map(async (slug) => {
    try {
      const safePath = encodeURI(slug);
      const url = `https://${site}/counter/${safePath}.json`;
      const response = await fetch(url, { 
        headers: { Accept: 'application/json' } 
      });
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        return {
          slug,
          count: data.count ?? '0',
          count_unique: data.count_unique ?? '0',
        };
      } catch {
        return {
          slug,
          count: '0',
          count_unique: '0',
        };
      }
    } catch {
      return {
        slug,
        count: '0',
        count_unique: '0',
      };
    }
  });

  const responses = await Promise.all(promises);
  responses.forEach(({ slug, count, count_unique }) => {
    results[slug] = { count, count_unique };
  });

  return results;
}
