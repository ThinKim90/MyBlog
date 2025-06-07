import React, { useState, useMemo } from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"

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
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const siteDescription = data.site.siteMetadata?.description || ``
  const posts = data.allMarkdownRemark.nodes

  // 카테고리 필터 상태
  const [selectedCategory, setSelectedCategory] = useState("전체")

  // 모든 카테고리 추출 (전체를 첫 번째로)
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(posts.map(post => post.frontmatter.category))
    ).sort()
    return ["전체", ...uniqueCategories]
  }, [posts])

  // 선택된 카테고리에 따라 포스트 필터링
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "전체") {
      return posts
    }
    return posts.filter(post => post.frontmatter.category === selectedCategory)
  }, [posts, selectedCategory])

  if (posts.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Helmet title={siteTitle} />
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '10px', color: '#333' }}>{siteTitle}</h1>
          <p style={{ color: '#666', fontSize: '18px' }}>{siteDescription}</p>
        </header>
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
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Helmet title={siteTitle} />
      
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '10px', color: '#333' }}>{siteTitle}</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>{siteDescription}</p>
      </header>

      {/* 카테고리 필터 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>
          카테고리
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                border: '2px solid #ddd',
                borderRadius: '20px',
                background: selectedCategory === category ? '#0066cc' : 'white',
                color: selectedCategory === category ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedCategory === category ? '600' : '400',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = '#0066cc'
                  e.currentTarget.style.color = '#0066cc'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.color = '#333'
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* 필터링된 포스트 개수 표시 */}
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          {selectedCategory === "전체" 
            ? `총 ${posts.length}개의 포스트` 
            : `'${selectedCategory}' 카테고리: ${filteredPosts.length}개의 포스트`
          }
        </p>
      </div>

      <main>
        <div>
          {filteredPosts.map(post => {
            const title = post.frontmatter.title || post.fields.slug

            return (
              <article
                key={post.fields.slug}
                style={{
                  marginBottom: '40px',
                  padding: '20px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <header>
                  {/* 카테고리 태그 */}
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {post.frontmatter.category}
                    </span>
                  </div>
                  
                  <h2 style={{ marginBottom: '10px' }}>
                    <Link
                      to={post.fields.slug}
                      style={{
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '24px'
                      }}
                    >
                      {title}
                    </Link>
                  </h2>
                  <small style={{ color: '#666' }}>{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    style={{
                      marginTop: '15px',
                      lineHeight: '1.6',
                      color: '#555'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                  />
                </section>
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
                background: '#0066cc',
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
    </div>
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