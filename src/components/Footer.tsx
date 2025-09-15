import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { useTheme } from "../styles/ThemeProvider"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const theme = useTheme()
  
  const data = useStaticQuery(graphql`
    query FooterQuery {
      site {
        siteMetadata {
          title
          contact {
            email
            github
            linkedin
          }
        }
      }
    }
  `)
  
  const siteTitle = data.site.siteMetadata.title
  const contact = data.site.siteMetadata.contact
  

  return (
    <footer style={{
      background: theme.color.background.primary,
      color: theme.color.text.secondary,
      marginTop: theme.space[20],
      padding: `${theme.space[5]} ${theme.space[5]} ${theme.space[5]}`
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* 구분선 */}
        <div style={{
          borderTop: `1px solid ${theme.color.border.light}`,
          marginBottom: '12px'
        }}></div>
        
        {/* 50:50 균등 배치 레이아웃 */}
        <div style={{
          display: 'flex',
          gap: theme.space[8],
          marginBottom: '12px'
        }}>
          {/* 블로그 소개 - 좌측 50% */}
          <div style={{ flex: '1' }}>
            <h4 style={{
              fontSize: theme.text.subtitle2.fontSize,
              marginBottom: theme.space[3],
              color: theme.color.text.primary,
              fontWeight: theme.text.subtitle2.fontWeight
            }}>
              {siteTitle}
            </h4>
            <p style={{
              fontSize: theme.text.bodySmall.fontSize,
              lineHeight: theme.text.bodySmall.lineHeight,
              color: theme.color.text.secondary,
              margin: '0'
            }}>
              개발, 디자인, 라이프스타일에 대한 이야기를 공유하는 개인 블로그입니다.
              새로운 기술과 경험을 통해 성장하는 과정을 기록하고 있습니다.
            </p>
          </div>

          {/* Connect 링크 - 우측 50% */}
          <div style={{ flex: '1' }}>
            <h4 style={{
              fontSize: theme.text.subtitle2.fontSize,
              marginBottom: theme.space[3],
              color: theme.color.text.primary,
              fontWeight: theme.text.subtitle2.fontWeight
            }}>
              Connect
            </h4>
            <div style={{
              display: 'flex',
              gap: theme.space[3],
              flexWrap: 'wrap'
            }}>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.color.text.secondary,
                  textDecoration: 'none',
                  fontSize: theme.text.bodySmall.fontSize,
                  transition: theme.transition.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.color.text.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.color.text.secondary
                }}
              >
                GitHub
              </a>

              <a
                href={`mailto:${contact.email}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.color.text.secondary,
                  textDecoration: 'none',
                  fontSize: theme.text.bodySmall.fontSize,
                  transition: theme.transition.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.color.text.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.color.text.secondary
                }}
              >
                Email
              </a>

              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.color.text.secondary,
                  textDecoration: 'none',
                  fontSize: theme.text.bodySmall.fontSize,
                  transition: theme.transition.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.color.text.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.color.text.secondary
                }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* 저작권 */}
        <div style={{
          fontSize: theme.text.caption.fontSize,
          color: theme.color.text.tertiary,
          marginTop: '12px'
        }}>
          © {currentYear} {siteTitle}. All rights reserved.
        </div>
      </div>

      {/* 모바일 반응형 스타일 */}
      <style>
        {`
          @media (max-width: ${theme.breakpoints.sm}) {
            footer > div > div:first-child {
              flex-direction: column !important;
              gap: ${theme.space[6]} !important;
            }
            
            footer h4 {
              font-size: ${theme.text.subtitle2.fontSize} !important;
            }
            
            footer p {
              font-size: ${theme.text.caption.fontSize} !important;
            }
            
            footer > div > div:first-child > div:last-child > div {
              gap: ${theme.space[2]} !important;
            }
          }
        `}
      </style>
    </footer>
  )
}

export default Footer 