import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../components/Layout"
import { ExternalLink } from "lucide-react"

interface PlaygroundPageProps {}

const PlaygroundPage: React.FC<PlaygroundPageProps> = () => {
  const data = useStaticQuery(graphql`
    query PlaygroundPageQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const siteTitle = data.site.siteMetadata.title

  // 개인 프로젝트 목록
  const projects = [
    {
      id: 1,
      title: "Dodge Game",
      description: "간단한 회피 게임으로 마우스로 캐릭터를 조작하여 장애물을 피하는 게임입니다.",
      url: "https://dodge-game-phi.vercel.app/",
      image: null, // 이미지 설정 방법:
      // 1. 로컬 이미지: "/images/playground/dodge-game.png" (static 폴더 기준)
      // 2. 외부 URL: "https://example.com/screenshot.png"
      // 3. null로 두면 아이콘 표시
      tags: ["Game", "JavaScript", "Canvas"],
      icon: "🎮" // 이미지가 없을 때 표시할 아이콘
    }
    // 추후 더 많은 프로젝트 추가 가능
  ]

  return (
    <Layout
      title={`Playground - ${siteTitle}`}
      description="개인적으로 만든 프로젝트들을 모아놓은 갤러리입니다."
    >
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* 헤더 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '36px',
            marginBottom: '16px',
            color: '#2d2823',
            fontWeight: 'bold',
            fontFamily: "'Iropke Batang', 'Pretendard Variable', 'Pretendard', serif"
          }}>
            Playground
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#4a453e',
            margin: '0'
          }}>
            개인적으로 만든 프로젝트들을 모아놓은 갤러리입니다.
          </p>
        </div>

        {/* 프로젝트 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                border: '1px solid #e8e4db',
                cursor: 'pointer'
              }}
              onClick={() => {
                window.open(project.url, '_blank', 'noopener,noreferrer')
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* 프로젝트 이미지 또는 아이콘 */}
              <div style={{
                width: '100%',
                height: '200px',
                background: project.image 
                  ? `url(${project.image}) center/cover`
                  : 'linear-gradient(135deg, #8b7d6b 0%, #6b645c 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {!project.image && (
                  <div style={{
                    fontSize: '64px',
                    opacity: 0.8
                  }}>
                    {project.icon}
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Live
                </div>
              </div>

              {/* 프로젝트 정보 */}
              <div style={{
                padding: '24px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  marginBottom: '12px',
                  color: '#2d2823',
                  fontWeight: '600'
                }}>
                  {project.title}
                </h3>
                
                <p style={{
                  fontSize: '14px',
                  color: '#4a453e',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}>
                  {project.description}
                </p>

                {/* 태그 */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '20px'
                }}>
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: '#f0ede6',
                        color: '#4a453e',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 클릭 안내 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#6b645c',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginTop: '8px'
                }}>
                  <ExternalLink size={12} />
                  <span>클릭하여 프로젝트 보기</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 메시지 (프로젝트가 없을 때) */}
        {projects.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <p style={{
              fontSize: '18px',
              color: '#6b645c',
              margin: '0'
            }}>
              아직 프로젝트가 없습니다. 곧 추가될 예정입니다!
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default PlaygroundPage
