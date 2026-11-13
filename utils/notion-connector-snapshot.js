// Notion 플러그인에서 실제로 읽은 응답을 단일 글 검증에 사용할 때의 변환기입니다.
// 이 파일에는 인증이나 Notion API 호출 기능이 없습니다.
const { pageIdFrom } = require('./notion-test-sync');

function connectorSnapshot(snapshot) {
  if (snapshot.truncated || snapshot.unknown_block_count > 0 || snapshot.unknown_block_ids?.length ||
      snapshot.metadata?.truncated || snapshot.metadata?.unknown_block_count > 0 || snapshot.metadata?.unknown_block_ids?.length) {
    throw new Error('Notion 플러그인 응답에 읽지 못한 본문이 있습니다.');
  }
  const propertiesText = snapshot.text?.match(/<properties>\s*([\s\S]*?)\s*<\/properties>/)?.[1];
  const content = snapshot.text?.match(/<content>\n([\s\S]*?)\n<\/content>\n<\/page>/)?.[1];
  if (!propertiesText || content === undefined || !snapshot.page_last_edited_at) {
    throw new Error('Notion 플러그인에서 읽은 전체 페이지 응답이 필요합니다.');
  }
  const values = JSON.parse(propertiesText);
  const properties = { Title: { type: 'title', title: [{ plain_text: values.Title || snapshot.title }] } };
  if (Object.hasOwn(values, 'Status')) properties.Status = { type: 'select', select: values.Status ? { name: values.Status } : null };
  for (const name of ['Draft', 'draft', '초안']) {
    if (!Object.hasOwn(values, name)) continue;
    if (!['__YES__', '__NO__', true, false, 1, 0].includes(values[name])) throw new Error('초안 체크박스 값을 읽지 못했습니다.');
    properties[name] = { type: 'checkbox', checkbox: ['__YES__', true, 1].includes(values[name]) };
  }
  if (values['date:Date:start']) properties.Date = { type: 'date', date: { start: values['date:Date:start'] } };
  const page = { id: pageIdFrom(snapshot.id), properties, last_edited_time: snapshot.page_last_edited_at };
  const references = snapshot.metadata?.references || snapshot.references || {};
  let markdown = content;
  for (const [reference, url] of Object.entries(references)) {
    if (typeof url !== 'string') throw new Error('사진 다운로드 URL을 읽지 못했습니다.');
    markdown = markdown.split(reference).join(url);
  }
  if (markdown.includes('notion-file-block://')) throw new Error('사진의 최신 다운로드 URL을 포함해서 Notion 글을 다시 읽으세요.');
  return { page, markdown };
}

module.exports = { connectorSnapshot };
