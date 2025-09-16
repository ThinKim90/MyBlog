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
    const { searchParams } = new URL(event.rawUrl);
    let pagePath = searchParams.get('pathname') || '/';

    // 슬래시 보존 인코딩
    try { pagePath = decodeURI(pagePath); } catch {}
    const safePath = encodeURI(pagePath);

    // 스니펫의 서브도메인과 100% 동일하게!
    const SITE = process.env.GC_SITE || 'thin.goatcounter.com';
    const url = `https://${SITE}/counter/${safePath}.json`;

    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const text = await r.text();

    // GoatCounter는 404여도 {count:"0"} 을 보낼 수 있으므로
    // 여기서 통일된 형태로 변환해서 200으로 내려주면 프론트가 더 간단해짐.
    try {
      const data = JSON.parse(text);
      const count = data.count ?? '0';
      const count_unique = data.count_unique ?? '0';
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count, count_unique }),
      };
    } catch {
      // JSON이 아니면 원문 상태/본문 그대로 전달(디버그용)
      return { statusCode: r.status, headers, body: text };
    }
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Proxy failed', detail: String(e) }),
    };
  }
};
