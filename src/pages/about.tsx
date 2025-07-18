import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../components/Layout"

const AboutPage: React.FC = () => {
  const data = useStaticQuery(graphql`
    query AboutPageQuery {
      site {
        siteMetadata {
          title
          contact {
            email
            github
          }
        }
      }
    }
  `)
  
  // UX/UI 디자이너 시작 연도 (본인의 실제 시작 연도로 수정하세요)
  const CAREER_START_YEAR = 2019 // 2025년 기준 7년차이므로 2019년 시작
  
  // 현재 연차 계산 함수
  const calculateYearsOfExperience = () => {
    const currentYear = new Date().getFullYear()
    return currentYear - CAREER_START_YEAR + 1 // +1은 첫 해도 1년차로 계산
  }
  
  const siteTitle = data.site.siteMetadata.title
  const contact = data.site.siteMetadata.contact
  const designSkills = ['Figma', 'Prototyping', 'Design System', 'User Research']
  const tools = ['기본적인 Adobe 툴들', 'Figma', 'Notion', '친해지고 있는 GPT', '친해지고 싶은 Cursor']

  return (
    <Layout
      title={`About - ${siteTitle}`}
      description="UX/UI 디자이너 Thin에 대한 소개 페이지입니다. 기술 스택과 경험을 확인해보세요."
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
            안녕하세요, UX/UI 디자이너 띤입니다!
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#4a453e',
            marginBottom: '0'
          }}>
            가늘고 길게, 그러나 뾰족하게 성장하고 싶은 {calculateYearsOfExperience()}년차 UX/UI 디자이너.
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
              안녕하세요! UX/UI 디자이너 <strong>Thin</strong>입니다. 
            </p>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#4a453e',
              marginBottom: '20px' 
            }}>
              다양한 기술 기반 B2B 환경에서 사용자 경험을 구조화하고 제품화하는 과정에 참여해왔으며, 문제 정의 단계부터 사용자 인터뷰, IA 설계, 디자인 시스템 구축, 린 MVP 실험까지의 전 과정을 실무 속에서 경험했습니다.
            </p>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#4a453e',
              marginBottom: '0' 
            }}>
              이 블로그는 프로젝트 경험 및 회고 뿐만 아니라 관심사 기록 및 다양한 경험들을 공유하는 공간입니다. 가늘고 길게, 그러나 뾰족하게 —
              성장하는 과정을 남기고 있습니다.
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
            {/* Design Skills */}
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
                Design Skills
              </h3>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {designSkills.map((skill) => (
                  <span
                    key={skill}
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
                    {skill}
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
                href={`mailto:${contact.email}`}
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
                <span style={{ fontSize: '20px' }}>📧</span>
                이메일 보내기
              </a>
              
              <a
                href={contact.github}
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