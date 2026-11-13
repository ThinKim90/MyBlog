import React from 'react'
import BatchViewCounter from './BatchViewCounter'
import { useCachedViewCounts } from '../hooks/useCachedViewCounts'

const ViewCounter: React.FC<{ slug: string; className?: string }> = ({ slug, className }) => {
  const { viewCounts, loading } = useCachedViewCounts([slug])
  return <BatchViewCounter slug={slug} className={className} viewCounts={viewCounts} loading={loading} />
}

export default ViewCounter
