import React, { useEffect, useMemo, useState } from 'react'
import { bundleSlug } from 'utils/slug'
import {
  getOptimisticBoost,
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
  const [boost, setBoost] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setBoost(getOptimisticBoost(slugKey))
    return subscribeOptimisticViews(() => {
      setBoost(getOptimisticBoost(slugKey))
    })
  }, [slugKey])

  const entry = viewCounts?.[slugKey]
  const effectiveBoost = mounted ? boost : 0
  const rawTotal = entry ? entry.total + effectiveBoost : effectiveBoost > 0 ? effectiveBoost : undefined
  const total = rawTotal !== undefined ? formatter.format(rawTotal) : undefined
  const unique = entry ? formatter.format(entry.unique) : undefined

  const display =
    total ??
    (loading ? '…' : '0')

  return (
    <span
      className={className}
      style={{
        color: '#666',
        fontSize: '12px',
        fontWeight: '400',
      }}
      aria-label="views"
      title={unique ? `총 ${total}회 (고유 ${unique}회)` : undefined}
    >
      {display} view{rawTotal !== 1 ? 's' : ''}
    </span>
  )
}

export default BatchViewCounter
