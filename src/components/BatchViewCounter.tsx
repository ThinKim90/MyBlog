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
        <span style={{
          display: 'inline-block',
          width: '20px',
          height: '12px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </span>
    )
  }

  const count = viewCounts?.[slug]
  
  return (
    <span className={className} style={{ 
      color: '#666', 
      fontSize: '12px',
      fontWeight: '400'
    }} aria-label="views">
      {count ?? (
        <span style={{
          display: 'inline-block',
          width: '20px',
          height: '12px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      )} view
    </span>
  )
}

export default BatchViewCounter
