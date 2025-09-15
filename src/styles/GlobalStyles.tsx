import React from 'react'
import { Helmet } from 'react-helmet'
import { useTheme } from './ThemeProvider'

// 글로벌 스타일을 관리하는 컴포넌트
export const GlobalStyles: React.FC = () => {
  const theme = useTheme()

  const globalCSS = `
    /* 이로프케바탕체 폰트 정의 */
    @import url('//cdn.jsdelivr.net/font-iropke-batang/1.2/font-iropke-batang.css');

    /* CSS 변수 정의 - 디자인 토큰을 CSS 커스텀 프로퍼티로 노출 */
    :root {
      /* 색상 변수 */
      --color-primary-50: ${theme.color.primary[50]};
      --color-primary-100: ${theme.color.primary[100]};
      --color-primary-200: ${theme.color.primary[200]};
      --color-primary-300: ${theme.color.primary[300]};
      --color-primary-400: ${theme.color.primary[400]};
      --color-primary-500: ${theme.color.primary[500]};
      --color-primary-600: ${theme.color.primary[600]};
      --color-primary-700: ${theme.color.primary[700]};
      --color-primary-800: ${theme.color.primary[800]};
      --color-primary-900: ${theme.color.primary[900]};
      
      --color-background-primary: ${theme.color.background.primary};
      --color-background-secondary: ${theme.color.background.secondary};
      --color-background-accent: ${theme.color.background.accent};
      
      --color-text-primary: ${theme.color.text.primary};
      --color-text-secondary: ${theme.color.text.secondary};
      --color-text-tertiary: ${theme.color.text.tertiary};
      --color-text-muted: ${theme.color.text.muted};
      
      --color-border-light: ${theme.color.border.light};
      --color-border-default: ${theme.color.border.default};
      --color-border-strong: ${theme.color.border.strong};
      
      --color-interactive-hover: ${theme.color.interactive.hover};
      --color-interactive-active: ${theme.color.interactive.active};
      --color-interactive-focus: ${theme.color.interactive.focus};
      
      /* 타이포그래피 변수 */
      --font-family-primary: ${theme.font.primary};
      --font-family-heading: ${theme.font.heading};
      --font-family-mono: ${theme.font.mono};
      --font-family-decorative: ${theme.font.decorative};
      
      /* 간격 변수 */
      --space-1: ${theme.space[1]};
      --space-2: ${theme.space[2]};
      --space-3: ${theme.space[3]};
      --space-4: ${theme.space[4]};
      --space-5: ${theme.space[5]};
      --space-6: ${theme.space[6]};
      --space-8: ${theme.space[8]};
      --space-10: ${theme.space[10]};
      --space-12: ${theme.space[12]};
      --space-16: ${theme.space[16]};
      --space-20: ${theme.space[20]};
      --space-24: ${theme.space[24]};
      
      /* 보더 반경 변수 */
      --border-radius-sm: ${theme.border.radius.sm};
      --border-radius-base: ${theme.border.radius.base};
      --border-radius-md: ${theme.border.radius.md};
      --border-radius-lg: ${theme.border.radius.lg};
      --border-radius-xl: ${theme.border.radius.xl};
      
      /* 그림자 변수 */
      --shadow-sm: ${theme.shadow.sm};
      --shadow-base: ${theme.shadow.base};
      --shadow-md: ${theme.shadow.md};
      --shadow-lg: ${theme.shadow.lg};
      --shadow-xl: ${theme.shadow.xl};
      
      /* 트랜지션 변수 */
      --transition-fast: ${theme.transition.fast};
      --transition-normal: ${theme.transition.normal};
      --transition-slow: ${theme.transition.slow};
      --transition-bounce: ${theme.transition.bounce};
    }

    /* 기본 리셋 */
    * {
      box-sizing: border-box;
    }
    
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* 기본 요소 스타일 */
    html {
      scroll-behavior: smooth;
      font-size: 16px;
      line-height: 1.6;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: var(--color-background-primary);
      min-height: 100vh;
      font-family: var(--font-family-primary);
      line-height: ${theme.text.body.lineHeight};
      color: var(--color-text-primary);
      word-break: keep-all;
      word-wrap: break-word;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* 헤딩 스타일 */
    h1 {
      font-size: ${theme.text.h1.fontSize};
      font-weight: ${theme.text.h1.fontWeight};
      line-height: ${theme.text.h1.lineHeight};
      letter-spacing: ${theme.text.h1.letterSpacing};
      font-family: ${theme.text.h1.fontFamily};
      margin-top: 0;
      margin-bottom: var(--space-6);
      color: var(--color-text-primary);
    }
    
    h2 {
      font-size: ${theme.text.h2.fontSize};
      font-weight: ${theme.text.h2.fontWeight};
      line-height: ${theme.text.h2.lineHeight};
      letter-spacing: ${theme.text.h2.letterSpacing};
      font-family: ${theme.text.h2.fontFamily};
      margin-top: var(--space-8);
      margin-bottom: var(--space-4);
      color: var(--color-text-primary);
    }
    
    h3 {
      font-size: ${theme.text.h3.fontSize};
      font-weight: ${theme.text.h3.fontWeight};
      line-height: ${theme.text.h3.lineHeight};
      font-family: ${theme.text.h3.fontFamily};
      margin-top: var(--space-6);
      margin-bottom: var(--space-3);
      color: var(--color-text-primary);
    }
    
    h4 {
      font-size: ${theme.text.h4.fontSize};
      font-weight: ${theme.text.h4.fontWeight};
      line-height: ${theme.text.h4.lineHeight};
      font-family: ${theme.text.h4.fontFamily};
      margin-top: var(--space-5);
      margin-bottom: var(--space-3);
      color: var(--color-text-primary);
    }
    
    h5 {
      font-size: ${theme.text.h5.fontSize};
      font-weight: ${theme.text.h5.fontWeight};
      line-height: ${theme.text.h5.lineHeight};
      margin-top: var(--space-4);
      margin-bottom: var(--space-2);
      color: var(--color-text-primary);
    }
    
    h6 {
      font-size: ${theme.text.h6.fontSize};
      font-weight: ${theme.text.h6.fontWeight};
      line-height: ${theme.text.h6.lineHeight};
      margin-top: var(--space-4);
      margin-bottom: var(--space-2);
      color: var(--color-text-primary);
    }

    /* 본문 텍스트 */
    p {
      font-size: ${theme.text.body.fontSize};
      font-weight: ${theme.text.body.fontWeight};
      line-height: ${theme.text.body.lineHeight};
      margin-bottom: var(--space-4);
      color: var(--color-text-primary);
    }

    /* 링크 */
    a {
      color: var(--color-text-secondary);
      transition: var(--transition-normal);
      text-decoration: none;
    }
    
    a:hover {
      color: var(--color-interactive-hover);
    }
    
    a:focus {
      outline: none;
    }

    /* 리스트 */
    ul, ol {
      margin-bottom: var(--space-4);
      padding-left: var(--space-6);
    }
    
    li {
      margin-bottom: var(--space-1);
      line-height: ${theme.text.body.lineHeight};
    }

    /* 스크롤바 커스터마이징 */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: var(--color-background-secondary);
    }
    
    ::-webkit-scrollbar-thumb {
      background: var(--color-border-default);
      border-radius: var(--border-radius-base);
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-interactive-hover);
    }

    /* 코드 관련 스타일 */
    pre {
      background: ${theme.color.code.background} !important;
      border-radius: var(--border-radius-lg) !important;
      padding: var(--space-4) !important;
      overflow-x: auto !important;
      margin: var(--space-6) 0 !important;
      box-shadow: var(--shadow-md);
    }
    
    code {
      font-family: var(--font-family-mono) !important;
      font-size: ${theme.text.code.fontSize};
    }
    
    /* 인라인 코드 */
    p code,
    li code {
      background: ${theme.color.code.inline.background} !important;
      color: ${theme.color.code.inline.text} !important;
      padding: 2px 6px !important;
      border-radius: var(--border-radius-base) !important;
      font-size: ${theme.text.codeInline.fontSize} !important;
    }

    /* 블록쿼트 */
    blockquote {
      border-left: ${theme.border.component.blockquote.leftWidth} ${theme.border.component.blockquote.leftStyle} var(--color-border-default);
      margin: var(--space-6) 0;
      padding: var(--space-4) var(--space-6);
      background: rgba(166, 150, 136, 0.1);
      border-radius: ${theme.border.component.blockquote.radius};
      font-style: italic;
    }

    /* 이미지 */
    img {
      max-width: 100%;
      height: auto;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
    }

    /* 테이블 */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: var(--space-6) 0;
      background: var(--color-background-primary);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    
    th,
    td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-bottom: 1px solid var(--color-border-light);
    }
    
    th {
      background: var(--color-primary-500);
      color: white;
      font-weight: ${theme.text.subtitle1.fontWeight};
    }
    
    tr:hover {
      background: rgba(166, 150, 136, 0.1);
    }

    /* 블로그 포스트 내 마크다운 헤딩 크기 조정 */
    article .blog-post-content h1,
    div.blog-post-content h1 {
      font-size: 2rem !important; /* 32px - 기존 48px에서 줄임 */
      margin-top: 2rem !important;
      margin-bottom: 1rem !important;
    }
    
    article .blog-post-content h2,
    div.blog-post-content h2 {
      font-size: 1.5rem !important; /* 24px - 기존 36px에서 줄임 */
      margin-top: 1.5rem !important;
      margin-bottom: 0.75rem !important;
    }
    
    article .blog-post-content h3,
    div.blog-post-content h3 {
      font-size: 1.25rem !important; /* 20px - 기존 30px에서 줄임 */
      margin-top: 1.25rem !important;
      margin-bottom: 0.5rem !important;
    }
    
    article .blog-post-content h4,
    div.blog-post-content h4 {
      font-size: 1.125rem !important; /* 18px - 기존 24px에서 줄임 */
      margin-top: 1rem !important;
      margin-bottom: 0.5rem !important;
    }
    
    article .blog-post-content h5,
    div.blog-post-content h5 {
      font-size: 1rem !important; /* 16px - 기존 20px에서 줄임 */
      margin-top: 0.75rem !important;
      margin-bottom: 0.25rem !important;
    }
    
    article .blog-post-content h6,
    div.blog-post-content h6 {
      font-size: 0.875rem !important; /* 14px - 기존 18px에서 줄임 */
      margin-top: 0.75rem !important;
      margin-bottom: 0.25rem !important;
    }

    /* 반응형 스타일 */
    @media (max-width: ${theme.breakpoints.sm}) {
      html {
        font-size: 14px;
      }
      
      h1 {
        font-size: ${theme.text.h2.fontSize};
      }
      
      h2 {
        font-size: ${theme.text.h3.fontSize};
      }
      
      h3 {
        font-size: ${theme.text.h4.fontSize};
      }
      
      /* 모바일에서 리스트와 코드 블록 크기 조정 */
      li {
        font-size: 14px !important;
      }
      
      pre {
        font-size: 12px !important;
      }
      
      code {
        font-size: 12px !important;
      }
      
      p code,
      li code {
        font-size: 12px !important;
      }
      
      /* 반응형에서도 블로그 포스트 헤딩 조정 */
      article .blog-post-content h1,
      div.blog-post-content h1 {
        font-size: 1.5rem !important; /* 모바일에서 더 작게 */
      }
      
      article .blog-post-content h2,
      div.blog-post-content h2 {
        font-size: 1.25rem !important;
      }
      
      article .blog-post-content h3,
      div.blog-post-content h3 {
        font-size: 1.125rem !important;
      }
    }

    /* 작은 모바일 화면 (480px 이하) */
    @media (max-width: 480px) {
      /* 블로그 포스트 헤딩 더 작게 조정 */
      article .blog-post-content h1,
      div.blog-post-content h1 {
        font-size: 1.25rem !important; /* 20px - 상단 타이틀과 동일 */
      }
      
      article .blog-post-content h2,
      div.blog-post-content h2 {
        font-size: 1.125rem !important; /* 18px */
      }
      
      article .blog-post-content h3,
      div.blog-post-content h3 {
        font-size: 1rem !important; /* 16px */
      }
      
      article .blog-post-content h4,
      div.blog-post-content h4 {
        font-size: 0.875rem !important; /* 14px */
      }
      
      article .blog-post-content h5,
      div.blog-post-content h5 {
        font-size: 0.875rem !important; /* 14px */
      }
      
      article .blog-post-content h6,
      div.blog-post-content h6 {
        font-size: 0.75rem !important; /* 12px */
      }
    }

    /* 포커스 관리 */
    *:focus {
      outline: none;
    }
    
    *:focus-visible {
      outline: none;
    }
    
    /* 버튼 및 링크 포커스 시 보더 제거 */
    button:focus,
    button:focus-visible,
    a:focus,
    a:focus-visible {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* 선택 영역 스타일 */
    ::selection {
      background: rgba(139, 125, 107, 0.3);
      color: var(--color-text-primary);
    }
    
    ::-moz-selection {
      background: rgba(139, 125, 107, 0.3);
      color: var(--color-text-primary);
    }

    /* 접근성 개선 */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `

  return (
    <Helmet>
      {/* Pretendard 폰트 로드 */}
      <link
        rel="stylesheet"
        as="style"
        crossOrigin=""
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
      />
      <style>{globalCSS}</style>
    </Helmet>
  )
}