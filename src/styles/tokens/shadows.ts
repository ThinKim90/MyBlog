// 그림자(Shadow) 디자인 토큰
export const shadows = {
  // 기본 그림자 레벨
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // 내부 그림자
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // 컴포넌트별 그림자 프리셋
  component: {
    // 카드
    card: {
      default: '0 4px 15px rgba(0, 0, 0, 0.1)',
      hover: '0 8px 25px rgba(0, 0, 0, 0.15)',
      active: '0 2px 8px rgba(0, 0, 0, 0.12)',
    },
    
    // 버튼
    button: {
      default: '0 2px 4px rgba(0, 0, 0, 0.1)',
      hover: '0 4px 8px rgba(0, 0, 0, 0.15)',
      active: '0 1px 2px rgba(0, 0, 0, 0.1)',
      focus: '0 0 0 3px rgba(139, 125, 107, 0.3)', // primary.500 with opacity
    },
    
    // 이미지
    image: {
      default: '0 4px 15px rgba(0, 0, 0, 0.1)',
      hover: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
    
    // 헤더
    header: {
      default: '0 1px 3px rgba(0, 0, 0, 0.1)',
      scrolled: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    
    // 모달/오버레이
    modal: {
      backdrop: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      content: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    
    // 드롭다운
    dropdown: {
      default: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    
    // 입력 필드
    input: {
      default: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
      focus: '0 0 0 3px rgba(139, 125, 107, 0.2)', // primary.500 with opacity
    },
    
    // 테이블
    table: {
      default: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    
    // 코드 블록
    code: {
      default: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  },

  // 브랜드 컬러를 활용한 그림자
  brand: {
    primary: {
      light: '0 4px 15px rgba(139, 125, 107, 0.2)',  // primary.500
      medium: '0 8px 25px rgba(139, 125, 107, 0.3)',
      strong: '0 12px 35px rgba(139, 125, 107, 0.4)',
    },
    accent: {
      light: '0 4px 15px rgba(166, 150, 136, 0.2)',  // primary.400
      medium: '0 8px 25px rgba(166, 150, 136, 0.3)',
      strong: '0 12px 35px rgba(166, 150, 136, 0.4)',
    },
  },

  // 상태별 그림자
  state: {
    success: '0 0 0 3px rgba(34, 197, 94, 0.2)',     // success.500
    warning: '0 0 0 3px rgba(245, 158, 11, 0.2)',    // warning.500
    error: '0 0 0 3px rgba(239, 68, 68, 0.2)',       // error.500
    info: '0 0 0 3px rgba(59, 130, 246, 0.2)',       // info.500
  },

  // 엘리베이션 레벨 (Material Design 영감)
  elevation: {
    0: 'none',
    1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    4: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
    5: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
  },
} as const

// 타입 추출을 위한 헬퍼
export type ShadowToken = typeof shadows
export type ShadowLevel = 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'
export type ElevationLevel = keyof typeof shadows.elevation
