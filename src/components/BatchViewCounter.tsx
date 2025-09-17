import React, { useMemo } from 'react'
import { bundleSlug } from 'utils/slug'
import type { ViewCountMap } from '../hooks/useCachedViewCounts'

interface BatchViewCounterProps {
  slug: string
  className?: string
  viewCounts?: ViewCountMap
}

const skeleton = (
  <span
    className="view-counter-skeleton"
    style={{
      display: 'inline-block',
      width: '20px',
      height: '12px',
      backgroundColor: '#e0e0e0',
      borderRadius: '2px',
    }}
  />
)

const BatchViewCounter: React.FC<BatchViewCounterProps> = ({
  slug,
  className,
  viewCounts,
}) => {
  const formatter = useMemo(() => new Intl.NumberFormat('ko-KR'), [])
  const slugKey = useMemo(() => bundleSlug(slug).withoutTrailingSlash, [slug])
  const entry = viewCounts?.[slugKey]
  const total = entry ? formatter.format(entry.total) : undefined
  const unique = entry ? formatter.format(entry.unique) : undefined

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
      {total ?? skeleton} view{entry && entry.total !== 1 ? 's' : ''}
    </span>
  )
}

export default BatchViewCounter
