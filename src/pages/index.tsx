import React, { useState, useMemo } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/Layout"

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
    <Layout title="홈" description={siteDescription}>
      {/* 카테고리 필터 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                background: selectedCategory === category ? '#8b7d6b' : 'transparent',
                color: selectedCategory === category ? 'white' : '#6b645c',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedCategory === category ? '600' : '400',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.color = '#4a453e'
                  e.currentTarget.style.background = '#f0ede6'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.color = '#6b645c'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
              onFocus={(e) => {
                // 접근성: 포커스를 위한 미묘한 배경 변화만 (테두리 없이)
                if (selectedCategory === category) {
                  e.currentTarget.style.background = '#6b645c'
                } else {
                  e.currentTarget.style.background = '#e8e4db'
                  e.currentTarget.style.color = '#2d2823'
                }
              }}
              onBlur={(e) => {
                if (selectedCategory === category) {
                  e.currentTarget.style.background = '#8b7d6b'
                } else {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#6b645c'
                }
              }}
              aria-pressed={selectedCategory === category}
              role="button"
              tabIndex={0}
            >
              {category} ({getCategoryCount(category)})
            </button>
          ))}
        </div>
      </div>

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
                <header>
                  {/* 카테고리 태그 */}
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#f0ede6',
                      color: '#4a453e',
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
                        color: '#2d2823',
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
                      color: '#4a453e'
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