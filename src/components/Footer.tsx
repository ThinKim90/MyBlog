import React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  
  const data = useStaticQuery(graphql`
    query FooterQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  
  const siteTitle = data.site.siteMetadata.title

  return (
    <footer style={{
      background: '#f8f6f0',
      color: '#4a453e',
      marginTop: '80px',
      padding: '40px 20px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* 상단 섹션 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '30px'
        }}>
          {/* 블로그 소개 */}
          <div>
            <h3 style={{
              fontSize: '20px',
              marginBottom: '15px',
              color: '#2d2823',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📝</span>
              {siteTitle}
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#4a453e',
              margin: '0'
            }}>
              개발, 디자인, 라이프스타일에 대한 이야기를 공유하는 개인 블로그입니다.
              새로운 기술과 경험을 통해 성장하는 과정을 기록하고 있습니다.
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '15px',
              color: '#2d2823'
            }}>
              📁 카테고리
            </h3>
            <ul style={{
              listStyle: 'none',
              margin: '0',
              padding: '0'
            }}>
              {['개발', 'React', '디자인', '라이프스타일', '일반'].map((category) => (
                <li key={category} style={{ marginBottom: '8px' }}>
                  <a
                    href={`/#categories`}
                    style={{
                      color: '#4a453e',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2d2823'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4a453e'
                    }}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 소셜 링크 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '15px',
              color: '#2d2823'
            }}>
              🔗 Connect
            </h3>
            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              <a
                href="https://github.com/kimsaehyoung/MyBlog"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#4a453e',
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#e8e4db',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d4cfc4'
                  e.currentTarget.style.color = '#2d2823'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#e8e4db'
                  e.currentTarget.style.color = '#4a453e'
                }}
              >
                <span style={{ fontSize: '16px' }}>💻</span>
                GitHub
              </a>

              <a
                href="mailto:your.email@example.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#4a453e',
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#e8e4db',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d4cfc4'
                  e.currentTarget.style.color = '#2d2823'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#e8e4db'
                  e.currentTarget.style.color = '#4a453e'
                }}
              >
                <span style={{ fontSize: '16px' }}>📧</span>
                Email
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#4a453e',
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#e8e4db',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d4cfc4'
                  e.currentTarget.style.color = '#2d2823'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#e8e4db'
                  e.currentTarget.style.color = '#4a453e'
                }}
              >
                <span style={{ fontSize: '16px' }}>💼</span>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* 저작권 (구분선 제거) */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b645c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          paddingTop: '20px'
        }}>
          <div>
            © {currentYear} {siteTitle}. All rights reserved.
          </div>
          <div style={{
            display: 'flex',
            gap: '15px',
            fontSize: '12px'
          }}>
            <span>Built with 🤍 using Gatsby</span>
            <span>|</span>
            <a
              href="https://github.com/kimsaehyoung/MyBlog"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#6b645c',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#4a453e'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b645c'
              }}
            >
              View Source
            </a>
          </div>
        </div>
      </div>

      {/* 모바일 반응형 스타일 */}
      <style>
        {`
          @media (max-width: 768px) {
            footer > div > div:last-child {
              flex-direction: column !important;
              text-align: center !important;
              gap: 15px !important;
            }
            
            footer h3 {
              font-size: 16px !important;
            }
            
            footer p {
              font-size: 13px !important;
            }
          }
        `}
      </style>
    </footer>
  )
}

export default Footer 