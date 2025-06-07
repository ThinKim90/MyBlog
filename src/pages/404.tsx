import React from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"

const NotFoundPage: React.FC = () => {
  return (
    <Layout title="페이지를 찾을 수 없습니다" description="요청하신 페이지를 찾을 수 없습니다.">
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* 404 일러스트 */}
        <div style={{
          fontSize: '120px',
          marginBottom: '20px',
          color: '#2d2823',
          fontWeight: 'bold'
        }}>
          404
        </div>

        {/* 에러 메시지 */}
        <h1 style={{
          fontSize: '32px',
          marginBottom: '15px',
          color: '#2d2823',
          fontWeight: '600'
        }}>
          페이지를 찾을 수 없습니다
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#4a453e',
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          죄송합니다. 요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br />
          URL을 다시 확인하시거나 홈페이지로 이동해주세요.
        </p>

        {/* 액션 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              background: '#8b7d6b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(139,125,107,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6b645c'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,125,107,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8b7d6b'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(139,125,107,0.3)'
            }}
          >
            <span style={{ marginRight: '8px', fontSize: '18px' }}>🏠</span>
            홈으로 돌아가기
          </Link>

          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              background: 'transparent',
              color: '#4a453e',
              border: '2px solid #4a453e',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a453e'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#4a453e'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span style={{ marginRight: '8px', fontSize: '18px' }}>⬅️</span>
            이전 페이지로
          </button>
        </div>

        {/* 도움말 섹션 */}
        <div style={{
          background: 'rgba(166,150,136,0.1)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(166,150,136,0.2)'
        }}>
          <h3 style={{
            fontSize: '18px',
            marginBottom: '15px',
            color: '#2d2823'
          }}>
            💡 도움이 필요하신가요?
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            fontSize: '14px',
            color: '#4a453e'
          }}>
            <div>
              <strong>📚 블로그 포스트 보기</strong><br />
              최신 포스트들을 확인해보세요
            </div>
            <div>
              <strong>📁 카테고리 탐색</strong><br />
              관심 있는 주제를 찾아보세요
            </div>
            <div>
              <strong>💻 GitHub 방문</strong><br />
              소스 코드를 확인할 수 있습니다
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default NotFoundPage 