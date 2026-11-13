const API_VERSION = '2026-03-11';

function pageIdFrom(value = '') {
  let candidate = value.trim();
  if (/^https?:/i.test(candidate)) {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || !/(^|\.)notion\.(so|site|com)$/.test(url.hostname)) {
      throw new Error('Notion 페이지의 https 링크를 입력하세요.');
    }
    candidate = url.pathname.split('/').filter(Boolean).pop() || '';
  }
  const match = candidate.match(/(?:^|-)([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
  if (!match) throw new Error('NOTION_TEST_PAGE_ID에 테스트 글의 페이지 링크 또는 ID를 입력하세요.');
  const id = match[1].replace(/-/g, '').toLowerCase();
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}


function createNotionClient({ token, fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) }) {
  if (!token?.trim() || /[\r\n]/.test(token)) throw new Error('.env.notion의 NOTION_API_KEY가 비어 있거나 올바르지 않습니다.');
  return async (endpoint, { method = 'GET', body } = {}) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      let response;
      try {
        response = await fetchImpl(`https://api.notion.com/v1${endpoint}`, {
          method,
          headers: { Authorization: `Bearer ${token}`, 'Notion-Version': API_VERSION, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          redirect: 'error',
          signal: AbortSignal.timeout(15000),
        });
      } catch {
        throw new Error('Notion 응답을 받지 못했습니다. 네트워크와 API 연결 상태를 확인하세요.');
      }
      if (response.ok) {
        try { return await response.json(); }
        catch { throw new Error('Notion 응답 본문을 읽지 못했습니다. 잠시 후 다시 실행하세요.'); }
      }
      await response.body?.cancel().catch(() => {});
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        const retryAfter = Number(response.headers.get('retry-after'));
        await sleep(Math.min(10000, Math.max(1000, (retryAfter || 1) * 1000)));
        continue;
      }
      const reasons = {
        401: 'API 키가 유효하지 않습니다. 로컬 환경 파일의 키를 확인하세요.',
        403: '연결에 콘텐츠 읽기 권한이 없습니다.',
        404: '테스트 글을 찾을 수 없습니다. 페이지 ID와 해당 페이지의 연결 접근 권한을 확인하세요.',
        429: 'Notion 요청 한도를 초과했습니다. 잠시 후 다시 실행하세요.',
      };
      throw new Error(`Notion HTTP ${response.status}: ${reasons[response.status] || 'API 응답 오류입니다. 기존 파일을 유지합니다.'}`);
    }
  };
}


async function listPages(request, dataSourceId) {
  const pages = [];
  const cursors = new Set();
  let cursor;
  do {
    const response = await request(`/data_sources/${pageIdFrom(dataSourceId)}/query`, { method: 'POST', body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) } });
    if (!Array.isArray(response.results)) throw new Error('Notion 글 목록을 읽지 못했습니다.');
    pages.push(...response.results);
    if (!response.has_more) break;
    cursor = response.next_cursor;
    if (!cursor || cursors.has(cursor)) throw new Error('Notion 목록 페이지를 끝까지 읽지 못했습니다. 기존 공개본을 유지합니다.');
    cursors.add(cursor);
  } while (true);
  const ids = pages.map(page => pageIdFrom(page.id));
  if (new Set(ids).size !== ids.length) throw new Error('Notion 목록에 중복 페이지가 있습니다.');
  return pages;
}


module.exports = { pageIdFrom, createNotionClient, listPages };
