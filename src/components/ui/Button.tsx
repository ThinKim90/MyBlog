import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { useTheme } from '../../styles/ThemeProvider'

// 버튼 변형 타입
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useTheme()

    // 버튼 스타일 계산
    const getButtonStyles = () => {
      const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space[2],
        fontFamily: theme.font.primary,
        fontWeight: theme.text.button.fontWeight,
        lineHeight: theme.text.button.lineHeight,
        letterSpacing: theme.text.button.letterSpacing,
        border: 'none',
        borderRadius: theme.border.component.button.radius,
        cursor: 'pointer',
        transition: theme.transition.normal,
        textDecoration: 'none',
        userSelect: 'none' as const,
        whiteSpace: 'nowrap' as const,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled || loading ? 0.6 : 1,
        pointerEvents: (disabled || loading ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
      }

      // 크기별 스타일
      const sizeStyles = {
        sm: {
          fontSize: theme.text.button.fontSize,
          padding: `${theme.space[2]} ${theme.space[3]}`,
          minHeight: '32px',
        },
        md: {
          fontSize: theme.text.button.fontSize,
          padding: `${theme.space[3]} ${theme.space[4]}`,
          minHeight: '40px',
        },
        lg: {
          fontSize: theme.text.buttonLarge.fontSize,
          padding: `${theme.space[4]} ${theme.space[6]}`,
          minHeight: '48px',
        },
      }

      // 변형별 스타일
      const variantStyles = {
        primary: {
          background: theme.color.primary[500],
          color: 'white',
          boxShadow: theme.shadow.component.button.default,
        },
        secondary: {
          background: theme.color.background.secondary,
          color: theme.color.text.primary,
          border: `1px solid ${theme.color.border.default}`,
          boxShadow: theme.shadow.component.button.default,
        },
        ghost: {
          background: 'transparent',
          color: theme.color.text.secondary,
          border: `1px solid transparent`,
        },
        link: {
          background: 'transparent',
          color: theme.color.text.secondary,
          padding: '0',
          minHeight: 'auto',
          border: 'none',
          boxShadow: 'none',
        },
      }

      return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }
    }

    // 호버 스타일 처리
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      const target = e.currentTarget
      
      switch (variant) {
        case 'primary':
          target.style.background = theme.color.primary[600]
          target.style.boxShadow = theme.shadow.component.button.hover
          break
        case 'secondary':
          target.style.background = theme.color.background.accent
          target.style.borderColor = theme.color.border.strong
          target.style.boxShadow = theme.shadow.component.button.hover
          break
        case 'ghost':
          target.style.background = theme.color.background.secondary
          target.style.borderColor = theme.color.border.light
          break
        case 'link':
          target.style.color = theme.color.interactive.hover
          target.style.textDecoration = 'underline'
          break
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      const target = e.currentTarget
      const originalStyles = getButtonStyles()
      
      target.style.background = originalStyles.background?.toString() || ''
      target.style.borderColor = originalStyles.border?.toString().split(' ')[2] || ''
      target.style.boxShadow = (originalStyles as any).boxShadow || ''
      target.style.color = originalStyles.color?.toString() || ''
      target.style.textDecoration = 'none'
    }

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      // 포커스 시 추가 스타일 없음 (보더/그림자 제거)
    }

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      // 블러 시 추가 스타일 없음
    }

    return (
      <button
        ref={ref}
        style={{ ...getButtonStyles(), ...style }}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div
            style={{
              width: '16px',
              height: '16px',
              border: `2px solid currentColor`,
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
        
        {/* 스피너 애니메이션 정의 */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </button>
    )
  }
)

Button.displayName = 'Button'
