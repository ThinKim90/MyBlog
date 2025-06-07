import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../components/Layout"

const AboutPage: React.FC = () => {
  const data = useStaticQuery(graphql`
    query AboutPageQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  
  const siteTitle = data.site.siteMetadata.title
  const frontendTechs = ['React', 'TypeScript', 'Gatsby', 'HTML/CSS', 'JavaScript']
  const tools = ['Git/GitHub', 'Node.js', 'GraphQL', 'VS Code', 'Figma']

  return (
    <Layout
      title={`About - ${siteTitle}`}
      description="개발자 김세형에 대한 소개 페이지입니다. 기술 스택과 경험을 확인해보세요."
    >
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* 헤더 섹션 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <div style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: '#8b7d6b',
            margin: '0 auto 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px',
            boxShadow: '0 10px 30px rgba(166,150,136,0.2)'
          }}>
            👨‍💻
          </div>
          
          <h1 style={{
            fontSize: '36px',
            marginBottom: '15px',
            color: '#2d2823',
            fontWeight: 'bold'
          }}>
            안녕하세요! 김세형입니다
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#4a453e',
            marginBottom: '0'
          }}>
            끊임없이 배우고 성장하는 개발자
          </p>
        </div>

        {/* 자기소개 섹션 */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '28px',
            marginBottom: '20px',
            color: '#2d2823',
            paddingBottom: '10px',
            borderBottom: '3px solid #8b7d6b',
            display: 'inline-block'
          }}>
            🙋‍♂️ 자기소개
          </h2>
          
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(166,150,136,0.15)',
            lineHeight: '1.8'
          }}>
            <p style={{ 
              fontSize: '16px', 
              color: '#4a453e',
              marginBottom: '20px' 
            }}>
              안녕하세요! 풀스택 개발자를 꿈꾸는 <strong>김세형</strong>입니다. 
              현재 <strong>React</strong>와 <strong>TypeScript</strong>를 중심으로 한 프론트엔드 개발에 집중하고 있으며, 
              사용자 경험을 중시하는 웹 애플리케이션을 만들어가고 있습니다.
            </p>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#4a453e',
              marginBottom: '20px' 
            }}>
              새로운 기술을 배우는 것을 좋아하고, 문제를 해결하는 과정에서 오는 성취감을 중요하게 생각합니다. 
              코딩뿐만 아니라 UI/UX 디자인에도 관심이 많아 사용자 중심의 개발을 추구합니다.
            </p>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#4a453e',
              marginBottom: '0' 
            }}>
              이 블로그는 제가 개발하면서 겪은 경험과 배운 내용들을 기록하고 공유하는 공간입니다. 
              함께 성장할 수 있는 개발자 커뮤니티에 기여하고 싶습니다.
            </p>
          </div>
        </section>

        {/* 기술 스택 섹션 */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '28px',
            marginBottom: '30px',
            color: '#2d2823',
            paddingBottom: '10px',
            borderBottom: '3px solid #8b7d6b',
            display: 'inline-block'
          }}>
            💻 기술 스택
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {/* Frontend */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(166,150,136,0.15)'
            }}>
              <h3 style={{
                fontSize: '20px',
                marginBottom: '20px',
                color: '#2d2823',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>🎨</span>
                Frontend
              </h3>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {frontendTechs.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      background: '#f0ede6',
                      color: '#4a453e',
                      padding: '8px 15px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid #e8e4db'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(166,150,136,0.15)'
            }}>
              <h3 style={{
                fontSize: '20px',
                marginBottom: '20px',
                color: '#2d2823',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>🛠️</span>
                Tools
              </h3>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {tools.map((tool) => (
                  <span
                    key={tool}
                    style={{
                      background: '#f0ede6',
                      color: '#4a453e',
                      padding: '8px 15px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid #e8e4db'
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 연락처 섹션 */}
        <section>
          <h2 style={{
            fontSize: '28px',
            marginBottom: '30px',
            color: '#2d2823',
            paddingBottom: '10px',
            borderBottom: '3px solid #8b7d6b',
            display: 'inline-block'
          }}>
            📫 연락처
          </h2>
          
          <div style={{
            textAlign: 'center',
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(166,150,136,0.15)'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#4a453e',
              marginBottom: '30px'
            }}>
              언제든지 연락해 주세요! 함께 이야기하고 싶습니다 😊
            </p>
            
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="mailto:your.email@example.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#8b7d6b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '16px',
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
                <span style={{ fontSize: '20px' }}>📧</span>
                이메일 보내기
              </a>
              
              <a
                href="https://github.com/kimsaehyoung"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#8b7d6b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '16px',
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
                <span style={{ fontSize: '20px' }}>💻</span>
                GitHub 방문
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default AboutPage 