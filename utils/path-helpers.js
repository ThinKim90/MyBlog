const DEFAULT_INDEX = 'index';

const coerceToString = (value) => {
  if (value == null) return '';
  return String(value);
};

const stripQueryAndHash = (input) => input.replace(/[?#].*$/, '');

const stripProtocolAndDomain = (input) => input.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]+/, '');

const normaliseSlashes = (input) => input.replace(/\\/g, '/').replace(/\/{2,}/g, '/');

const trimDots = (input) => input.replace(/^\.\/?/, '').replace(/\/?\.\.?$/, '');

const removeTrailingSlash = (input) => (input === '/' ? '/' : input.replace(/\/+$/, ''));

const ensureLeadingSlash = (input) => (input.startsWith('/') ? input : `/${input}`);

const ensureTrailingSlash = (input) => {
  if (input === '/') return '/';
  return input.endsWith('/') ? input : `${input}/`;
};

const cleanPathname = (value = '') => {
  let work = coerceToString(value).trim();
  if (!work) return '';
  work = stripProtocolAndDomain(work);
  work = stripQueryAndHash(work);
  work = normaliseSlashes(work);
  work = trimDots(work);
  return work;
};

const canonicalise = (value) => {
  const cleaned = cleanPathname(value);
  if (!cleaned || cleaned === '/') {
    return '/';
  }
  const withoutSlashes = cleaned.replace(/^\/+/, '');
  if (!withoutSlashes) return '/';
  return ensureTrailingSlash(`/${withoutSlashes}`);
};

const stripTrailingSlash = (value) => {
  const canonical = canonicalise(value);
  if (canonical === '/') return '/';
  return removeTrailingSlash(canonical);
};

const toAnalyticsKey = (value) => {
  const stripped = stripTrailingSlash(value);
  if (stripped === '/') return '/';
  return stripped.replace(/^\/+/, '');
};

const normaliseExplicitSlug = (value) => canonicalise(value);

const buildFileSlug = (segments = []) => {
  const slugged = segments
    .map((segment) =>
      coerceToString(segment)
        .trim()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\uAC00-\uD7A3._~-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[-._]+|[-._]+$/g, '') || DEFAULT_INDEX,
    )
    .filter(Boolean)
    .join('/');

  if (!slugged) return '/';
  return ensureTrailingSlash(`/${slugged}`);
};

const normaliseLegacyPath = (value) => {
  const canonical = canonicalise(value);
  if (!canonical) return null;
  return canonical;
};

module.exports = {
  canonicalise,
  stripTrailingSlash,
  toAnalyticsKey,
  normaliseExplicitSlug,
  normaliseLegacyPath,
  buildFileSlug,
};
