import React, { useState, useMemo, useEffect } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/Layout"
import BatchViewCounter from "../components/BatchViewCounter"
import { useBatchViewCounts } from "../hooks/useBatchViewCounts"

interface BlogIndexProps {
  data: {
    site: {
      siteMetadata: {
        title: string
        description: string
      }
    }
    allMarkdownRemark: {
      nodes: {
        excerpt: string
        fields: {
          slug: string
        }
        frontmatter: {
          date: string
          title: string
          description?: string
          category: string
        }
      }[]
    }
  }
}

const BlogIndex: React.FC<BlogIndexProps> = ({ data }) => {
  const siteDescription = data.site.siteMetadata?.description || ``
  const posts = data.allMarkdownRemark.nodes

  // 모든 slug 추출하여 배치로 조회수 가져오기
  const allSlugs = useMemo(() => posts.map(post => post.fields.slug), [posts])
  const { viewCounts } = useBatchViewCounts(allSlugs)

  // 모든 카테고리 추출 (전체를 첫 번째로)
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(posts.map(post => post.frontmatter.category))
    ).sort()
    return ["전체", ...uniqueCategories]
  }, [posts])

  // 카테고리 필터 상태
  const [selectedCategory, setSelectedCategory] = useState("전체")

  // URL 해시에서 카테고리 읽기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1) // # 제거
      if (hash && categories.includes(hash)) {
        setSelectedCategory(hash)
      }
    }
  }, [categories])

  // 카테고리 변경 시 URL 해시 업데이트
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (typeof window !== 'undefined') {
      if (category === "전체") {
        window.history.replaceState(null, '', window.location.pathname)
      } else {
        window.history.replaceState(null, '', `#${encodeURIComponent(category)}`)
      }
    }
  }

  // 각 카테고리별 포스트 개수 계산
  const getCategoryCount = (category: string) => {
    if (category === "전체") {
      return posts.length
    }
    return posts.filter(post => post.frontmatter.category === category).length
  }

  // 선택된 카테고리에 따라 포스트 필터링
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "전체") {
      return posts
    }
    return posts.filter(post => post.frontmatter.category === selectedCategory)
  }, [posts, selectedCategory])

  if (posts.length === 0) {
    return (
      <Layout title="홈" description={siteDescription}>
        <main>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>
            아직 블로그 포스트가 없습니다. 첫 번째 포스트를 작성해보세요!
          </p>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#888' }}>
              <code>contents/</code> 폴더에 마크다운 파일을 추가하세요.
            </p>
          </div>
        </main>
      </Layout>
    )
  }

  return (
    <Layout 
      title="홈" 
      description={siteDescription}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      getCategoryCount={getCategoryCount}
    >

      <main>
        <div>
          {filteredPosts.map((post, index) => {
            const title = post.frontmatter.title || post.fields.slug

            return (
              <article
                key={post.fields.slug}
                style={{
                  padding: '24px 0',
                  borderBottom: index < filteredPosts.length - 1 ? '1px solid #e8e4db' : 'none'
                }}
              >
                {/* 통합된 카드 레이아웃 */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {/* 카테고리 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-start',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#f0ede6',
                      color: '#4a453e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.2'
                    }}>
                      {post.frontmatter.category}
                    </span>
                  </div>
                  
                  {/* 타이틀 */}
                  <h2 style={{ 
                    margin: 0, 
                    padding: 0, 
                    lineHeight: '1.2',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Link
                      to={post.fields.slug}
                      style={{
                        textDecoration: 'none',
                        color: '#2d2823',
                        fontSize: '20px', // 24px에서 20px로 한단계 작게
                        lineHeight: '1.2',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {title}
                    </Link>
                  </h2>
                  
                  {/* 설명 섹션 */}
                  <p
                    style={{
                      margin: 0,
                      lineHeight: '1.6',
                      color: '#4a453e'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                  />
                  
                  {/* 업로드일 + 조회수 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-start',
                    gap: '8px',
                    flexWrap: 'nowrap'
                  }}
                  className="card-meta-container"
                  >
                    {/* 업로드일 */}
                    <span style={{
                      color: '#666',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {post.frontmatter.date.replace(/년|월|일/g, '').replace(/\s+/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')}
                    </span>
                    
                    {/* 구분선 */}
                    <div style={{
                      width: '1px',
                      height: '12px',
                      background: '#d4cfc4',
                      flexShrink: 0
                    }}></div>
                    
                    {/* 조회수 */}
                    <span style={{
                      color: '#666',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      <BatchViewCounter 
                        slug={post.fields.slug} 
                        viewCounts={viewCounts}
                      />
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        
        {/* 필터링 결과가 없을 때 */}
        {filteredPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666', fontSize: '18px' }}>
              '{selectedCategory}' 카테고리에 포스트가 없습니다.
            </p>
            <button
              onClick={() => setSelectedCategory("전체")}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#8b7d6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              전체 포스트 보기
            </button>
          </div>
        )}
      </main>
      
      {/* 반응형 스타일 */}
      <style>
        {`
          @media (max-width: 768px) {
            /* 카드 내부 요소들 모바일 최적화 - 한 줄로 유지 */
            .card-meta-container {
              gap: 8px !important;
              flex-wrap: nowrap !important;
            }
            
            .card-meta-container span {
              font-size: 13px !important;
            }
            
            .card-meta-container svg {
              width: 12px !important;
              height: 12px !important;
            }
          }
          
          @media (max-width: 480px) {
            /* 매우 작은 화면에서도 한 줄로 유지 */
            .card-meta-container {
              flex-direction: row !important;
              align-items: center !important;
              gap: 8px !important;
              flex-wrap: nowrap !important;
            }
            
            /* 텍스트 크기 조정 */
            .card-meta-container span {
              font-size: 12px !important;
            }
          }
        `}
      </style>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "YYYY년 MM월 DD일")
          title
          description
          category
        }
      }
    }
  }
` 