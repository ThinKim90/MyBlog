exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1) pathname 받기
    const { searchParams } = new URL(event.rawUrl);
    let pagePath = searchParams.get('pathname') || '/';

    // 2) 슬래시는 보존하고 나머지만 인코딩
    //    - encodeURI는 /, ? 등 경로 구분자는 보존함
    //    - 이미 인코딩된 값이 들어올 수도 있어 한 번 복호화 후 재인코딩
    try { pagePath = decodeURI(pagePath); } catch (_) {}
    const safePath = encodeURI(pagePath);

    // 3) 서브도메인(반드시 대시보드와 스니펫과 동일)
    const SITE = process.env.GC_SITE || 'thin.goatcounter.com';

    // 4) JSON 엔드포인트
    const url = `https://${SITE}/counter/${safePath}.json`;
    console.log('[get-goatcounter-views] Fetch:', url);

    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const text = await r.text();
    console.log('[get-goatcounter-views] Status:', r.status, 'Body:', text);

    // 5) 원본 상태/본문 그대로 통과(디버깅에 중요)
    return {
      statusCode: r.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (e) {
    console.error('[get-goatcounter-views] ERROR:', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Proxy failed', detail: String(e) }),
    };
  }
};
