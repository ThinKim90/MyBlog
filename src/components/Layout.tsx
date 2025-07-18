import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Header from "./Header"
import Footer from "./Footer"
import { Helmet } from "react-helmet"

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  location?: any
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  description,
  location 
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Savate:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* 글로벌 스타일 */}
        <style>
          {`
            * {
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              background: #f8f6f0;
              min-height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: #2d2823;
              word-break: keep-all;
              word-wrap: break-word;
            }
            
            html {
              scroll-behavior: smooth;
            }
            
            h1, h2, h3, h4, h5, h6 {
              font-weight: 600;
              line-height: 1.3;
              margin-top: 0;
            }
            
            p {
              margin-bottom: 1rem;
            }
            
            a {
              color: #4a453e;
              transition: color 0.3s ease;
            }
            
            a:hover {
              color: #2d2823;
            }
            
            /* 스크롤바 스타일링 */
            ::-webkit-scrollbar {
              width: 8px;
            }
            
            ::-webkit-scrollbar-track {
              background: #f0ede6;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #a69688;
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #8b7d6b;
            }
            
            /* 코드 블록 개선 */
            pre {
              background: #2d3748 !important;
              border-radius: 8px !important;
              padding: 1rem !important;
              overflow-x: auto !important;
              margin: 1.5rem 0 !important;
            }
            
            code {
              font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace !important;
            }
            
            /* 인라인 코드 */
            p code, li code {
              background: rgba(166, 150, 136, 0.15) !important;
              color: #4a453e !important;
              padding: 2px 6px !important;
              border-radius: 4px !important;
              font-size: 0.9em !important;
            }
            
            /* 블록쿼트 스타일 */
            blockquote {
              border-left: 4px solid #a69688;
              margin: 1.5rem 0;
              padding: 1rem 1.5rem;
              background: rgba(166, 150, 136, 0.1);
              border-radius: 0 8px 8px 0;
              font-style: italic;
            }
            
            /* 이미지 반응형 */
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            /* 테이블 스타일 */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.5rem 0;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            th, td {
              padding: 12px 15px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }
            
            th {
              background: #8b7d6b;
              color: white;
              font-weight: 600;
            }
            
            tr:hover {
              background: rgba(166, 150, 136, 0.1);
            }
          `}
        </style>
      </Helmet>

      <Header siteTitle={siteTitle} />
      
      <main style={{
        flex: '1',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        width: '100%'
      }}>
        {children}
      </main>
      
      <Footer />
    </div>
  )
}

export default Layout 