// Netlify's scheduler calls the existing GitHub publisher independently of GitHub cron.
// No Notion credentials or article content are available to this function.
const WORKFLOW_URL = 'https://api.github.com/repos/ThinKim90/MyBlog/actions/workflows/notion-publish.yml';

export async function triggerNotionPublication({ token, fetchImpl = fetch } = {}) {
  if (!token?.trim() || /[\r\n]/.test(token)) {
    throw new Error('NOTION_PUBLISH_GITHUB_TOKEN is missing or invalid.');
  }

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
  const result = await triggerNotionPublication({ token: process.env.NOTION_PUBLISH_GITHUB_TOKEN });
  console.info(`Notion publication check: ${result.status}`);
};

// Scheduled functions cannot be called through a public URL in production.
export const config = { schedule: '*/5 * * * *' };
