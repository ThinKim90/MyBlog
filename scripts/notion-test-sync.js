const path = require('node:path');
const fs = require('node:fs');
const { parseEnv } = require('node:util');
const { createNotionClient, pageIdFrom, syncTestPage } = require('../utils/notion-test-sync');

async function main() {
  const root = path.resolve(__dirname, '..');
  const envFile = path.join(root, '.env.notion');
  const fileEnv = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, 'utf8')) : {};
  // 실행 때마다 파일을 다시 읽습니다. 키 변경 후 Gatsby 서버를 재시작할 필요가 없습니다.
  const token = process.env.NOTION_API_KEY || fileEnv.NOTION_API_KEY;
  const pageId = pageIdFrom(process.env.NOTION_TEST_PAGE_ID || fileEnv.NOTION_TEST_PAGE_ID);
  const report = await syncTestPage({
    request: createNotionClient({ token }),
    pageId,
    outputRoot: path.join(root, '.notion-test'),
    checkOnly: process.argv.includes('--check'),
  });
  console.log(report.checked ? 'Notion 연결과 테스트 글 접근 확인 완료' : 'Notion 테스트 글 동기화 완료');
  console.log(`제목: ${report.title}`);
  console.log(`상태: ${report.draft ? '초안 (일반/운영 빌드에서 제외)' : '발행 대상 (테스트 콘텐츠 모드에서만 포함)'}`);
  if (!report.checked) {
    console.log(`사진: ${report.imageCount}개 / 내용 ${report.changed ? '갱신됨' : '동일'}`);
    console.log(`로컬 경로: ${report.slug}`);
  }
}

main().catch(error => {
  // 응답 본문, 키, 이미지의 임시 서명 URL은 로그에 남기지 않습니다.
  console.error(error.message);
  process.exitCode = 1;
});
