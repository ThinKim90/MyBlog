import React, { useEffect, useState } from 'react'
import Giscus from '@giscus/react'

interface GiscusCommentsProps {
  repo: string
  repoId: string
  category: string
  categoryId: string
  discussionTerm: string
}

const GiscusComments: React.FC<GiscusCommentsProps> = ({
  repo,
  repoId,
  category,
  categoryId,
  discussionTerm
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666'
      }}>
        댓글을 불러오는 중...
      </div>
    )
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <Giscus
        key={discussionTerm}
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="specific"
        term={discussionTerm}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="preferred_color_scheme"
        lang="ko"
        loading="lazy"
      />
    </div>
  )
}

export default GiscusComments
