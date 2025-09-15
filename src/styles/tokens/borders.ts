// 보더(Border) 디자인 토큰
export const borders = {
  // 보더 두께
  width: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },

  // 보더 스타일
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    none: 'none',
  },

  // 보더 반경 (Border Radius)
  radius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',    // 완전한 원형
  },

  // 프리셋 보더 조합
  preset: {
    none: 'none',
    thin: '1px solid',
    medium: '2px solid',
    thick: '4px solid',
  },

  // 컴포넌트별 보더 스타일
  component: {
    // 카드
    card: {
      width: '1px',
      style: 'solid',
      radius: '0.5rem',  // 8px
    },
    
    // 버튼
    button: {
      width: '1px',
      style: 'solid',
      radius: '0.375rem', // 6px
    },
    
    // 입력 필드
    input: {
      width: '1px',
      style: 'solid',
      radius: '0.375rem', // 6px
    },
    
    // 이미지
    image: {
      radius: '0.5rem',   // 8px
    },
    
    // 코드 블록
    code: {
      radius: '0.5rem',   // 8px
    },
    
    // 테이블
    table: {
      radius: '0.5rem',   // 8px
      cellBorder: '1px solid',
    },
    
    // 블록쿼트
    blockquote: {
      leftWidth: '4px',
      leftStyle: 'solid',
      radius: '0 0.5rem 0.5rem 0', // 우측만 둥글게
    },
    
    // 네비게이션 링크
    navLink: {
      width: '1px',
      style: 'solid',
      radius: '0.375rem', // 6px
    },
    
    // 소셜 링크 버튼
    socialButton: {
      radius: '0.375rem', // 6px
    },
  },

  // 그림자와 함께 사용하는 보더
  elevated: {
    card: {
      border: 'none',
      radius: '0.75rem',  // 12px
    },
    button: {
      border: 'none',
      radius: '0.5rem',   // 8px
    },
  },

  // 포커스 상태 보더
  focus: {
    width: '2px',
    style: 'solid',
    offset: '2px',       // 보더에서 떨어진 거리
  },

  // 호버 상태 보더
  hover: {
    width: '1px',
    style: 'solid',
  },
} as const

// 타입 추출을 위한 헬퍼
export type BorderToken = typeof borders
export type BorderWidth = keyof typeof borders.width
export type BorderStyle = keyof typeof borders.style
export type BorderRadius = keyof typeof borders.radius
