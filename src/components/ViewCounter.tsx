import React, { useState, useEffect, useMemo } from 'react'
import { bundleSlug } from 'utils/slug'
import { useCachedViewCounts } from '../hooks/useCachedViewCounts'

interface ViewCounterProps {
  slug: string
  className?: string
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

const ViewCounter: React.FC<ViewCounterProps> = ({ slug, className }) => {
  const [mounted, setMounted] = useState(false)
  const slugKey = useMemo(() => bundleSlug(slug).withoutTrailingSlash, [slug])
  const { viewCounts, loading } = useCachedViewCounts([slug])
  const entry = viewCounts[slugKey]
  const formatter = useMemo(() => new Intl.NumberFormat('ko-KR'), [])
  const display = entry ? formatter.format(entry.total) : null

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || (loading && !entry)) {
    return (
      <span
        className={className}
        style={{ color: '#666', fontSize: '12px', fontWeight: '400' }}
        aria-label="views"
      >
        {skeleton}
      </span>
    )
  }

  if (!entry) {
    return (
      <span
        className={className}
        style={{ color: '#666', fontSize: '12px', fontWeight: '400' }}
        aria-label="views"
      >
        — view
      </span>
    )
  }

  return (
    <span
      className={className}
      style={{ color: '#666', fontSize: '12px', fontWeight: '400' }}
      aria-label="views"
    >
      {display ?? '0'} view{entry.total !== 1 ? 's' : ''}
    </span>
  )
}

export default ViewCounter
