// 타이포그래피 디자인 토큰
export const typography = {
  // 폰트 패밀리
  fontFamily: {
    primary: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    heading: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
    decorative: "'Pretendard Variable', 'Pretendard', serif",
  },

  // 폰트 크기 (rem 단위)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },

  // 폰트 무게
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // 줄 간격
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // 문자 간격
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // 텍스트 스타일 프리셋
  textStyles: {
    // 헤딩 스타일
    h1: {
      fontSize: '3rem',         // 48px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    h2: {
      fontSize: '2.25rem',      // 36px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
      fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    h3: {
      fontSize: '1.875rem',     // 30px
      fontWeight: 600,
      lineHeight: 1.3,
      fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    h4: {
      fontSize: '1.5rem',       // 24px
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    h5: {
      fontSize: '1.25rem',      // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',     // 18px
      fontWeight: 600,
      lineHeight: 1.4,
    },

    // 본문 스타일
    body: {
      fontSize: '1rem',         // 16px
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: 'normal',
    },
    bodyLarge: {
      fontSize: '1.125rem',     // 18px
      fontWeight: 400,
      lineHeight: 1.6,
    },
    bodySmall: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    // 특수 스타일
    caption: {
      fontSize: '0.75rem',      // 12px
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0.025em',
    },
    overline: {
      fontSize: '0.75rem',      // 12px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
    subtitle1: {
      fontSize: '1rem',         // 16px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 500,
      lineHeight: 1.5,
    },

    // 버튼 스타일
    button: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.025em',
    },
    buttonLarge: {
      fontSize: '1rem',         // 16px
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.025em',
    },

    // 코드 스타일
    code: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 400,
      fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
      lineHeight: 1.5,
    },
    codeInline: {
      fontSize: '0.9em',        // 상대적 크기
      fontWeight: 400,
      fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
    },

    // 사이트 제목
    siteTitle: {
      fontSize: '2rem',         // 32px
      fontWeight: 400,
      fontFamily: "'Pretendard Variable', 'Pretendard', sans-serif",
      lineHeight: 1.2,
    },
    siteTitleMobile: {
      fontSize: '1.5rem',       // 24px
      fontWeight: 400,
      fontFamily: "'Pretendard Variable', 'Pretendard', sans-serif",
      lineHeight: 1.2,
    },
  },
} as const

// 타입 추출을 위한 헬퍼
export type TypographyToken = typeof typography
export type FontSize = keyof typeof typography.fontSize
export type FontWeight = keyof typeof typography.fontWeight
export type LineHeight = keyof typeof typography.lineHeight
export type TextStyle = keyof typeof typography.textStyles
