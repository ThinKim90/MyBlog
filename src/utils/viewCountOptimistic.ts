const SESSION_KEY = 'blog_optimistic_views_v1'
const OPTIMISTIC_EVENT = 'blog-view-optimistic'

const STATIC_ROUTES = new Set(['/', '/about', '/playground', '/404'])

const isBrowser = typeof window !== 'undefined'

const readSessionSet = (): Set<string> => {
  if (!isBrowser) return new Set()
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

const writeSessionSet = (set: Set<string>) => {
  if (!isBrowser) return
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // sessionStorage unavailable
  }
}

const notifyOptimisticChange = () => {
  if (!isBrowser) return
  window.dispatchEvent(new CustomEvent(OPTIMISTIC_EVENT))
}

export const markOptimisticView = (slugKey: string) => {
  if (!slugKey || STATIC_ROUTES.has(slugKey)) return
  const set = readSessionSet()
  if (set.has(slugKey)) return
  set.add(slugKey)
  writeSessionSet(set)
  notifyOptimisticChange()
}

export const hasOptimisticView = (slugKey: string) => readSessionSet().has(slugKey)

export const getOptimisticBoost = (slugKey: string) => (hasOptimisticView(slugKey) ? 1 : 0)

export const shouldTrackOptimisticView = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return !STATIC_ROUTES.has(normalized)
}

export const subscribeOptimisticViews = (listener: () => void) => {
  if (!isBrowser) return () => {}
  window.addEventListener(OPTIMISTIC_EVENT, listener)
  return () => window.removeEventListener(OPTIMISTIC_EVENT, listener)
}
