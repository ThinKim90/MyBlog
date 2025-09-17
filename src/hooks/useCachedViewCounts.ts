import { useState, useEffect, useCallback } from 'react'

interface CachedViewCount {
  count: string
  timestamp: number
}

const CACHE_KEY = 'blog_view_counts'
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// 로컬 스토리지에서 캐시된 조회수 가져오기
const getCachedCounts = (): Record<string, CachedViewCount> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return {}
    
    const parsed = JSON.parse(cached)
    const now = Date.now()
    
    // 만료된 캐시 제거
    const validCache: Record<string, CachedViewCount> = {}
    Object.entries(parsed).forEach(([slug, data]) => {
      const cachedData = data as CachedViewCount
      if (now - cachedData.timestamp < CACHE_DURATION) {
        validCache[slug] = cachedData
      }
    })
    
    return validCache
  } catch {
    return {}
  }
}

// 로컬 스토리지에 조회수 캐시하기
const setCachedCounts = (counts: Record<string, string>) => {
  if (typeof window === 'undefined') return
  
  try {
    const now = Date.now()
    const cachedData: Record<string, CachedViewCount> = {}
    
    Object.entries(counts).forEach(([slug, count]) => {
      cachedData[slug] = {
        count,
        timestamp: now
      }
    })
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData))
  } catch {
    // 로컬 스토리지 오류 무시
  }
}

export const useCachedViewCounts = (slugs: string[]) => {
  const [viewCounts, setViewCounts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // 캐시된 데이터로 즉시 초기화
  useEffect(() => {
    const cached = getCachedCounts()
    const initialCounts: Record<string, string> = {}
    
    slugs.forEach(slug => {
      if (cached[slug]) {
        initialCounts[slug] = cached[slug].count
      }
    })
    
    if (Object.keys(initialCounts).length > 0) {
      setViewCounts(initialCounts)
    }
  }, [slugs])

  // 백그라운드에서 최신 데이터 가져오기
  const fetchLatestCounts = useCallback(async () => {
    if (slugs.length === 0) return

    setLoading(true)
    
    try {
      // 단일 POST 요청으로 모든 슬러그의 조회수 가져오기
      const response = await fetch('/.netlify/functions/get-goatcounter-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slugs }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 응답 데이터를 기존 형식으로 변환
      const countsMap: Record<string, string> = {}
      Object.entries(data).forEach(([slug, viewData]: [string, any]) => {
        countsMap[slug] = String(viewData?.count || '0')
      })

      // 캐시에 저장
      setCachedCounts(countsMap)
      
      // 상태 업데이트
      setViewCounts(prev => ({ ...prev, ...countsMap }))
    } catch (error) {
      console.error('View count fetch error:', error)
      // 실패 시 기존 캐시 데이터 유지 (graceful degradation)
    } finally {
      setLoading(false)
    }
  }, [slugs])

  // 컴포넌트 마운트 시 백그라운드 업데이트
  useEffect(() => {
    // 캐시된 데이터가 있으면 즉시 표시하고 백그라운드에서 업데이트
    const cached = getCachedCounts()
    const hasCachedData = slugs.some(slug => cached[slug])
    
    if (hasCachedData) {
      // 캐시된 데이터가 있으면 백그라운드에서 업데이트
      fetchLatestCounts()
    } else {
      // 캐시된 데이터가 없으면 로딩 표시
      setLoading(true)
      fetchLatestCounts()
    }
  }, [slugs, fetchLatestCounts])

  return { viewCounts, loading, refresh: fetchLatestCounts }
}
