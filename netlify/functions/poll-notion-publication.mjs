import notionApi from '../../utils/notion-api.js';
import publication from '../../utils/notion-publication.js';
import cmsConfig from '../../notion-cms.config.json' with { type: 'json' };

// Read properties before creating a workflow run. No article bodies or photos
// are downloaded here, and credentials are restricted to their own API hosts.
const WORKFLOW_URL = 'https://api.github.com/repos/ThinKim90/MyBlog/actions/workflows/notion-publish.yml';
const MANIFEST_URL = 'https://api.github.com/repos/ThinKim90/MyBlog/contents/notion-content/manifest.json?ref=main';

export async function triggerNotionPublication({ token, notionToken, fetchImpl = fetch } = {}) {
  if (!token?.trim() || /[\r\n]/.test(token)) {
    throw new Error('NOTION_PUBLISH_GITHUB_TOKEN is missing or invalid.');
  }
  if (!notionToken?.trim() || /[\r\n]/.test(notionToken)) {
    throw new Error('NOTION_API_KEY is missing or invalid.');
  }

  // Compare with GitHub main, not a bundled/deployed manifest which may lag
  // behind a successful publication while Netlify is rebuilding.
  let manifest;
  try {
    const response = await fetchImpl(MANIFEST_URL, {
      headers: { Accept: 'application/vnd.github.raw+json', 'Cache-Control': 'no-cache' },
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw new Error();
    }
    manifest = await response.json();
  } catch {
    throw new Error('GitHub publication manifest could not be read.');
  }
  const notionRequest = notionApi.createNotionClient({ token: notionToken, fetchImpl });
  const { pending } = await publication.checkPublicationRequests({ request: notionRequest, config: cmsConfig, manifest });
  if (!pending) return { status: 'no_changes' };

  const request = async (suffix, options = {}) => {
    let response;
    try {
      response = await fetchImpl(`${WORKFLOW_URL}${suffix}`, {
        ...options,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2026-03-10',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new Error('GitHub publication request failed or timed out.');
    }
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw new Error(`GitHub publication request returned HTTP ${response.status}.`);
    }
    return response;
  };

  // Don't queue another check while a publication is already waiting or running.
  const lists = await Promise.all(['queued', 'in_progress'].map(async status => {
    const response = await request(`/runs?branch=main&status=${status}&per_page=1`);
    try {
      const result = await response.json();
      if (!Array.isArray(result.workflow_runs)) throw new Error();
      return result.workflow_runs;
    } catch {
      throw new Error('GitHub publication status could not be read.');
    }
  }));
  if (lists.some(runs => runs.length > 0)) return { status: 'already_running' };

  const response = await request('/dispatches', {
    method: 'POST',
    body: JSON.stringify({ ref: 'main', inputs: { source: 'netlify-schedule' } }),
  });
  await response.body?.cancel().catch(() => {});
  return { status: 'requested' };
}

export default async () => {
  const result = await triggerNotionPublication({ token: process.env.NOTION_PUBLISH_GITHUB_TOKEN, notionToken: process.env.NOTION_API_KEY });
  console.info(`Notion publication check: ${result.status}`);
};

// Scheduled functions cannot be called through a public URL in production.
export const config = { schedule: '*/5 * * * *' };
