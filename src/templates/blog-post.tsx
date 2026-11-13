import React, { useEffect } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/Layout"
import BatchViewCounter from "../components/BatchViewCounter"
import DraftBadge from "../components/DraftBadge"
import GiscusComments from "../components/GiscusComments"
import { useCachedViewCounts } from "../hooks/useCachedViewCounts"
import { markOptimisticView } from "../utils/viewCountOptimistic"

interface BlogPostTemplateProps {
  data: {
    site: {
      siteMetadata: {
        title: string
      }
    }
    markdownRemark: {
      id: string
      fields: {
        isDraft: boolean
        slug: string
        slugNoTrailingSlash: string
        analyticsKey: string
      }
      excerpt: string
      html: string
      frontmatter: {
        title: string
        date: string
        dateFormatted: string
        description?: string
        category: string
      }
    }
    previous?: {
      fields: {
        slug: string
      }
      frontmatter: {
        title: string
      }
    }
    next?: {
      fields: {
        slug: string
      }
      frontmatter: {
        title: string
      }
    }
  }
}

const BlogPostTemplate: React.FC<BlogPostTemplateProps> = ({ data }) => {
  const post = data.markdownRemark
  const { previous, next } = data

  // 현재 포스트의 캐시된 조회수 가져오기
  const { viewCounts, loading } = useCachedViewCounts(post.fields.isDraft ? [] : [post.fields.slug])

  useEffect(() => {
    if (!post.fields.isDraft) markOptimisticView(post.fields.slug)
  }, [post.fields.slug, post.fields.isDraft])

  return (
    <Layout 
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    >
      
      {/* 통합된 헤더 레이아웃 */}
      <header style={{ 
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {post.fields.isDraft && <DraftBadge />}
        {/* 카테고리 - 인라인으로 변경 */}
        <span style={{
          display: 'inline-block',
          padding: '4px 8px',
          backgroundColor: '#f0ede6',
          color: '#4a453e',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          width: 'fit-content'
        }}>
          {post.frontmatter.category}
        </span>
        
        {/* 제목 */}
        <h1 style={{ 
          margin: 0,
          color: '#333',
          fontSize: '2rem',
          fontWeight: '600',
          lineHeight: '1.2'
        }}>
          {post.frontmatter.title}
        </h1>
        
        {/* Description - 더 큰 폰트 */}
        {(post.frontmatter.description || post.excerpt) && (
          <p style={{ 
            color: '#4a453e', 
            fontSize: '18px', 
            lineHeight: '1.6',
            margin: 0,
            fontWeight: '400'
          }}>
            {post.frontmatter.description || post.excerpt}
          </p>
        )}
        
        {/* 작성일과 조회수 - 더 작은 폰트 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span style={{ 
            color: '#666', 
            fontSize: '14px',
            fontWeight: '400'
          }}>
            {post.frontmatter.dateFormatted}
          </span>
          {!post.fields.isDraft && <BatchViewCounter
            slug={post.fields.slug} 
            viewCounts={viewCounts}
            loading={loading}
          />}
        </div>
      </header>

      <article>
        <div 
          dangerouslySetInnerHTML={{ __html: post.html }}
          style={{
            lineHeight: '1.6',
            fontSize: '18px',
            color: '#333'
          }}
          className="blog-post-content"
        />
      </article>

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />
      
      {/* 댓글 영역 */}
      {!post.fields.isDraft && <GiscusComments
        repo="ThinKim90/MyBlog"
        repoId="R_kgDOO3u4Jw"
        category="Announcements"
        categoryId="DIC_kwDOO3u4J84CvfJN"
        discussionTerm={post.fields.analyticsKey}
      />}
      
      <nav>
        <ul style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          minHeight: '40px'
        }}>
          <li style={{ flex: '1', textAlign: 'left' }}>
            {previous && (
              <Link 
                to={previous.fields.slug} 
                rel="prev"
                style={{
                  textDecoration: 'none',
                  color: '#4a453e',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2d2823'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4a453e'
                }}
              >
                <span style={{ marginRight: '8px' }}>←</span>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>이전 포스트</div>
                  <div style={{ fontWeight: '500' }}>{previous.frontmatter.title}</div>
                </div>
              </Link>
            )}
          </li>
          <li style={{ flex: '1', textAlign: 'right' }}>
            {next && (
              <Link 
                to={next.fields.slug} 
                rel="next"
                style={{
                  textDecoration: 'none',
                  color: '#4a453e',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '8px 0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2d2823'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4a453e'
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>다음 포스트</div>
                  <div style={{ fontWeight: '500' }}>{next.frontmatter.title}</div>
                </div>
                <span style={{ marginLeft: '8px' }}>→</span>
              </Link>
            )}
          </li>
        </ul>
      </nav>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/" style={{ 
          textDecoration: 'none', 
          color: '#8b7d6b',
          fontSize: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '10px 20px',
          border: '2px solid #e8e4db',
          borderRadius: '25px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#8b7d6b'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = '#8b7d6b'
        }}
        >
          <span style={{ marginRight: '8px' }}>🏠</span>
          블로그 홈으로 돌아가기
        </Link>
      </div>

      {/* 모바일 반응형 스타일 */}
      <style>
        {`
          /* 블로그 포스트 콘텐츠 내 li 요소 스타일 통일 */
          .blog-post-content li {
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: #333 !important;
            margin-bottom: 8px !important;
          }
          
          @media (max-width: 768px) {
            /* 헤더 제목 크기 조정 */
            header h1 {
              font-size: 1.5rem !important; /* 24px */
              line-height: 1.3 !important;
            }
            
            /* Description 크기 조정 */
            header p {
              font-size: 16px !important;
              line-height: 1.5 !important;
            }
            
            /* 작성일과 조회수 레이아웃 조정 */
            header > div:last-child {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 4px !important;
            }
            
            /* 블로그 포스트 본문 크기 조정 */
            .blog-post-content {
              font-size: 16px !important;
            }
            
            /* 블로그 포스트 콘텐츠 내 li 요소 모바일 크기 조정 */
            .blog-post-content li {
              font-size: 16px !important;
            }
            
            /* 네비게이션 모바일 최적화 */
            nav ul {
              flex-direction: column !important;
              gap: 16px !important;
            }
            
            nav li {
              flex: none !important;
              text-align: left !important;
            }
            
            nav li:last-child {
              text-align: left !important;
            }
            
            nav li:last-child a {
              justify-content: flex-start !important;
            }
            
            nav li:last-child a > div {
              text-align: left !important;
            }
          }
          
          @media (max-width: 480px) {
            /* 매우 작은 화면에서 추가 조정 */
            header h1 {
              font-size: 1.25rem !important; /* 20px */
            }
            
            header p {
              font-size: 14px !important;
            }
            
            /* 블로그 포스트 본문 더 작게 */
            .blog-post-content {
              font-size: 14px !important;
            }
            
            /* 블로그 포스트 콘텐츠 내 li 요소 작은 화면 크기 조정 */
            .blog-post-content li {
              font-size: 14px !important;
            }
            
            /* 홈 버튼 크기 조정 */
            div[style*="textAlign: center"] a {
              font-size: 14px !important;
              padding: 8px 16px !important;
            }
          }
        `}
      </style>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      fields {
        isDraft
        slug
        slugNoTrailingSlash
        analyticsKey
      }
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date
        dateFormatted: date(formatString: "YYYY년 M월 D일", locale: "ko")
        description
        category
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
