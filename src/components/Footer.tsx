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

  const iconLinkStyle: React.CSSProperties = {
    color: theme.color.text.tertiary,
    textDecoration: 'none',
    transition: theme.transition.normal,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px'
  }

  const iconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    display: 'block'
  }

  const connectSectionStyle: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: '100%'
  }

  const iconGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.space[3],
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  }
  

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
          <div style={connectSectionStyle}>
            <div style={iconGroupStyle}>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                style={iconLinkStyle}
                aria-label="GitHub"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.color.text.secondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.color.text.tertiary
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                  style={iconStyle}
                >
                  <path
                    fill="currentColor"
                    d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.11 3.31 9.44 7.9 10.97.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.21.7-3.89-1.55-3.89-1.55-.53-1.36-1.29-1.72-1.29-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.21 1.78 1.21 1.04 1.78 2.72 1.26 3.39.96.1-.75.41-1.26.75-1.55-2.56-.3-5.25-1.28-5.25-5.68 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.52.11-3.18 0 0 .98-.31 3.21 1.19a11.14 11.14 0 0 1 5.84 0c2.22-1.5 3.2-1.19 3.2-1.19.63 1.66.23 2.88.11 3.18.75.81 1.2 1.84 1.2 3.1 0 4.41-2.7 5.38-5.27 5.67.42.36.8 1.08.8 2.18 0 1.58-.02 2.86-.02 3.24 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.74 18.27.5 12 .5Z"
                  />
                </svg>
              </a>

              <a
                href={`mailto:${contact.email}`}
                target="_blank"
                rel="noopener noreferrer"
                style={iconLinkStyle}
                aria-label="Email"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.color.text.secondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.color.text.tertiary
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                  style={iconStyle}
                >
                  <path
                    fill="currentColor"
                    d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.01l8 5 8-5V6H4Zm16 12V9.24l-7.45 4.66a1 1 0 0 1-1.1 0L4 9.24V18h16Z"
                  />
                </svg>
              </a>

              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={iconLinkStyle}
                aria-label="LinkedIn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.color.text.secondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.color.text.tertiary
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                  style={iconStyle}
                >
                  <path
                    fill="currentColor"
                    d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.89 1.63-1.82 3.36-1.82 3.59 0 4.26 2.36 4.26 5.43v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45Z"
                  />
                </svg>
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
