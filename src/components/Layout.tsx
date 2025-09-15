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
  categories?: string[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  getCategoryCount?: (category: string) => number
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  description,
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
        }
      }
    }
  `)

  const siteTitle = data.site.siteMetadata.title
  const siteDescription = data.site.siteMetadata.description
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const pageDescription = description || siteDescription

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
          maxWidth: '800px', // 블로그 컨테이너 너비
          margin: '0 auto',
          padding: 'var(--space-5)', // 20px
          width: '100%'
        }}>
          {children}
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Layout 