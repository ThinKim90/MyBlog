import React from "react"
import { Link } from "gatsby"
import { useTheme } from "../styles/ThemeProvider"
import { Code2, User } from "lucide-react"

interface HeaderProps {
  siteTitle?: string
  categories?: string[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  getCategoryCount?: (category: string) => number
}

const Header: React.FC<HeaderProps> = ({ 
  siteTitle = "", 
  categories = [], 
  selectedCategory = "전체", 
  onCategoryChange,
  getCategoryCount 
}) => {
  const theme = useTheme()
  
  return (
    <header style={{
      background: theme.color.background.primary,
      position: 'sticky',
      top: 0,
      zIndex: theme.zIndex.sticky
    }}>
      {/* 상단: 로고와 네비게이션 */}
      <div style={{
        maxWidth: '800px',
        height: '80px',
        margin: '0 auto',
        padding: `${theme.space[4]} ${theme.space[5]}`,
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
              color: theme.color.text.primary,
              fontSize: theme.text.siteTitle.fontSize,
              fontWeight: theme.text.siteTitle.fontWeight,
              fontFamily: "'Iropke Batang', 'Pretendard Variable', 'Pretendard', serif",
              display: 'flex',
              alignItems: 'center',
              transition: theme.transition.fast,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.color.text.tertiary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.color.text.primary
            }}
          >
            {siteTitle}
          </Link>
        </div>

        {/* 네비게이션 메뉴 - 우측 */}
        <nav style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <Link
            to="/playground"
            style={{
              color: theme.color.text.secondary,
              textDecoration: 'none',
              fontSize: theme.text.button.fontSize,
              fontWeight: theme.text.button.fontWeight,
              padding: `${theme.space[2]} ${theme.space[3]}`,
              borderRadius: theme.border.component.navLink.radius,
              transition: theme.transition.normal,
              border: `1px solid transparent`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.color.text.primary
              e.currentTarget.style.background = theme.color.background.secondary
              e.currentTarget.style.borderColor = theme.color.border.light
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.color.text.secondary
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <Code2 size={16} />
            Playground
          </Link>
          <Link
            to="/about"
            style={{
              color: theme.color.text.secondary,
              textDecoration: 'none',
              fontSize: theme.text.button.fontSize,
              fontWeight: theme.text.button.fontWeight,
              padding: `${theme.space[2]} ${theme.space[3]}`,
              borderRadius: theme.border.component.navLink.radius,
              transition: theme.transition.normal,
              border: `1px solid transparent`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.color.text.primary
              e.currentTarget.style.background = theme.color.background.secondary
              e.currentTarget.style.borderColor = theme.color.border.light
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.color.text.secondary
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <User size={16} />
            About
          </Link>
        </nav>
      </div>

      {/* 하단: 카테고리 필터 */}
      {categories.length > 0 && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: `${theme.space[4]} ${theme.space[5]}`,
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '4px'
          }}
          className="category-filter-container"
          >
            {categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange?.(category)}
                style={{
                  padding: '8px 12px',
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
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
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
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 모바일 반응형 스타일 */}
      <style>
        {`
          @media (max-width: ${theme.breakpoints.md}) {
            header > div:first-child > div:first-child {
              flex: 1;
            }
            
            header > div:first-child > div:first-child a {
              font-size: ${theme.text.siteTitleMobile.fontSize} !important;
            }
            
            header > div:first-child nav a {
              font-size: ${theme.text.bodySmall.fontSize} !important;
              padding: ${theme.space[2]} ${theme.space[3]} !important;
            }
            
            /* 카테고리 필터 모바일 최적화 */
            .category-filter-container {
              gap: 8px !important;
              justify-content: flex-start !important;
            }
            
            .category-filter-container button {
              font-size: 12px !important;
              padding: 6px 12px !important;
            }
          }
          
          @media (max-width: ${theme.breakpoints.sm}) {
            header > div:first-child {
              flex-direction: row !important;
              gap: ${theme.space[4]} !important;
              height: 80px !important;
              padding: ${theme.space[4]} ${theme.space[5]} !important;
            }
            
            header > div:first-child > div:first-child {
              flex: 1;
              justify-content: flex-start;
            }
            
            header > div:first-child nav {
              justify-content: flex-end;
              flex-shrink: 0;
            }
            
            /* 카테고리 필터 작은 화면 최적화 */
            .category-filter-container {
              justify-content: flex-start !important;
            }
          }
        `}
      </style>
    </header>
  )
}

export default Header 