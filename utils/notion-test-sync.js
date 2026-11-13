const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const remark = require('remark');

const { pageIdFrom, createNotionClient } = require('./notion-api');
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const TEST_SLUG = '/notion-cms-test/';


function draftStateFrom(page) {
  const properties = Object.entries(page.properties || {});
  const draftFields = properties.filter(([key]) => ['draft', '초안'].includes(key.toLowerCase()));
  if (draftFields.some(([, value]) => value.type !== 'checkbox' || typeof value.checkbox !== 'boolean')) {
    throw new Error('Notion의 Draft 또는 초안 속성을 체크박스 유형으로 설정하세요.');
  }
  if (new Set(draftFields.map(([, value]) => value.checkbox)).size > 1) {
    throw new Error('Draft와 초안 속성의 값이 서로 다릅니다. 하나만 사용하세요.');
  }
  const statusFields = properties.filter(([key]) => ['status', '상태'].includes(key.toLowerCase()));
  if (statusFields.some(([, value]) => !['select', 'status'].includes(value.type))) {
    throw new Error('Notion의 Status 또는 상태 속성은 선택 또는 상태 유형이어야 합니다.');
  }
  const statusDrafts = statusFields.map(([, value]) => value[value.type]?.name !== 'Published');
  const explicitDrafts = [...draftFields.map(([, value]) => value.checkbox), ...statusDrafts];
  if (new Set(explicitDrafts).size > 1) throw new Error('Notion의 초안 체크와 발행 상태가 서로 다릅니다.');
  return page.archived === true || page.in_trash === true || (explicitDrafts[0] ?? true);
}

function metadataFrom(page) {
  const properties = Object.entries(page.properties || {});
  const titleField = properties.find(([, value]) => value.type === 'title');
  const title = titleField?.[1].title?.map(item => item.plain_text ?? item.text?.content ?? '').join('').trim();
  if (!title) throw new Error('Notion 글 제목을 읽지 못했습니다.');
  const draft = draftStateFrom(page);
  const dateField = properties.find(([key, value]) => ['date', '작성일'].includes(key.toLowerCase()) && value.type === 'date');
  const date = (dateField?.[1].date?.start || page.created_time)?.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('Notion 글의 작성일을 읽지 못했습니다.');
  return { title, date, draft };
}


function walk(node, visit) {
  if (visit(node) === false) return;
  for (const child of node.children || []) walk(child, visit);
}

function replaceRanges(text, replacements) {
  for (const { start, end, value } of replacements.sort((a, b) => b.start - a.start)) {
    text = text.slice(0, start) + value + text.slice(end);
  }
  return text;
}

const unescapeAttribute = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

function normaliseMarkdown(markdown) {
  const edits = [];
  walk(remark().parse(markdown), node => {
    if (!['html', 'paragraph'].includes(node.type)) return;
    const value = markdown.slice(node.position.start.offset, node.position.end.offset);
    const image = value.match(/^<image\s+([^>]*)>([\s\S]*?)<\/image>\s*$/) ||
      value.match(/^<image\s+([^>]*?)\/?>\s*$/);
    const source = image?.[1].match(/\bsource="([^"]+)"/);
    if (source) {
      const url = unescapeAttribute(source[1]);
      const caption = (image[2] || '').replace(/[\r\n]+/g, ' ').replace(/[\[\]\\]/g, '\\$&');
      edits.push({ start: node.position.start.offset, end: node.position.end.offset, value: `![${caption}](<${url}>)` });
      return false;
    } else if (node.type === 'paragraph') {
      return;
    } else if (/^<p\s*\/>\s*$/.test(value)) {
      edits.push({ start: node.position.start.offset, end: node.position.end.offset, value: '\n' });
    } else {
      throw new Error('현재 동기화는 일반 본문·제목·목록·사진·코드 블록만 지원합니다. Notion 전용 서식이나 임베드를 제거한 뒤 다시 실행하세요.');
    }
  });
  return replaceRanges(markdown, edits);
}

function imageURL(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('사진 주소를 읽지 못했습니다. Notion에 직접 업로드한 사진으로 테스트하세요.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !/(^|\.)(amazonaws\.com|notion-static\.com|notionusercontent\.com|notion\.so)$/.test(url.hostname)) {
    throw new Error('Notion에 직접 업로드한 사진만 지원합니다.');
  }
  return url;
}

function imageExtension(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (/^GIF8[79]a$/.test(bytes.subarray(0, 6).toString())) return 'gif';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'webp';
  throw new Error('사진은 PNG, JPEG, GIF, WebP 형식으로 업로드하세요.');
}

async function downloadImage(value, fetchImpl = fetch) {
  const url = imageURL(value);
  let response;
  try {
    // Notion 인증 키는 사진 다운로드 서버에 전달하지 않습니다.
    response = await fetchImpl(url.href, { redirect: 'error', signal: AbortSignal.timeout(20000) });
    if (!response.ok || !response.body) throw new Error();
    if (Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES) throw new Error();
    const chunks = [];
    let length = 0;
    for await (const chunk of response.body) {
      length += chunk.byteLength;
      if (length > MAX_IMAGE_BYTES) {
        await response.body.cancel().catch(() => {});
        throw new Error();
      }
      chunks.push(Buffer.from(chunk));
    }
    const bytes = Buffer.concat(chunks);
    return { bytes, extension: imageExtension(bytes) };
  } catch {
    throw new Error('사진 다운로드에 실패했습니다. 20MB 이하의 PNG/JPEG/GIF/WebP 사진인지 확인하고 다시 동기화하세요. 기존 글은 유지합니다.');
  }
}

async function preparePage({ request, page, fetchImpl = fetch }) {
  const id = pageIdFrom(page.id);
  const metadata = metadataFrom(page);
  const result = await request(`/pages/${id}/markdown?markdown_version=v2`);
  if (result.truncated || result.unknown_block_ids?.length || typeof result.markdown !== 'string') {
    throw new Error('본문 일부를 읽지 못했습니다. 접근 권한과 지원하지 않는 블록을 확인하세요. 기존 파일은 유지합니다.');
  }
  const markdown = normaliseMarkdown(result.markdown);
  const imageNodes = [];
  const definitions = new Map();
  const tree = remark().parse(markdown);
  walk(tree, node => { if (node.type === 'definition') definitions.set(node.identifier, node); });
  walk(tree, node => {
    if (node.type === 'image') imageNodes.push({ node, url: node.url });
    if (node.type === 'imageReference') {
      const definition = definitions.get(node.identifier);
      if (!definition) throw new Error('사진 참조 주소를 찾지 못했습니다.');
      imageNodes.push({ node, url: definition.url });
    }
  });
  const downloads = new Map();
  const replacements = [];
  for (const { node, url } of imageNodes) {
    if (!downloads.has(url)) {
      const image = await downloadImage(url, fetchImpl);
      const hash = crypto.createHash('sha256').update(image.bytes).digest('hex');
      downloads.set(url, { ...image, filename: `${hash}.${image.extension}` });
    }
    const image = downloads.get(url);
    const alt = (node.alt || '').replace(/[\[\]\\]/g, '\\$&');
    replacements.push({ start: node.position.start.offset, end: node.position.end.offset, value: `![${alt}](./images/${image.filename})` });
  }
  // 참조형 사진의 임시 URL도 생성 파일에서 제거합니다.
  const imageDefinitions = new Set(imageNodes.filter(item => item.node.type === 'imageReference').map(item => definitions.get(item.node.identifier)));
  for (const node of imageDefinitions) {
    let usedByLink = false;
    walk(tree, item => { if (item.type === 'linkReference' && item.identifier === node.identifier) usedByLink = true; });
    if (usedByLink) throw new Error('같은 참조 주소를 사진과 링크에서 함께 사용하고 있습니다. 사진을 별도로 삽입하세요.');
    replacements.push({ start: node.position.start.offset, end: node.position.end.offset, value: '' });
  }
  const body = replaceRanges(markdown, replacements);
  const latest = await request(`/pages/${id}`);
  if (latest.last_edited_time !== page.last_edited_time || JSON.stringify(latest.properties) !== JSON.stringify(page.properties)) {
    throw new Error('동기화 중 Notion 글이 수정되었습니다. 편집을 마친 뒤 다시 실행하세요.');
  }
  return { metadata, body, images: [...downloads.values()], imageCount: imageNodes.length };
}

async function syncTestPage({ request, pageId, outputRoot, fetchImpl = fetch, checkOnly = false }) {
  const id = pageIdFrom(pageId);
  const page = await request(`/pages/${id}`);
  if (page.id?.replace(/-/g, '') !== id.replace(/-/g, '')) throw new Error('응답의 페이지 ID가 요청한 글과 다릅니다.');
  const metadata = metadataFrom(page);
  if (checkOnly) return { ...metadata, pageId: id, checked: true };
  const { body, images, imageCount } = await preparePage({ request, page, fetchImpl });
  const content = `---\ntitle: ${JSON.stringify(metadata.title)}\ndate: ${JSON.stringify(metadata.date)}\ndescription: "Notion CMS 연동 검증용 글"\ncategory: "CMS 테스트"\nslug: ${JSON.stringify(TEST_SLUG)}\ndraft: ${metadata.draft}\n---\n\n${body.trim()}\n`;
  const directory = path.join(outputRoot, 'contents');
  const target = path.join(directory, 'notion-cms-test.md');
  const previous = await fs.readFile(target, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  await fs.mkdir(path.join(directory, 'images'), { recursive: true });
  for (const image of images) await fs.writeFile(path.join(directory, 'images', image.filename), image.bytes);
  const staging = `${target}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.writeFile(staging, content);
    await fs.rename(staging, target);
  } finally {
    await fs.rm(staging, { force: true });
  }
  const report = { ...metadata, pageId: id, slug: TEST_SLUG, imageCount, changed: content !== previous, lastEditedTime: page.last_edited_time, syncedAt: new Date().toISOString() };
  await fs.writeFile(path.join(outputRoot, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

module.exports = { pageIdFrom, draftStateFrom, metadataFrom, createNotionClient, normaliseMarkdown, imageURL, downloadImage, preparePage, syncTestPage, TEST_SLUG };
