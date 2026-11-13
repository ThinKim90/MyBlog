import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Header from "./Header"
import Footer from "./Footer"
import { Helmet } from "react-helmet"
import { ThemeProvider } from "../styles/ThemeProvider"
import { GlobalStyles } from "../styles/GlobalStyles"

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  contentMaxWidth?: string
  categories?: string[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  getCategoryCount?: (category: string) => number
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  description,
  contentMaxWidth = '800px',
  categories,
  selectedCategory,
  onCategoryChange,
  getCategoryCount
}) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          description
          draftPreview
        }
      }
    }
  `)

  const siteTitle = data.site.siteMetadata.title
  const siteDescription = data.site.siteMetadata.description
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const pageDescription = description || siteDescription
  const draftPreview = data.site.siteMetadata.draftPreview

  return (
    <ThemeProvider>
      <GlobalStyles />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          {draftPreview && <meta name="robots" content="noindex, nofollow" />}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          
          {/* Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@300;400;500;600;700;800;900&family=Savate:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
          
          {/* Open Graph */}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          
          {/* GoatCounter 추적 스크립트 */}
          <script 
            data-goatcounter={`https://${process.env.GATSBY_GC_SITE || 'thin.goatcounter.com'}/count`}
            async 
            src="//gc.zgo.at/count.js"
          />
        </Helmet>

        <Header 
          siteTitle={siteTitle}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          getCategoryCount={getCategoryCount}
        />
        
        <main style={{
          flex: '1',
          maxWidth: contentMaxWidth,
          margin: '0 auto',
          padding: 'var(--space-5)', // 20px
          width: '100%'
        }}>
          {draftPreview && (
            <aside role="note" style={{
              padding: "12px 16px",
              marginBottom: "20px",
              border: "1px solid #dfc68c",
              borderRadius: "8px",
              background: "#fff6df",
              color: "#6b4710",
              fontSize: "14px",
              lineHeight: 1.6,
            }}>
              <strong>초안 미리보기</strong>
              <div>작성 중인 글을 함께 보고 있어요. 초안은 운영 사이트에 발행되지 않습니다.</div>
            </aside>
          )}
          {children}
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Layout
