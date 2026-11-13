const { readManifest, publicStatus } = require('../utils/notion-cms');
const config = require('../notion-cms.config.json');

async function main() {
  const expected = publicStatus(await readManifest(process.cwd()));
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${config.productionUrl}/cms-publication.json?check=${Date.now()}`, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
      const status = response.ok ? await response.json() : null;
      if (status?.revision === expected.revision) { console.log(`운영 블로그 반영 확인: 공개 글 ${status.posts.length}개`); return; }
    } catch { /* 빌드 중에는 이전 배포를 계속 확인합니다. */ }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  throw new Error('GitHub 저장은 완료됐지만 10분 안에 운영 반영을 확인하지 못했습니다. Netlify 배포 상태를 확인하세요.');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
