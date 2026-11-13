const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { draftStateFrom, metadataFrom, preparePage } = require('./notion-test-sync');
const { pageIdFrom, listPages } = require('./notion-api');

const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const serialise = value => JSON.stringify(value, null, 2) + '\n';
const emptyManifest = () => ({ version: 1, pages: {} });
const readManifest = async root => JSON.parse(await fs.readFile(path.join(root, 'notion-content/manifest.json'), 'utf8').catch(error => { if (error.code === 'ENOENT') return serialise(emptyManifest()); throw error; }));

function textValue(property) {
  return (property?.rich_text || []).map(item => item.plain_text ?? item.text?.content ?? '').join('');
}

function slugFor(page, previous) {
  let raw = textValue(page.properties.Slug).trim().replace(/\\_/g, '_');
  if (!raw) return previous?.slug || `/notion-${pageIdFrom(page.id).slice(0, 8)}/`;
  raw = raw.replace(/^\/+|\/+$/g, '');
  if (!raw.split('/').every(part => /^[a-zA-Z0-9가-힣._~-]+$/.test(part) && !['.', '..'].includes(part))) {
    throw new Error('Slug에는 글 주소에 사용할 문자만 입력하세요.');
  }
  if (['about', 'playground', 'admin', '404', 'static', 'page-data'].includes(raw.split('/')[0])) throw new Error('Slug가 블로그 시스템 주소와 겹칩니다.');
  const slug = `/${raw}/`;
  if (previous?.slug && previous.slug !== slug) throw new Error('이미 발행한 글의 Slug는 유지하세요. 주소 이전은 별도로 설정해야 합니다.');
  return slug;
}

function requestTime(page, propertyName) {
  const property = page.properties[propertyName];
  if (property && property.type !== 'date') throw new Error('발행 요청 시각 속성은 날짜 유형이어야 합니다.');
  const value = property?.date?.start;
  if (!value) return null;
  if (!/T\d{2}:\d{2}/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('발행 요청 시각에 날짜와 시간을 함께 입력하세요.');
  return new Date(value).toISOString();
}


function renderPost(page, prepared, slug) {
  const { metadata, body } = prepared;
  const category = page.properties.Category?.select?.name || '미분류';
  const values = {
    title: metadata.title,
    date: metadata.date,
    description: textValue(page.properties.Description) || metadata.title,
    category: category === 'AI 활용하기' ? 'AI 활용 - 바이브코딩' : category,
    slug,
    draft: metadata.draft,
    notionId: pageIdFrom(page.id),
  };
  return `---\n${Object.entries(values).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\n${body.trim()}\n`;
}

async function writePost(directory, content, images) {
  await fs.rm(directory, { recursive: true, force: true });
  await fs.mkdir(path.join(directory, 'images'), { recursive: true });
  for (const image of images) await fs.writeFile(path.join(directory, 'images', image.filename), image.bytes);
  await fs.writeFile(path.join(directory, 'index.md'), content);
}

async function replaceDirectory(staging, target) {
  const backup = `${target}.backup-${crypto.randomUUID()}`;
  let moved = false;
  try {
    await fs.rename(target, backup).then(() => { moved = true; }).catch(error => { if (error.code !== 'ENOENT') throw error; });
    await fs.rename(staging, target);
  } catch (error) {
    if (moved) await fs.rename(backup, target);
    throw error;
  }
  if (moved) await fs.rm(backup, { recursive: true, force: true });
}

async function syncCms({ root, request, config, mode = 'preview', fetchImpl = fetch }) {
  if (!['preview', 'publish'].includes(mode)) throw new Error('알 수 없는 동기화 모드입니다.');
  const pages = await listPages(request, config.dataSourceId);
  const original = await readManifest(root);
  if (original.version !== 1 || typeof original.pages !== 'object') throw new Error('공개본 관리 파일을 읽지 못했습니다.');
  if (original.dataSourceId && pageIdFrom(original.dataSourceId) !== pageIdFrom(config.dataSourceId)) throw new Error('공개본의 Notion 데이터베이스가 설정과 다릅니다.');
  const next = structuredClone(original);
  if (mode === 'publish') next.dataSourceId = pageIdFrom(config.dataSourceId);
  const cache = path.join(root, '.notion-cache');
  await fs.mkdir(cache, { recursive: true });
  const staging = await fs.mkdtemp(path.join(cache, `${mode}-`));
  const excluded = new Set((config.excludedPageIds || []).map(pageIdFrom));
  const report = { mode, total: pages.length, updated: [], removed: [], skipped: [], checkedAt: new Date().toISOString() };
  const seen = new Set();
  try {
    if (mode === 'publish') {
      await fs.cp(path.join(root, 'notion-content'), staging, { recursive: true }).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
    await fs.mkdir(path.join(staging, 'posts'), { recursive: true });
    for (const page of pages) {
      const id = pageIdFrom(page.id);
      seen.add(id);
      const previous = next.pages[id];
      const remove = async () => {
        await fs.rm(path.join(staging, 'posts', id), { recursive: true, force: true });
        if (previous?.published) { next.pages[id] = { ...previous, published: false }; report.removed.push(previous.slug); }
      };
      if (mode === 'publish' && (excluded.has(id) || draftStateFrom(page))) {
        await remove();
        report.skipped.push({ id, reason: excluded.has(id) ? '테스트 전용 글' : '초안' });
        continue;
      }
      const requestedAt = mode === 'publish' ? requestTime(page, config.requestProperty) : null;
      if (mode === 'publish' && (!requestedAt || (previous?.requestedAt && Date.parse(requestedAt) <= Date.parse(previous.requestedAt)))) {
        report.skipped.push({ id, reason: '새 발행 요청 없음' });
        continue;
      }
      let metadata;
      try { metadata = metadataFrom(page); }
      catch (error) {
        if (mode === 'publish') throw error;
        report.skipped.push({ id, reason: error.message });
        continue;
      }
      const slug = slugFor(page, previous);
      const prepared = await preparePage({ request, page, fetchImpl });
      if (!prepared.body.trim()) {
        if (mode === 'publish') throw new Error(`${metadata.title}: 본문이 비어 있어 발행할 수 없습니다.`);
        report.skipped.push({ id, reason: '빈 본문' });
        continue;
      }
      const content = renderPost(page, prepared, slug);
      await writePost(path.join(staging, 'posts', id), content, prepared.images);
      if (mode === 'publish') next.pages[id] = { slug, requestedAt, published: true, revision: digest(content + prepared.images.map(image => image.filename).join('|')) };
      report.updated.push({ id, slug, title: metadata.title, draft: metadata.draft });
    }
    if (mode === 'publish') {
      // 목록에서 사라졌다는 이유만으로 공개본을 지우지 않습니다. 휴지통/이동을 별도로 확인합니다.
      for (const [id, previous] of Object.entries(next.pages)) {
        if (seen.has(id) || !previous.published) continue;
        const page = await request(`/pages/${id}`);
        const sourceId = page.parent?.data_source_id;
        if (!(page.archived || page.in_trash || (sourceId && pageIdFrom(sourceId) !== pageIdFrom(config.dataSourceId)))) throw new Error('Notion 목록과 공개본의 글이 일치하지 않습니다. 기존 공개본을 유지합니다.');
        await fs.rm(path.join(staging, 'posts', id), { recursive: true, force: true });
        next.pages[id] = { ...previous, published: false };
        report.removed.push(previous.slug);
      }
      const slugs = Object.values(next.pages).filter(page => page.published).map(page => page.slug);
      if (new Set(slugs).size !== slugs.length) throw new Error('Notion 글의 Slug가 중복됩니다. 기존 공개본을 유지합니다.');
      next.pages = Object.fromEntries(Object.entries(next.pages).sort(([a], [b]) => a.localeCompare(b)));
      report.changed = serialise(original) !== serialise(next);
      if (report.changed) {
        await fs.writeFile(path.join(staging, 'manifest.json'), serialise(next));
        await replaceDirectory(staging, path.join(root, 'notion-content'));
      }
    } else {
      report.changed = true;
      await replaceDirectory(staging, path.join(cache, 'preview'));
    }
    await fs.writeFile(path.join(cache, `${mode}-report.json`), serialise(report));
    return report;
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

function publicStatus(manifest) {
  return { version: 1, revision: digest(serialise(manifest)), posts: Object.values(manifest.pages).filter(page => page.published).map(({ slug, revision }) => ({ slug, revision })) };
}

module.exports = { listPages, slugFor, requestTime, renderPost, syncCms, readManifest, publicStatus };
