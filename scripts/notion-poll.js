// 의존성 설치 전에 실행하는 발행 요청 검사입니다. 원고/사진은 가져오지 않습니다.
const fs = require('node:fs');
const { createNotionClient } = require('../utils/notion-api');
const { checkPublicationRequests } = require('../utils/notion-publication');
const config = require('../notion-cms.config.json');

async function main() {
  const request = createNotionClient({ token: process.env.NOTION_API_KEY });
  const manifest = JSON.parse(fs.readFileSync('notion-content/manifest.json', 'utf8'));
  const { pending, total } = await checkPublicationRequests({ request, config, manifest });
  console.log(`Notion 글 ${total}개 확인 / 새 반영 요청 ${pending ? '있음' : '없음'}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `pending=${pending}\n`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
