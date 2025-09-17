import { useCallback, useEffect, useMemo, useState } from 'react'
import { bundleSlug, type SlugBundle } from 'utils/slug'

export interface ViewCountEntry {
  total: number
  unique: number
  resolvedPath?: string
  fetchedAt: number
}

export type ViewCountMap = Record<string, ViewCountEntry>

const STORAGE_KEY = 'blog_view_counts_v2'
const CACHE_DURATION = Number(process.env.GATSBY_VIEWCOUNT_CACHE_MS || 5 * 60 * 1000)

const isBrowser = typeof window !== 'undefined'

let cacheLoaded = false
let memoryCache: ViewCountMap = {}
const inFlight = new Map<string, Promise<ViewCountMap>>()

const now = () => Date.now()

type PreparedSlug = SlugBundle

const prepareSlugBundles = (input: string[]): PreparedSlug[] => {
  const map = new Map<string, PreparedSlug>()
  input
    .filter(Boolean)
    .forEach((value) => {
      const bundle = bundleSlug(value)
      if (!map.has(bundle.withoutTrailingSlash)) {
        map.set(bundle.withoutTrailingSlash, bundle)
      }
    })
  return Array.from(map.values())
}

const extractKeys = (bundles: PreparedSlug[]) =>
  bundles.map((bundle) => bundle.withoutTrailingSlash)

const extractAnalyticsKeys = (bundles: PreparedSlug[]) =>
  Array.from(new Set(bundles.map((bundle) => bundle.analyticsKey)))

const isEntryFresh = (entry?: ViewCountEntry) => {
  if (!entry) return false
  return now() - entry.fetchedAt < CACHE_DURATION
}

const ensureCacheLoaded = () => {
  if (cacheLoaded || !isBrowser) return
  cacheLoaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed: ViewCountMap = JSON.parse(raw)
    const freshEntries: ViewCountMap = {}
    Object.entries(parsed).forEach(([slug, entry]) => {
      if (isEntryFresh(entry)) {
        freshEntries[slug] = entry
      }
    })
    memoryCache = freshEntries
  } catch (error) {
    console.warn('Failed to read cached view counts:', error)
  }
}

const persistCache = () => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache))
  } catch (error) {
    console.warn('Failed to persist view count cache:', error)
  }
}

const getSnapshotFor = (slugs: string[]): ViewCountMap => {
  if (!isBrowser) return {}
  ensureCacheLoaded()

  const snapshot: ViewCountMap = {}
  slugs.forEach((slug) => {
    const entry = memoryCache[slug]
    if (isEntryFresh(entry)) {
      snapshot[slug] = entry
    }
  })
  return snapshot
}

const needsRefresh = (slugs: string[]) => {
  if (!isBrowser) return false
  ensureCacheLoaded()
  return slugs.some((slug) => !isEntryFresh(memoryCache[slug]))
}

const mergeIntoCache = (counts: ViewCountMap) => {
  if (!isBrowser) return
  ensureCacheLoaded()

  let changed = false
  Object.entries(counts).forEach(([slug, entry]) => {
    const next: ViewCountEntry = {
      total: entry.total,
      unique: entry.unique,
      resolvedPath: entry.resolvedPath || memoryCache[slug]?.resolvedPath || slug,
      fetchedAt: entry.fetchedAt || now(),
    }
    memoryCache[slug] = next
    changed = true
  })

  if (changed) {
    persistCache()
  }
}

const parseServerCounts = (bundles: PreparedSlug[], payload: any): ViewCountMap => {
  const nowTs = now()
  const result: ViewCountMap = {}
  const counts = payload?.counts ?? payload ?? {}

  bundles.forEach((bundle) => {
    const { withoutTrailingSlash, analyticsKey, canonical } = bundle
    const record =
      counts[analyticsKey] ??
      counts[withoutTrailingSlash] ??
      counts[withoutTrailingSlash.replace(/^\/+/, '')] ??
      counts[canonical] ??
      counts[canonical.replace(/^\/+/, '')] ??
      {}
    const total = Number.parseInt(
      record.total ?? record.count ?? record.views ?? record.count_unique ?? '0',
      10,
    ) || 0
    const unique = Number.parseInt(
      record.unique ?? record.count_unique ?? record.unique_views ?? '0',
      10,
    ) || 0

    result[withoutTrailingSlash] = {
      total,
      unique,
      resolvedPath:
        record.resolved || record.key || analyticsKey || withoutTrailingSlash,
      fetchedAt: nowTs,
    }
  })

  return result
}

const requestCounts = (bundles: PreparedSlug[]): Promise<ViewCountMap> => {
  if (!isBrowser || bundles.length === 0) {
    return Promise.resolve({})
  }

  const analyticsKeys = extractAnalyticsKeys(bundles)
  const requestKey = analyticsKeys.slice().sort().join('|')

  const existing = inFlight.get(requestKey)
  if (existing) {
    return existing
  }

  const params = new URLSearchParams()
  analyticsKeys.forEach((slug) => params.append('paths', slug))

  const promise = fetch(`/.netlify/functions/get-goatcounter-views?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load view counts: ${response.status}`)
      }
      const payload = await response.json()
      const parsed = parseServerCounts(bundles, payload)
      mergeIntoCache(parsed)
      return parsed
    })
    .catch((error) => {
      console.error('View count fetch error:', error)
      throw error
    })
    .finally(() => {
      inFlight.delete(requestKey)
    })

  inFlight.set(requestKey, promise)
  return promise
}

export const useCachedViewCounts = (inputSlugs: string[]) => {
  const slugBundles = useMemo(
    () => prepareSlugBundles(inputSlugs),
    [inputSlugs.join('|')],
  )

  const slugKeys = useMemo(() => extractKeys(slugBundles), [slugBundles])

  const [viewCounts, setViewCounts] = useState<ViewCountMap>(() => getSnapshotFor(slugKeys))
  const [loading, setLoading] = useState(() => needsRefresh(slugKeys))

  const key = useMemo(() => slugKeys.join('|'), [slugKeys])

  useEffect(() => {
    if (!isBrowser) return
    setViewCounts(getSnapshotFor(slugKeys))
    setLoading(needsRefresh(slugKeys))
  }, [key, slugKeys])

  useEffect(() => {
    if (!isBrowser) return
    if (slugKeys.length === 0) {
      setLoading(false)
      return
    }

    if (!needsRefresh(slugKeys)) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    requestCounts(slugBundles)
      .then((counts) => {
        if (cancelled) return
        setViewCounts((prev) => ({ ...prev, ...counts }))
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [key, slugBundles, slugKeys])

  const refresh = useCallback(() => {
    if (!isBrowser || slugKeys.length === 0) {
      return Promise.resolve({} as ViewCountMap)
    }

    return requestCounts(slugBundles).then((counts) => {
      setViewCounts((prev) => ({ ...prev, ...counts }))
      return counts
    })
  }, [slugBundles, slugKeys])

  return { viewCounts, loading, refresh }
}
