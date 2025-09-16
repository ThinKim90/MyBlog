import React, { useState, useEffect } from 'react'

interface BatchViewCounterProps {
  slug: string
  className?: string
  viewCounts?: Record<string, string>
}

const BatchViewCounter: React.FC<BatchViewCounterProps> = ({ 
  slug, 
  className, 
  viewCounts 
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <span className={className} style={{ 
        color: '#666', 
        fontSize: '12px',
        fontWeight: '400'
      }} aria-label="views">
        … view
      </span>
    )
  }

  const count = viewCounts?.[slug] ?? '…'
  
  return (
    <span className={className} style={{ 
      color: '#666', 
      fontSize: '12px',
      fontWeight: '400'
    }} aria-label="views">
      {count} view
    </span>
  )
}

export default BatchViewCounter
