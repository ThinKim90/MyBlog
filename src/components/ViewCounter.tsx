import React, { useState, useEffect } from 'react'

interface ViewCounterProps {
  slug: string
  className?: string
}

const ViewCounter: React.FC<ViewCounterProps> = ({ slug, className }) => {
  const [mounted, setMounted] = useState(false)
  const [count, setCount] = useState<string | null>(null)

  // 1) SSR 단계에선 placeholder만 렌더 → hydration 안전
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return

    // GoatCounter가 정규화한 경로를 우선 사용
    const path = (window as any).goatcounter?.get_data?.().p ?? window.location.pathname

    ;(async () => {
      try {
        const r = await fetch(
          `/.netlify/functions/get-goatcounter-views?pathname=${encodeURIComponent(path)}`
        )
        const text = await r.text()

        // 중요: 상태코드와 무관하게 먼저 바디를 파싱
        // (404면서도 {count:"0"}을 주는 경우가 있음)
        let body: any = {}
        try {
          body = JSON.parse(text)
        } catch {
          body = {}
        }

        const val = body.viewCount ?? body.count ?? null

        if (val != null) setCount(String(val))
        else if (r.ok) setCount('0') // 200인데 값이 없으면 0으로
        else setCount('0')           // 404 등도 0으로 표시 (실패로 취급하지 않음)
      } catch {
        setCount('—')                // 네트워크 에러 등만 실패 표시
      }
    })()
  }, [mounted])

  if (!mounted) {
    return (
      <span className={className} style={{ 
        color: '#666', 
        fontSize: '12px',
        fontWeight: '400'
      }} aria-label="views">
        <span 
          className="view-counter-skeleton"
          style={{
            display: 'inline-block',
            width: '20px',
            height: '12px',
            backgroundColor: '#e0e0e0',
            borderRadius: '2px'
          }} 
        />
      </span>
    )
  }
  
  return (
    <span className={className} style={{ 
      color: '#666', 
      fontSize: '12px',
      fontWeight: '400'
    }} aria-label="views">
      {count ?? (
        <span 
          className="view-counter-skeleton"
          style={{
            display: 'inline-block',
            width: '20px',
            height: '12px',
            backgroundColor: '#e0e0e0',
            borderRadius: '2px'
          }} 
        />
      )} view
    </span>
  )
}

export default ViewCounter