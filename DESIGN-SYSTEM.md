# 디자인 시스템 사용 가이드

블로그의 디자인 시스템이 구축되었습니다! 이 가이드는 디자인 토큰과 컴포넌트들을 효과적으로 사용하는 방법을 설명합니다.

## 📁 구조

```
src/
├── styles/
│   ├── tokens/          # 디자인 토큰
│   │   ├── colors.ts    # 색상 토큰
│   │   ├── typography.ts # 타이포그래피 토큰
│   │   ├── spacing.ts   # 간격 토큰
│   │   ├── borders.ts   # 보더 토큰
│   │   ├── shadows.ts   # 그림자 토큰
│   │   └── index.ts     # 통합 진입점
│   ├── ThemeProvider.tsx # 테마 프로바이더
│   └── GlobalStyles.tsx  # 글로벌 스타일
└── components/
    └── ui/              # 재사용 가능한 UI 컴포넌트
        ├── Button.tsx
        ├── Card.tsx
        ├── Text.tsx
        └── index.ts
```

## 🎨 디자인 토큰

### 색상 (Colors)

```typescript
import { useColors } from '../styles/ThemeProvider'

const colors = useColors()

// 기본 브랜드 컬러
colors.primary[500]     // 메인 브라운 #8b7d6b
colors.primary[50]      // 가장 밝은 베이지 #f8f6f0

// 텍스트 컬러
colors.text.primary     // 기본 텍스트 #2d2823
colors.text.secondary   // 보조 텍스트 #4a453e
colors.text.tertiary    // 삼차 텍스트 #6b645c

// 배경 컬러
colors.background.primary   // 메인 배경 #f8f6f0
colors.background.secondary // 보조 배경 #e8e4db

// 시맨틱 컬러
colors.semantic.success[500]  // 성공 #22c55e
colors.semantic.error[500]    // 에러 #ef4444
```

### 타이포그래피 (Typography)

```typescript
import { useTypography } from '../styles/ThemeProvider'

const { styles, fonts } = useTypography()

// 텍스트 스타일
styles.h1         // 메인 헤딩
styles.h2         // 서브 헤딩
styles.body       // 본문 텍스트
styles.caption    // 캡션 텍스트

// 폰트 패밀리
fonts.primary     // 기본 폰트
fonts.heading     // 헤딩 폰트 (Darker Grotesque)
fonts.mono        // 모노스페이스 폰트
```

### 간격 (Spacing)

```typescript
import { useSpacing } from '../styles/ThemeProvider'

const space = useSpacing()

// 기본 간격 (rem 단위)
space[1]    // 0.25rem (4px)
space[2]    // 0.5rem (8px)
space[4]    // 1rem (16px)
space[8]    // 2rem (32px)
```

## 🧱 컴포넌트 사용법

### Button 컴포넌트

```typescript
import { Button } from '../components/ui'

// 기본 사용
<Button>클릭하세요</Button>

// 다양한 변형
<Button variant="primary">기본 버튼</Button>
<Button variant="secondary">보조 버튼</Button>
<Button variant="ghost">고스트 버튼</Button>
<Button variant="link">링크 버튼</Button>

// 크기 설정
<Button size="sm">작은 버튼</Button>
<Button size="md">중간 버튼</Button>
<Button size="lg">큰 버튼</Button>

// 아이콘과 함께
<Button leftIcon={<span>👋</span>}>인사하기</Button>
<Button rightIcon={<span>→</span>}>다음으로</Button>

// 로딩 상태
<Button loading>로딩 중...</Button>
```

### Card 컴포넌트

```typescript
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

<Card variant="default" hover>
  <CardHeader>
    <h3>카드 제목</h3>
  </CardHeader>
  <CardContent>
    <p>카드 내용이 들어갑니다.</p>
  </CardContent>
  <CardFooter>
    <Button>액션 버튼</Button>
  </CardFooter>
</Card>
```

### Text 컴포넌트

```typescript
import { 
  Heading1, 
  Heading2, 
  Body, 
  Caption, 
  Text 
} from '../components/ui'

// 사전 정의된 텍스트 컴포넌트
<Heading1>메인 제목</Heading1>
<Heading2>서브 제목</Heading2>
<Body>본문 텍스트</Body>
<Caption color="secondary">캡션 텍스트</Caption>

// 커스텀 텍스트
<Text 
  as="span" 
  variant="subtitle1" 
  color="primary"
  truncate
>
  커스텀 텍스트
</Text>
```

## 🎯 CSS 변수 사용

글로벌 스타일에서 CSS 커스텀 프로퍼티로 토큰들이 노출됩니다:

```css
/* 색상 */
color: var(--color-text-primary);
background: var(--color-background-primary);

/* 간격 */
padding: var(--space-4);
margin: var(--space-2);

/* 보더 */
border-radius: var(--border-radius-lg);

/* 그림자 */
box-shadow: var(--shadow-md);

/* 트랜지션 */
transition: var(--transition-normal);
```

## 🛠 커스텀 컴포넌트 만들기

### 테마 훅 사용

```typescript
import React from 'react'
import { useTheme } from '../styles/ThemeProvider'

const CustomComponent: React.FC = () => {
  const theme = useTheme()
  
  return (
    <div style={{
      padding: theme.space[4],
      background: theme.color.background.secondary,
      borderRadius: theme.border.radius.lg,
      boxShadow: theme.shadow.md,
      color: theme.color.text.primary
    }}>
      커스텀 컴포넌트
    </div>
  )
}
```

### 스타일 헬퍼 사용

```typescript
import React from 'react'
import { useStyles } from '../styles/ThemeProvider'

const CustomComponent: React.FC = () => {
  const styles = useStyles()
  
  return (
    <div style={{
      ...styles.text('h2'),
      color: styles.color('text.primary'),
      padding: styles.spacing(4),
      boxShadow: styles.shadow('md')
    }}>
      스타일 헬퍼 사용
    </div>
  )
}
```

## 📱 반응형 디자인

브레이크포인트:
- `sm`: 640px
- `md`: 768px  
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```typescript
const ResponsiveComponent: React.FC = () => {
  const theme = useTheme()
  
  return (
    <div>
      <style>
        {`
          @media (max-width: ${theme.breakpoints.md}) {
            .responsive-text {
              font-size: ${theme.text.bodySmall.fontSize};
            }
          }
        `}
      </style>
      <p className="responsive-text">반응형 텍스트</p>
    </div>
  )
}
```

## 🎨 색상 팔레트

### Primary Colors (브랜드 컬러)
- `primary.50`: #f8f6f0 (가장 밝은 베이지)
- `primary.100`: #f0ede6 (밝은 베이지)
- `primary.200`: #e8e4db (중간 베이지)
- `primary.300`: #d4cfc4 (더 진한 베이지)
- `primary.400`: #a69688 (중간 브라운)
- `primary.500`: #8b7d6b (메인 브라운) ⭐
- `primary.600`: #6b645c (진한 브라운)
- `primary.700`: #4a453e (더 진한 브라운)
- `primary.800`: #2d2823 (가장 진한 브라운)

### Semantic Colors
- Success: #22c55e (녹색)
- Warning: #f59e0b (주황색)
- Error: #ef4444 (빨간색)
- Info: #3b82f6 (파란색)

## 📝 베스트 프랙티스

1. **일관성 유지**: 항상 디자인 토큰을 사용하여 일관된 스타일을 유지하세요.

2. **의미론적 색상 사용**: `primary.500` 대신 `colors.text.primary`와 같은 의미론적 색상을 사용하세요.

3. **컴포넌트 재사용**: 새로운 컴포넌트를 만들기 전에 기존 UI 컴포넌트를 재사용할 수 있는지 확인하세요.

4. **테마 훅 활용**: 인라인 스타일보다는 테마 훅을 사용하여 타입 안전성을 확보하세요.

5. **반응형 고려**: 모바일부터 데스크톱까지 모든 화면 크기를 고려하여 디자인하세요.

## 🔧 확장하기

새로운 토큰이나 컴포넌트를 추가하려면:

1. **새 토큰 추가**: `src/styles/tokens/` 폴더의 해당 파일을 수정
2. **새 컴포넌트 추가**: `src/components/ui/` 폴더에 새 컴포넌트 생성
3. **타입 업데이트**: TypeScript 타입을 업데이트하여 타입 안전성 확보

이제 일관되고 확장 가능한 디자인 시스템을 통해 블로그를 더욱 체계적으로 관리할 수 있습니다! 🎉
