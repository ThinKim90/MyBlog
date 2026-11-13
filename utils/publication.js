// Preview is opt-in and can never enable drafts in a production build.
const isDraftPreview = (env = process.env) =>
  env.NODE_ENV === 'development' && env.BLOG_PREVIEW_DRAFTS === 'true';

const allowedDraftStates = (env = process.env) =>
  isDraftPreview(env) ? [false, true] : [false];

const isDraft = (frontmatter = {}) => {
  const value = frontmatter.draft;
  if (value != null && typeof value !== 'boolean') {
    throw new Error('draft는 따옴표 없이 true 또는 false로 입력하세요.');
  }
  return value === true;
};

module.exports = { isDraftPreview, allowedDraftStates, isDraft };
