import React, { createContext, useContext, ReactNode } from 'react'
import { theme, type Theme } from './tokens'

// 테마 컨텍스트 생성
const ThemeContext = createContext<Theme | undefined>(undefined)

// 테마 프로바이더 컴포넌트
interface ThemeProviderProps {
  children: ReactNode
  customTheme?: Partial<Theme>
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  customTheme 
}) => {
  // 커스텀 테마가 있다면 기본 테마와 병합
  const mergedTheme = customTheme ? { ...theme, ...customTheme } : theme

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  )
}

// 테마 사용을 위한 커스텀 훅
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// 특정 토큰만 추출하는 헬퍼 훅들
export const useColors = () => {
  const theme = useTheme()
  return theme.color
}

export const useTypography = () => {
  const theme = useTheme()
  return {
    styles: theme.text,
    fonts: theme.font,
  }
}

export const useSpacing = () => {
  const theme = useTheme()
  return theme.space
}

export const useBorders = () => {
  const theme = useTheme()
  return theme.border
}

export const useShadows = () => {
  const theme = useTheme()
  return theme.shadow
}

// CSS-in-JS 스타일을 위한 헬퍼 함수들
export const createStyles = (theme: Theme) => ({
  // 자주 사용되는 스타일 패턴들을 함수로 제공
  
  // 텍스트 스타일 적용
  text: (variant: keyof typeof theme.text) => theme.text[variant],
  
  // 색상 적용
  color: (path: string) => {
    const keys = path.split('.')
    let value: any = theme.color
    for (const key of keys) {
      value = value[key]
      if (value === undefined) return undefined
    }
    return value
  },
  
  // 간격 적용
  spacing: (size: keyof typeof theme.space) => theme.space[size],
  
  // 그림자 적용
  shadow: (level: string) => {
    const keys = level.split('.')
    let value: any = theme.shadow
    for (const key of keys) {
      value = value[key]
      if (value === undefined) return undefined
    }
    return value
  },
  
  // 보더 적용
  border: (preset: string) => {
    const keys = preset.split('.')
    let value: any = theme.border
    for (const key of keys) {
      value = value[key]
      if (value === undefined) return undefined
    }
    return value
  },
  
  // 반응형 스타일
  responsive: {
    mobile: `@media (max-width: ${theme.breakpoints.sm})`,
    tablet: `@media (max-width: ${theme.breakpoints.md})`,
    desktop: `@media (min-width: ${theme.breakpoints.lg})`,
  },
})

// 스타일 헬퍼 훅
export const useStyles = () => {
  const theme = useTheme()
  return createStyles(theme)
}
