import { bundleSlug } from './slug'
import { getCachedViewCount } from './viewCountCache'

interface Visit { visitedAt: number; baseline?: number }
const { isActiveVisit, optimisticTotal } = require('../../utils/view-count-values') as {
  isActiveVisit: (visit: Visit | undefined, now?: number) => boolean
  optimisticTotal: (total: number | undefined, baseline: number | undefined) => number
}

const STORAGE_KEY = 'blog_optimistic_views_v2'
const OPTIMISTIC_EVENT = 'blog-view-optimistic'
const STATIC_ROUTES = new Set(['/', '/about', '/playground', '/404', '/dev-404-page'])
let memory: Record<string, Visit> = {}
const browser = () => typeof window !== 'undefined'

const readVisits = () => {
  if (!browser()) return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) memory = parsed
  } catch { /* Reuse memory if localStorage is blocked. */ }
  for (const [slug, visit] of Object.entries(memory)) {
    if (!isActiveVisit(visit)) delete memory[slug]
  }
  return memory
}

const writeVisits = (visits: Record<string, Visit>) => {
  memory = visits
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visits)) } catch { /* Keep memory. */ }
}

export const shouldTrackOptimisticView = (pathname: string) =>
  !STATIC_ROUTES.has(bundleSlug(pathname).withoutTrailingSlash)

export const markOptimisticView = (slug: string) => {
  if (!browser() || !shouldTrackOptimisticView(slug)) return
  const key = bundleSlug(slug).withoutTrailingSlash
  const visits = readVisits()
  if (isActiveVisit(visits[key])) return
  visits[key] = { visitedAt: Date.now(), baseline: getCachedViewCount(key)?.total }
  writeVisits(visits)
  window.dispatchEvent(new CustomEvent(OPTIMISTIC_EVENT))
}

export const getOptimisticTotal = (slug: string, serverTotal?: number): number | undefined => {
  if (!browser()) return serverTotal
  const key = bundleSlug(slug).withoutTrailingSlash
  const visits = readVisits()
  const visit = visits[key]
  if (!isActiveVisit(visit)) return serverTotal
  if (visit.baseline === undefined && serverTotal !== undefined) {
    // Without a pre-visit count, the first response may already include us.
    // Adopt it instead of blindly adding another visit.
    visit.baseline = Math.max(0, serverTotal - 1)
    writeVisits(visits)
  }
  return optimisticTotal(serverTotal, visit.baseline)
}

export const subscribeOptimisticViews = (listener: () => void) => {
  if (!browser()) return () => {}
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) listener() }
  window.addEventListener(OPTIMISTIC_EVENT, listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(OPTIMISTIC_EVENT, listener)
    window.removeEventListener('storage', onStorage)
  }
}
