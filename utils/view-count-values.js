const VISIT_WINDOW_MS = 8 * 60 * 60 * 1000;

// GoatCounter's public counter returns formatted strings, e.g. "1,234".
const parseCount = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const text = String(value).replace(/[,\s\u00a0\u202f]/g, '');
  if (!/^\d+$/.test(text)) return undefined;
  const number = Number(text);
  return Number.isSafeInteger(number) ? number : undefined;
};

const isActiveVisit = (visit, now = Date.now()) =>
  Boolean(visit && Number.isFinite(visit.visitedAt) &&
    visit.visitedAt <= now && now - visit.visitedAt < VISIT_WINDOW_MS);

const optimisticTotal = (serverTotal, baseline) => {
  const count = parseCount(serverTotal);
  const beforeVisit = parseCount(baseline);
  return beforeVisit === undefined ? Math.max(count ?? 0, 1) : Math.max(count ?? 0, beforeVisit + 1);
};

// The deadline covers both receiving headers and reading/parsing the body.
const fetchJSON = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`);
          error.status = response.status;
          throw error;
        }
        return await response.json();
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('View count request timed out'));
        }, Math.max(1, timeoutMs));
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { parseCount, VISIT_WINDOW_MS, isActiveVisit, optimisticTotal, fetchJSON };
