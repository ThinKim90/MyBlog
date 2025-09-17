import { useCallback, useEffect, useMemo, useState } from 'react'

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

const parseServerCounts = (slugs: string[], payload: any): ViewCountMap => {
  const nowTs = now()
  const result: ViewCountMap = {}
  const counts = payload?.counts ?? payload ?? {}

  slugs.forEach((slug) => {
    const record = counts[slug] ?? counts[slug.replace(/^\/+/, '')] ?? {}
    const total = Number.parseInt(
      record.total ?? record.count ?? record.views ?? record.count_unique ?? '0',
      10,
    ) || 0
    const unique = Number.parseInt(
      record.unique ?? record.count_unique ?? record.unique_views ?? '0',
      10,
    ) || 0

    result[slug] = {
      total,
      unique,
      resolvedPath: record.resolved || slug,
      fetchedAt: nowTs,
    }
  })

  return result
}

const requestCounts = (slugs: string[]): Promise<ViewCountMap> => {
  if (!isBrowser || slugs.length === 0) {
    return Promise.resolve({})
  }

  const uniqueSlugs = Array.from(new Set(slugs))
  const requestKey = uniqueSlugs.slice().sort().join('|')

  const existing = inFlight.get(requestKey)
  if (existing) {
    return existing
  }

  const params = new URLSearchParams()
  uniqueSlugs.forEach((slug) => params.append('paths', slug))

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
      const parsed = parseServerCounts(uniqueSlugs, payload)
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
  const uniqueSlugs = useMemo(
    () => Array.from(new Set(inputSlugs.filter(Boolean))),
    [inputSlugs.join('|')],
  )

  const [viewCounts, setViewCounts] = useState<ViewCountMap>(() => getSnapshotFor(uniqueSlugs))
  const [loading, setLoading] = useState(() => needsRefresh(uniqueSlugs))

  const key = useMemo(() => uniqueSlugs.join('|'), [uniqueSlugs])

  useEffect(() => {
    if (!isBrowser) return
    setViewCounts(getSnapshotFor(uniqueSlugs))
    setLoading(needsRefresh(uniqueSlugs))
  }, [key, uniqueSlugs])

  useEffect(() => {
    if (!isBrowser) return
    if (uniqueSlugs.length === 0) {
      setLoading(false)
      return
    }

    if (!needsRefresh(uniqueSlugs)) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    requestCounts(uniqueSlugs)
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
  }, [key, uniqueSlugs])

  const refresh = useCallback(() => {
    if (!isBrowser || uniqueSlugs.length === 0) {
      return Promise.resolve({} as ViewCountMap)
    }

    return requestCounts(uniqueSlugs).then((counts) => {
      setViewCounts((prev) => ({ ...prev, ...counts }))
      return counts
    })
  }, [key, uniqueSlugs])

  return { viewCounts, loading, refresh }
}
