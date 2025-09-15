// 색상 디자인 토큰
export const colors = {
  // Primary Colors - 메인 브랜드 컬러
  primary: {
    50: '#f8f6f0',   // 가장 밝은 베이지
    100: '#f0ede6',  // 밝은 베이지
    200: '#e8e4db',  // 중간 베이지
    300: '#d4cfc4',  // 더 진한 베이지
    400: '#a69688',  // 중간 브라운
    500: '#8b7d6b',  // 메인 브라운 (테마 컬러)
    600: '#6b645c',  // 진한 브라운
    700: '#4a453e',  // 더 진한 브라운
    800: '#2d2823',  // 가장 진한 브라운
    900: '#1a1612',  // 거의 검정
  },

  // Neutral Colors - 중성 컬러
  neutral: {
    white: '#ffffff',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },

  // Semantic Colors - 의미론적 컬러
  semantic: {
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },

  // 기존 색상들과의 호환성을 위한 별칭
  background: {
    primary: '#f8f6f0',    // primary.50
    secondary: '#e8e4db',  // primary.200
    accent: '#d4cfc4',     // primary.300
  },
  
  text: {
    primary: '#2d2823',    // primary.800
    secondary: '#4a453e',  // primary.700
    tertiary: '#6b645c',   // primary.600
    muted: '#a69688',      // primary.400
  },

  border: {
    light: '#e8e4db',      // primary.200
    default: '#a69688',    // primary.400
    strong: '#8b7d6b',     // primary.500
  },

  interactive: {
    hover: '#8b7d6b',      // primary.500
    active: '#6b645c',     // primary.600
    focus: '#4a453e',      // primary.700
  },

  // 코드 블록 관련 색상
  code: {
    background: '#2d3748',
    text: '#e2e8f0',
    inline: {
      background: 'rgba(166, 150, 136, 0.15)',
      text: '#4a453e',
    },
  },

  // 스크롤바 색상
  scrollbar: {
    track: '#f0ede6',
    thumb: '#a69688',
    thumbHover: '#8b7d6b',
  },
} as const

// 타입 추출을 위한 헬퍼
export type ColorToken = typeof colors
export type PrimaryColor = keyof typeof colors.primary
export type NeutralColor = keyof typeof colors.neutral.gray
export type SemanticColor = keyof typeof colors.semantic
