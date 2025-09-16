import { useState, useEffect } from 'react'

export const useBatchViewCounts = (slugs: string[]) => {
  const [viewCounts, setViewCounts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slugs.length === 0) {
      setLoading(false)
      return
    }

    const fetchBatchCounts = async () => {
      try {
        // 모든 slug에 대해 병렬로 요청
        const promises = slugs.map(async (slug) => {
          try {
            const r = await fetch(
              `/.netlify/functions/get-goatcounter-views?pathname=${encodeURIComponent(slug)}`
            )
            const text = await r.text()
            let body: any = {}
            try {
              body = JSON.parse(text)
            } catch {
              body = {}
            }
            const count = body.viewCount ?? body.count ?? '0'
            return { slug, count: String(count) }
          } catch {
            return { slug, count: '0' }
          }
        })

        const results = await Promise.all(promises)
        const countsMap = results.reduce((acc, { slug, count }) => {
          acc[slug] = count
          return acc
        }, {} as Record<string, string>)

        setViewCounts(countsMap)
      } catch (error) {
        console.error('Batch view count fetch error:', error)
        // 에러 시 모든 카운트를 0으로 설정
        const fallbackCounts = slugs.reduce((acc, slug) => {
          acc[slug] = '0'
          return acc
        }, {} as Record<string, string>)
        setViewCounts(fallbackCounts)
      } finally {
        setLoading(false)
      }
    }

    fetchBatchCounts()
  }, [slugs])

  return { viewCounts, loading }
}
