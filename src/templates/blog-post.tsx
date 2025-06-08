import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/Layout"

interface BlogPostTemplateProps {
  data: {
    site: {
      siteMetadata: {
        title: string
      }
    }
    markdownRemark: {
      id: string
      excerpt: string
      html: string
      frontmatter: {
        title: string
        date: string
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
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data

  return (
    <Layout 
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    >
      
      <header style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '15px' }}>
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
        
        <h1 style={{ marginBottom: '10px', color: '#333' }}>
          {post.frontmatter.title}
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          {post.frontmatter.date}
        </p>
      </header>

      <article>
        <div 
          dangerouslySetInnerHTML={{ __html: post.html }}
          style={{
            lineHeight: '1.6',
            fontSize: '18px',
            color: '#333'
          }}
        />
      </article>

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />
      
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
          border: '2px solid #8b7d6b',
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
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "YYYY년 MM월 DD일")
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