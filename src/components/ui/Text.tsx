import React, { HTMLAttributes, ElementType, forwardRef } from 'react'
import { useTheme } from '../../styles/ThemeProvider'
import { TextStyle } from '../../styles/tokens/typography'

export type TextVariant = TextStyle
export type TextAlign = 'left' | 'center' | 'right' | 'justify'
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inherit'

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: TextVariant
  align?: TextAlign
  color?: TextColor
  truncate?: boolean
  clamp?: number
}

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = 'span',
      variant = 'body',
      align = 'left',
      color = 'primary',
      truncate = false,
      clamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useTheme()

    // 텍스트 스타일 계산
    const getTextStyles = () => {
      const variantStyle = theme.text[variant]
      
      // 색상 매핑
      const colorMap = {
        primary: theme.color.text.primary,
        secondary: theme.color.text.secondary,
        tertiary: theme.color.text.tertiary,
        muted: theme.color.text.muted,
        inherit: 'inherit',
      }

      const baseStyles = {
        margin: '0',
        padding: '0',
        textAlign: align,
        color: colorMap[color],
        ...variantStyle,
      }

      // 텍스트 truncate 처리
      if (truncate) {
        Object.assign(baseStyles, {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
        })
      }

      // 텍스트 clamp 처리 (여러 줄 말줄임)
      if (clamp && clamp > 0) {
        Object.assign(baseStyles, {
          display: '-webkit-box',
          WebkitLineClamp: clamp,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        })
      }

      return baseStyles
    }

    return (
      <Component
        ref={ref}
        style={{ ...getTextStyles(), ...style }}
        className={className}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Text.displayName = 'Text'

// 헤딩 컴포넌트들
export const Heading1 = forwardRef<HTMLHeadingElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="h1" variant="h1" {...props} />
)

export const Heading2 = forwardRef<HTMLHeadingElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="h2" variant="h2" {...props} />
)

export const Heading3 = forwardRef<HTMLHeadingElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="h3" variant="h3" {...props} />
)

export const Heading4 = forwardRef<HTMLHeadingElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="h4" variant="h4" {...props} />
)

export const Heading5 = forwardRef<HTMLHeadingElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="h5" variant="h5" {...props} />
)

export const Heading6 = forwardRef<HTMLHeadingElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="h6" variant="h6" {...props} />
)

// 본문 텍스트 컴포넌트들
export const Body = forwardRef<HTMLParagraphElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="p" variant="body" {...props} />
)

export const BodyLarge = forwardRef<HTMLParagraphElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="p" variant="bodyLarge" {...props} />
)

export const BodySmall = forwardRef<HTMLParagraphElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="p" variant="bodySmall" {...props} />
)

// 특수 텍스트 컴포넌트들
export const Caption = forwardRef<HTMLSpanElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="span" variant="caption" {...props} />
)

export const Overline = forwardRef<HTMLSpanElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="span" variant="overline" {...props} />
)

export const Subtitle1 = forwardRef<HTMLParagraphElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="p" variant="subtitle1" {...props} />
)

export const Subtitle2 = forwardRef<HTMLParagraphElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="p" variant="subtitle2" {...props} />
)

// 코드 텍스트 컴포넌트
export const Code = forwardRef<HTMLElement, Omit<TextProps, 'as' | 'variant'>>(
  (props, ref) => <Text ref={ref} as="code" variant="codeInline" {...props} />
)

// 모든 텍스트 컴포넌트들을 내보내기
Heading1.displayName = 'Heading1'
Heading2.displayName = 'Heading2'
Heading3.displayName = 'Heading3'
Heading4.displayName = 'Heading4'
Heading5.displayName = 'Heading5'
Heading6.displayName = 'Heading6'
Body.displayName = 'Body'
BodyLarge.displayName = 'BodyLarge'
BodySmall.displayName = 'BodySmall'
Caption.displayName = 'Caption'
Overline.displayName = 'Overline'
Subtitle1.displayName = 'Subtitle1'
Subtitle2.displayName = 'Subtitle2'
Code.displayName = 'Code'
