// 간격(Spacing) 디자인 토큰
export const spacing = {
  // 기본 간격 단위 (rem 기반)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
  11: '2.75rem',  // 44px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  28: '7rem',     // 112px
  32: '8rem',     // 128px
  36: '9rem',     // 144px
  40: '10rem',    // 160px
  44: '11rem',    // 176px
  48: '12rem',    // 192px
  52: '13rem',    // 208px
  56: '14rem',    // 224px
  60: '15rem',    // 240px
  64: '16rem',    // 256px
  72: '18rem',    // 288px
  80: '20rem',    // 320px
  96: '24rem',    // 384px
} as const

// 컴포넌트별 간격 프리셋
export const componentSpacing = {
  // 패딩
  padding: {
    xs: spacing[2],    // 8px
    sm: spacing[3],    // 12px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
    '2xl': spacing[12], // 48px
  },

  // 마진
  margin: {
    xs: spacing[2],    // 8px
    sm: spacing[4],    // 16px
    md: spacing[6],    // 24px
    lg: spacing[8],    // 32px
    xl: spacing[12],   // 48px
    '2xl': spacing[16], // 64px
    '3xl': spacing[20], // 80px
  },

  // 갭 (Grid, Flex 등에서 사용)
  gap: {
    xs: spacing[1],    // 4px
    sm: spacing[2],    // 8px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
  },

  // 컨테이너 최대 너비
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    blog: '800px',     // 블로그 콘텐츠용 특별 너비
  },

  // 높이 관련
  height: {
    header: '140px',   // 헤더 높이
    nav: '60px',       // 네비게이션 높이
    footer: {
      mobile: '200px',
      desktop: '300px',
    },
  },

  // 반응형 간격
  responsive: {
    mobile: {
      padding: spacing[4],  // 16px
      margin: spacing[4],   // 16px
    },
    tablet: {
      padding: spacing[6],  // 24px
      margin: spacing[6],   // 24px
    },
    desktop: {
      padding: spacing[8],  // 32px
      margin: spacing[8],   // 32px
    },
  },

  // 특수 용도
  section: {
    small: spacing[12],    // 48px
    medium: spacing[16],   // 64px
    large: spacing[20],    // 80px
    xlarge: spacing[24],   // 96px
  },

  // 인터랙티브 요소
  interactive: {
    buttonPadding: {
      sm: `${spacing[2]} ${spacing[3]}`,  // 8px 12px
      md: `${spacing[3]} ${spacing[4]}`,  // 12px 16px
      lg: `${spacing[4]} ${spacing[6]}`,  // 16px 24px
    },
    inputPadding: {
      sm: spacing[2],    // 8px
      md: spacing[3],    // 12px
      lg: spacing[4],    // 16px
    },
  },
} as const

// 타입 추출을 위한 헬퍼
export type SpacingToken = typeof spacing
export type SpacingSize = keyof typeof spacing
export type ComponentSpacingToken = typeof componentSpacing
