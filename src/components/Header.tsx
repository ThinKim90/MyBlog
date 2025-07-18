import React from "react"
import { Link } from "gatsby"

interface HeaderProps {
  siteTitle?: string
}

const Header: React.FC<HeaderProps> = ({ siteTitle = "" }) => {
  return (
    <header style={{
      background: '#f8f6f0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '800px',
        height: '140px',
        margin: '0 auto',
        padding: '1rem 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* 로고/사이트 제목 - 좌측 */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center'
        }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: '#2d2823',
              fontSize: '32px',
              fontWeight: '400',
              fontFamily: "'Darker Grotesque', sans-serif",
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {siteTitle}
          </Link>
        </div>

        {/* 네비게이션 메뉴 - 우측 */}
        <nav style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <Link
            to="/about"
            style={{
              color: '#4a453e',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2d2823'
              e.currentTarget.style.background = '#e8e4db'
              e.currentTarget.style.borderColor = '#d4cfc4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4a453e'
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            👋 About
          </Link>
        </nav>
      </div>

      {/* 모바일 반응형 스타일 */}
      <style>
        {`
          @media (max-width: 768px) {
            header > div > div:first-child {
              flex: 1;
            }
            
            header > div > div:first-child a {
              font-size: 24px !important;
            }
            
            header > div > div:first-child span {
              font-size: 28px !important;
            }
            
            header nav a {
              font-size: 14px !important;
              padding: 6px 12px !important;
            }
          }
          
          @media (max-width: 480px) {
            header > div {
              flex-direction: column !important;
              gap: 15px !important;
            }
            
            header > div > div:first-child {
              width: 100%;
              justify-content: center;
            }
            
            header nav {
              justify-content: center;
              width: 100%;
            }
          }
        `}
      </style>
    </header>
  )
}

export default Header 