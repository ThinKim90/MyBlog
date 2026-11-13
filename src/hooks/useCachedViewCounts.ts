import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getViewCountSnapshot,
  primeViewCounts,
  requestViewCounts,
  subscribeViewCounts,
  type ViewCountMap,
} from '../utils/viewCountCache'

export type { ViewCountEntry, ViewCountMap } from '../utils/viewCountCache'

export const useCachedViewCounts = (inputSlugs: string[]) => {
  const key = inputSlugs.join('|')
  const slugs = useMemo(() => inputSlugs.filter(Boolean), [key])
  // The server and the first browser render must match. Restore the cache in
  // the mount effect, before waiting for any network refresh.
  const [viewCounts, setViewCounts] = useState<ViewCountMap>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    const update = () => { if (active) setViewCounts(getViewCountSnapshot(slugs)) }
    const unsubscribe = subscribeViewCounts(update)
    update()
    setLoading(slugs.length > 0)
    void primeViewCounts()
      .then(() => requestViewCounts(slugs))
      .finally(() => { if (active) { update(); setLoading(false) } })
    return () => { active = false; unsubscribe() }
  }, [slugs])

  const refresh = useCallback(() => requestViewCounts(slugs, true), [slugs])
  return { viewCounts, loading, refresh }
}
