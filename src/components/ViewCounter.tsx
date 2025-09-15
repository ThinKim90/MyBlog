import React, { useState, useEffect } from 'react'

interface ViewCounterProps {
  slug: string
  className?: string
}

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
  }
}

const ViewCounter: React.FC<ViewCounterProps> = ({ slug, className }) => {
  const [viewCount, setViewCount] = useState<number>(0)

  useEffect(() => {
    // 페이지 로드 시 조회수 추적
    const trackPageView = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-VRP0Q2EFL6', {
          page_title: document.title,
          page_location: window.location.href,
          custom_map: {
            'custom_parameter_1': slug
          }
        })
      }
    }

    // GA4 API에서 실제 조회수 가져오기
    const fetchViewCount = async () => {
      try {
        // 현재 페이지 경로 생성
        const pagePath = slug.startsWith('/') ? slug : `/${slug}`
        
        // Netlify Functions API 호출
        const response = await fetch(`/.netlify/functions/get-page-views?pathname=${encodeURIComponent(pagePath)}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setViewCount(data.pageViews)
          } else {
            console.error('GA4 API 오류:', data.error)
            // 오류 시 기본값 설정
            setViewCount(0)
          }
        } else {
          console.error('API 호출 실패:', response.status)
          setViewCount(0)
        }
        
        // 페이지뷰 추적 (GA4에 데이터 전송)
        trackPageView()
      } catch (error) {
        console.error('조회수 추적 오류:', error)
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