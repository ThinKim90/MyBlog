const fs = require('node:fs/promises');
const path = require('node:path');
const { syncTestPage } = require('../utils/notion-test-sync');
const { connectorSnapshot } = require('../utils/notion-connector-snapshot');

async function main() {
  if (process.argv.length !== 4) throw new Error('node scripts/notion-connector-test.js <처음 읽은 응답.json> <다시 읽은 응답.json>');
  const initial = connectorSnapshot(JSON.parse(await fs.readFile(process.argv[2], 'utf8')));
  const verified = connectorSnapshot(JSON.parse(await fs.readFile(process.argv[3], 'utf8')));
  if (initial.page.id !== verified.page.id) throw new Error('검증 응답의 페이지가 서로 다릅니다.');
  let pageReads = 0;
  const report = await syncTestPage({
    pageId: initial.page.id,
    outputRoot: path.resolve(__dirname, '../.notion-test'),
    request: async endpoint => endpoint.includes('/markdown')
      ? { markdown: initial.markdown, truncated: false, unknown_block_ids: [] }
      : (pageReads++ === 0 ? initial.page : verified.page),
  });
  await fs.writeFile(path.resolve(__dirname, '../.notion-test/report.json'), JSON.stringify({ ...report, transport: 'notion-connector', autonomous: false }, null, 2) + '\n');
  console.log(JSON.stringify({ title: report.title, draft: report.draft, imageCount: report.imageCount, changed: report.changed, slug: report.slug, transport: 'Notion 플러그인에서 실제로 읽은 응답' }));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
