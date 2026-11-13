const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { createNotionClient } = require('../utils/notion-test-sync');
const { syncCms } = require('../utils/notion-cms');

async function main() {
  const root = path.resolve(__dirname, '..');
  const file = path.join(root, '.env.notion');
  const local = fs.existsSync(file) ? parseEnv(fs.readFileSync(file, 'utf8')) : {};
  const request = createNotionClient({ token: process.env.NOTION_API_KEY || local.NOTION_API_KEY });
  const report = await syncCms({ root, request, config: require('../notion-cms.config.json'), mode: process.argv.includes('--publish') ? 'publish' : 'preview' });
  console.log(`Notion ${report.total}개 글 확인 / ${report.updated.length}개 반영 / ${report.removed.length}개 공개 제외 / ${report.skipped.length}개 건너뜀`);
  for (const item of report.skipped) console.log(`${item.id}: ${item.reason}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${report.changed}\n`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
