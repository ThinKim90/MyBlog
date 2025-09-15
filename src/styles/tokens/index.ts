// 모든 디자인 토큰을 통합하는 인덱스 파일
import { colors } from './colors'
import { typography } from './typography'
import { spacing, componentSpacing } from './spacing'
import { borders } from './borders'
import { shadows } from './shadows'

export { colors, type ColorToken, type PrimaryColor, type NeutralColor, type SemanticColor } from './colors'
export { typography, type TypographyToken, type FontSize, type FontWeight, type LineHeight, type TextStyle } from './typography'
export { spacing, componentSpacing, type SpacingToken, type SpacingSize, type ComponentSpacingToken } from './spacing'
export { borders, type BorderToken, type BorderWidth, type BorderStyle, type BorderRadius } from './borders'
export { shadows, type ShadowToken, type ShadowLevel, type ElevationLevel } from './shadows'

// 전체 디자인 시스템 토큰
export const tokens = {
  colors,
  typography,
  spacing,
  componentSpacing,
  borders,
  shadows,
} as const

// 디자인 토큰의 통합 타입
export type DesignTokens = typeof tokens

// 자주 사용되는 토큰 별칭
export const theme = {
  // 색상 단축키
  color: colors,
  
  // 타이포그래피 단축키
  text: typography.textStyles,
  font: typography.fontFamily,
  
  // 간격 단축키
  space: spacing,
  
  // 보더 단축키
  border: borders,
  
  // 그림자 단축키
  shadow: shadows,
  
  // 브레이크포인트
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 트랜지션
  transition: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // z-index 레벨
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const

export type Theme = typeof theme
