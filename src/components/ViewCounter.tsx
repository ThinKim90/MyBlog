import React, { useState, useEffect } from 'react'

interface ViewCounterProps {
  slug: string
  className?: string
}

const ViewCounter: React.FC<ViewCounterProps> = ({ slug, className }) => {
  const [viewCount, setViewCount] = useState<number>(0)

  useEffect(() => {
    // Netlify Functions를 통해 GoatCounter API 호출
    const fetchViewCount = async () => {
      try {
        // 페이지 경로 정리
        const pagePath = slug.startsWith('/') ? slug : `/${slug}`
        console.log('ViewCounter: 조회수 요청 시작', { slug, pagePath })
        
        // Netlify Functions API 호출 (CORS 문제 해결)
        const response = await fetch(`/.netlify/functions/get-goatcounter-views?pathname=${encodeURIComponent(pagePath)}`)
        
        console.log('ViewCounter: API 응답 상태', { status: response.status, ok: response.ok })
        
        if (response.ok) {
          const data = await response.json()
          console.log('ViewCounter: API 응답 데이터', data)
          
          if (data.success) {
            setViewCount(data.viewCount)
            console.log('ViewCounter: 조회수 설정 완료', { viewCount: data.viewCount })
          } else {
            console.error('ViewCounter: API 오류:', data.error)
            setViewCount(0)
          }
        } else {
          const errorText = await response.text()
          console.error('ViewCounter: API 호출 실패:', { 
            status: response.status, 
            statusText: response.statusText,
            error: errorText 
          })
          setViewCount(0)
        }
      } catch (error) {
        console.error('ViewCounter: 조회수 추적 오류:', error)
        setViewCount(0)
      }
    }

    fetchViewCount()
  }, [slug])

  return (
    <span className={className} style={{ 
      color: '#666', 
      fontSize: '12px',
      fontWeight: '400'
    }}>
      {viewCount.toLocaleString()} view
    </span>
  )
}

export default ViewCounter