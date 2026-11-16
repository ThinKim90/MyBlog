const { listPages, pageIdFrom } = require('./notion-api');

// Shared by the scheduled preflight and the publisher. This reads properties only;
// article bodies and photos are fetched later, when an actual change is published.
async function checkPublicationRequests({ request, config, manifest }) {
  if (manifest?.version !== 1 || !manifest.pages || Array.isArray(manifest.pages) ||
      typeof manifest.pages !== 'object' || pageIdFrom(manifest.dataSourceId) !== pageIdFrom(config.dataSourceId)) {
    throw new Error('공개본 관리 파일과 Notion 데이터베이스 설정을 확인하세요.');
  }
  const pages = await listPages(request, config.dataSourceId);
  const seen = new Set();
  const excluded = new Set((config.excludedPageIds || []).map(pageIdFrom));
  let pending = false;
  for (const page of pages) {
    const id = pageIdFrom(page.id);
    seen.add(id);
    const previous = manifest.pages[id];
    const status = page.properties?.Status;
    const published = !page.archived && !page.in_trash &&
      (status?.select?.name === 'Published' || status?.status?.name === 'Published');
    if (!published || excluded.has(id)) {
      if (previous?.published) pending = true;
      continue;
    }
    const value = page.properties[config.requestProperty]?.date?.start;
    if (!value) continue;
    if (!/T\d{2}:\d{2}/.test(value) || !Number.isFinite(Date.parse(value))) {
      throw new Error('발행 요청 시각에 날짜와 시간을 함께 입력하세요.');
    }
    if (!previous?.requestedAt || Date.parse(value) > Date.parse(previous.requestedAt)) pending = true;
  }
  for (const [id, previous] of Object.entries(manifest.pages)) {
    if (!previous.published || seen.has(id)) continue;
    // A missing row may be a permission problem. Confirm trash/move explicitly
    // before scheduling a removal; API failures must not start empty workflows.
    const page = await request(`/pages/${pageIdFrom(id)}`);
    const sourceId = page.parent?.data_source_id;
    if (!(page.archived || page.in_trash || (sourceId && pageIdFrom(sourceId) !== pageIdFrom(config.dataSourceId)))) {
      throw new Error('Notion 목록과 공개본의 글이 일치하지 않습니다. 기존 공개본을 유지합니다.');
    }
    pending = true;
  }
  return { pending, total: pages.length };
}

module.exports = { checkPublicationRequests };
