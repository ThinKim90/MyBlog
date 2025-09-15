import React, { HTMLAttributes, forwardRef } from 'react'
import { useTheme } from '../../styles/ThemeProvider'

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useTheme()

    // 카드 스타일 계산
    const getCardStyles = () => {
      const baseStyles = {
        display: 'block',
        borderRadius: theme.border.component.card.radius,
        transition: theme.transition.normal,
        position: 'relative' as const,
      }

      // 패딩 스타일
      const paddingStyles = {
        none: { padding: '0' },
        sm: { padding: theme.space[3] },
        md: { padding: theme.space[4] },
        lg: { padding: theme.space[6] },
        xl: { padding: theme.space[8] },
      }

      // 변형별 스타일
      const variantStyles = {
        default: {
          background: theme.color.background.primary,
          border: `1px solid ${theme.color.border.light}`,
          boxShadow: theme.shadow.component.card.default,
        },
        elevated: {
          background: theme.color.background.primary,
          border: 'none',
          boxShadow: theme.shadow.lg,
        },
        outlined: {
          background: theme.color.background.primary,
          border: `2px solid ${theme.color.border.default}`,
          boxShadow: 'none',
        },
        ghost: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        },
      }

      return {
        ...baseStyles,
        ...paddingStyles[padding],
        ...variantStyles[variant],
      }
    }

    // 호버 효과 처리
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hover) return

      const target = e.currentTarget
      
      switch (variant) {
        case 'default':
          target.style.boxShadow = theme.shadow.component.card.hover
          target.style.transform = 'translateY(-2px)'
          break
        case 'elevated':
          target.style.boxShadow = theme.shadow.xl
          target.style.transform = 'translateY(-4px)'
          break
        case 'outlined':
          target.style.borderColor = theme.color.border.strong
          target.style.boxShadow = theme.shadow.component.card.default
          break
        case 'ghost':
          target.style.background = theme.color.background.secondary
          break
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hover) return

      const target = e.currentTarget
      const originalStyles = getCardStyles()
      
      target.style.boxShadow = originalStyles.boxShadow || ''
      target.style.transform = 'translateY(0)'
      target.style.borderColor = originalStyles.border?.split(' ')[2] || ''
      target.style.background = originalStyles.background || ''
    }

    return (
      <div
        ref={ref}
        style={{ ...getCardStyles(), ...style }}
        className={className}
        onMouseEnter={hover ? handleMouseEnter : undefined}
        onMouseLeave={hover ? handleMouseLeave : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// 카드 내부 컴포넌트들
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme()

    return (
      <div
        ref={ref}
        style={{
          padding: `${theme.space[4]} ${theme.space[4]} ${theme.space[2]}`,
          borderBottom: `1px solid ${theme.color.border.light}`,
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme()

    return (
      <div
        ref={ref}
        style={{
          padding: theme.space[4],
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme()

    return (
      <div
        ref={ref}
        style={{
          padding: `${theme.space[2]} ${theme.space[4]} ${theme.space[4]}`,
          borderTop: `1px solid ${theme.color.border.light}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: theme.space[2],
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
