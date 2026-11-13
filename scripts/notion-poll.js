// 의존성 설치 전에 실행하는 발행 요청 검사입니다. 원고/사진은 가져오지 않습니다.
const fs = require('node:fs');
const { createNotionClient, listPages, pageIdFrom } = require('../utils/notion-api');
const config = require('../notion-cms.config.json');

async function main() {
  const request = createNotionClient({ token: process.env.NOTION_API_KEY });
  const pages = await listPages(request, config.dataSourceId);
  const manifest = JSON.parse(fs.readFileSync('notion-content/manifest.json', 'utf8'));
  const seen = new Set();
  const excluded = new Set(config.excludedPageIds.map(pageIdFrom));
  let pending = manifest.dataSourceId !== pageIdFrom(config.dataSourceId);
  for (const page of pages) {
    const id = pageIdFrom(page.id);
    seen.add(id);
    const previous = manifest.pages[id];
    const published = page.properties.Status?.select?.name === 'Published' || page.properties.Status?.status?.name === 'Published';
    if (!published || excluded.has(id)) { if (previous?.published) pending = true; continue; }
    const value = page.properties[config.requestProperty]?.date?.start;
    if (value && (!previous?.requestedAt || Date.parse(value) > Date.parse(previous.requestedAt))) pending = true;
  }
  for (const [id, previous] of Object.entries(manifest.pages)) if (previous.published && !seen.has(id)) pending = true;
  console.log(`Notion 글 ${pages.length}개 확인 / 새 반영 요청 ${pending ? '있음' : '없음'}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `pending=${pending}\n`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
