import { bundleSlug, type SlugBundle } from './slug'

const { parseCount, fetchJSON } = require('../../utils/view-count-values') as {
  parseCount: (value: unknown) => number | undefined
  fetchJSON: (url: string, options?: RequestInit, timeoutMs?: number) => Promise<any>
}

export interface ViewCountEntry {
  total: number
  resolvedPath?: string
  fetchedAt: number
}
export type ViewCountMap = Record<string, ViewCountEntry>

declare global {
  interface Window { __BLOG_VIEW_COUNTS__?: ViewCountMap }
}

const STORAGE_KEY = 'blog_view_counts_v4'
const positive = (value: string | undefined, fallback: number) => Number(value) > 0 ? Number(value) : fallback
const CACHE_DURATION = positive(process.env.GATSBY_VIEWCOUNT_CACHE_MS, 15 * 60 * 1000)
const RETRY_DELAY = 60 * 1000
const REQUEST_TIMEOUT_MS = 4000
let loaded = false
let snapshotRequest: Promise<void> | undefined
const memory: ViewCountMap = {}
const listeners = new Set<() => void>()
const inFlight = new Map<string, Promise<void>>()
const retryAfter = new Map<string, number>()
const browser = () => typeof window !== 'undefined'
const notify = () => listeners.forEach(listener => listener())

const merge = (counts: Record<string, any>) => {
  if (!counts || typeof counts !== 'object') return
  for (const [slug, entry] of Object.entries(counts)) {
    if (!entry) continue
    const total = parseCount(entry.total)
    if (total === undefined) continue
    const key = bundleSlug(slug).withoutTrailingSlash
    const fetchedAt = Number.isFinite(entry.fetchedAt) ? entry.fetchedAt : 0
    if (memory[key] && memory[key].fetchedAt > fetchedAt) continue
    memory[key] = { total, resolvedPath: entry.resolvedPath || key, fetchedAt }
  }
}

const ensureLoaded = () => {
  if (!browser() || loaded) return
  loaded = true
  merge(window.__BLOG_VIEW_COUNTS__ || {})
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('blog_view_counts_v3')
    if (raw) merge(JSON.parse(raw))
  } catch { /* Cached counts are optional when storage is unavailable. */ }
}

const persist = () => {
  if (!browser()) return
  window.__BLOG_VIEW_COUNTS__ = { ...memory }
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory)) } catch { /* Keep the memory cache. */ }
}

export const getCachedViewCount = (slug: string): ViewCountEntry | undefined => {
  ensureLoaded()
  return memory[bundleSlug(slug).withoutTrailingSlash]
}

export const getViewCountSnapshot = (slugs: string[]): ViewCountMap => {
  ensureLoaded()
  const snapshot: ViewCountMap = {}
  for (const slug of slugs) {
    const key = bundleSlug(slug).withoutTrailingSlash
    if (memory[key]) snapshot[key] = memory[key]
  }
  return snapshot
}

export const subscribeViewCounts = (listener: () => void) => {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    try { if (event.newValue) merge(JSON.parse(event.newValue)) } catch { /* Ignore malformed cache data. */ }
    notify()
  }
  if (browser()) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (browser()) window.removeEventListener('storage', onStorage)
  }
}

export const primeViewCounts = (): Promise<void> => {
  if (!browser()) return Promise.resolve()
  ensureLoaded()
  if (window.__BLOG_VIEW_COUNTS__ || snapshotRequest) return snapshotRequest || Promise.resolve()
  snapshotRequest = fetchJSON('/blog-view-counts.json', {}, REQUEST_TIMEOUT_MS)
    .then(payload => { merge(payload?.counts); persist(); notify() })
    .catch(() => { /* Render cached counts even when the snapshot cannot be loaded. */ })
  return snapshotRequest
}

const parseResponse = (bundles: SlugBundle[], payload: any): ViewCountMap => {
  const counts = payload?.counts ?? payload ?? {}
  const result: ViewCountMap = {}
  for (const bundle of bundles) {
    const record = counts[bundle.analyticsKey] ?? counts[bundle.withoutTrailingSlash] ?? counts[bundle.canonical]
    if (!record) continue
    const total = parseCount(record.total ?? record.count ?? record.views)
    if (total === undefined) continue
    // Failed records may carry a last-known value; never mark it fresh.
    const fetchedAt = record.failed ? (record.fetchedAt || 0) : (record.fetchedAt || Date.now())
    result[bundle.withoutTrailingSlash] = { total, resolvedPath: record.resolved || record.key, fetchedAt }
  }
  return result
}

export const requestViewCounts = async (slugs: string[], force = false): Promise<ViewCountMap> => {
  if (!browser()) return {}
  ensureLoaded()
  // gatsby develop does not serve Netlify Functions; allow opt-in for netlify dev.
  if (process.env.NODE_ENV === 'development' && process.env.GATSBY_VIEWCOUNT_DEV_API !== 'true') {
    return getViewCountSnapshot(slugs)
  }
  const bundles = Array.from(new Map(slugs.map(slug => {
    const bundle = bundleSlug(slug)
    return [bundle.withoutTrailingSlash, bundle] as const
  })).values())
  const waiting = new Set<Promise<void>>()
  const needed = bundles.filter(bundle => {
    const key = bundle.withoutTrailingSlash
    const pending = inFlight.get(key)
    if (pending) { waiting.add(pending); return false }
    if ((retryAfter.get(key) || 0) > Date.now()) return false
    return force || !memory[key] || Date.now() - memory[key].fetchedAt >= CACHE_DURATION
  })

  if (needed.length > 0) {
    const params = new URLSearchParams()
    needed.forEach(bundle => params.append('paths', bundle.analyticsKey))
    const request = fetchJSON(`/.netlify/functions/get-goatcounter-views?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    }, REQUEST_TIMEOUT_MS)
      .then(payload => { merge(parseResponse(needed, payload)); persist(); notify() })
      .catch(() => { /* A failed refresh must not clear the last-known counts. */ })
      .finally(() => {
        needed.forEach(bundle => {
          inFlight.delete(bundle.withoutTrailingSlash)
          retryAfter.set(bundle.withoutTrailingSlash, Date.now() + RETRY_DELAY)
        })
      })
    needed.forEach(bundle => inFlight.set(bundle.withoutTrailingSlash, request))
    waiting.add(request)
  }
  await Promise.all(Array.from(waiting))
  return getViewCountSnapshot(slugs)
}
