import React, { useEffect, useMemo, useState } from 'react'
import { bundleSlug } from 'utils/slug'
import {
  getOptimisticTotal,
  subscribeOptimisticViews,
} from 'utils/viewCountOptimistic'
import type { ViewCountMap } from '../hooks/useCachedViewCounts'

interface BatchViewCounterProps {
  slug: string
  className?: string
  viewCounts?: ViewCountMap
  loading?: boolean
}

const BatchViewCounter: React.FC<BatchViewCounterProps> = ({
  slug,
  className,
  viewCounts,
  loading = false,
}) => {
  const formatter = useMemo(() => new Intl.NumberFormat('ko-KR'), [])
  const slugKey = useMemo(() => bundleSlug(slug).withoutTrailingSlash, [slug])
  const entry = viewCounts?.[slugKey]
  const [optimistic, setOptimistic] = useState<number | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () => setOptimistic(getOptimisticTotal(slugKey, entry?.total))
    update()
    return subscribeOptimisticViews(update)
  }, [slugKey, entry?.total])

  const rawTotal = mounted && optimistic !== undefined
    ? Math.max(entry?.total ?? 0, optimistic)
    : entry?.total
  const total = rawTotal !== undefined ? formatter.format(rawTotal) : undefined

  const display =
    total ??
    (loading ? '…' : '—')

  return (
    <span
      className={className}
      style={{
        color: '#666',
        fontSize: '12px',
        fontWeight: '400',
      }}
      suppressHydrationWarning
      aria-label={total ? `누적 방문 ${total}회` : '방문 수 확인 중'}
      title={total ? `누적 방문 ${total}회 · 집계값은 늦게 반영될 수 있습니다.` : '방문 수를 아직 확인하지 못했습니다.'}
    >
      {display} view{rawTotal !== 1 ? 's' : ''}
    </span>
  )
}

export default BatchViewCounter
