import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../components/Layout"
import { ExternalLink } from "lucide-react"
import { Button } from "../components/ui/Button"
import { SitePreviewThumbnail } from "../components/playground/SitePreviewThumbnail"

interface PlaygroundPageProps {}

interface Project {
  id: number
  title: string
  description: string
  url: string
  image: string | null
  tags: string[]
  icon: string
  status: "live" | "close"
}

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

  const projects: Project[] = [
    {
      id: 1,
      title: "Dodge Game",
      description:
        "간단한 회피 게임으로 마우스로 캐릭터를 조작하여 장애물을 피하는 게임입니다.",
      url: "https://dodge-game-phi.vercel.app/",
      image: null,
      tags: ["Game", "JavaScript", "Canvas"],
      icon: "🎮",
      status: "live",
    },
    {
      id: 2,
      title: "Odd Color Out",
      description:
        "제한 시간 안에 다른 밝기의 칩을 찾아 최고 기록에 도전하는 색상 구별 게임입니다.",
      url: "https://odd-color-out-five.vercel.app/",
      image: null,
      tags: ["Game", "React", "Color Perception"],
      icon: "🎨",
      status: "live",
    },
    {
      id: 3,
      title: "진짜 고수",
      description:
        "트렌드에 맞춘 진짜 고수의 이유있는 선택. 매일 아침 7시, 남들과 다른 투자 아이디어를 만나보세요.",
      url: "https://jinjja-gosu.vercel.app/",
      image: null,
      tags: ["Service", "AI", "Investment"],
      icon: "🧠",
      status: "close",
    },
    {
      id: 4,
      title: "ASCII Studio",
      description:
        "이미지나 GIF를 90년대 맥 터미널 감성의 ASCII 아트로 변환하는 크리에이티브 스튜디오입니다.",
      url: "https://ascii-studio-ten.vercel.app/",
      image: null,
      tags: ["Tool", "ASCII Art", "Creative"],
      icon: "✏️",
      status: "live",
    },
    {
      id: 5,
      title: "StellarPath",
      description:
        "집중할 때마다 별이 생기는 생산성 앱. 매일의 노력이 쌓여 나만의 우주를 만듭니다.",
      url: "https://stellar-path.vercel.app/",
      image: null,
      tags: ["Productivity", "Focus", "Visualization"],
      icon: "✨",
      status: "live",
    },
    {
      id: 6,
      title: "취향노트",
      description:
        "커피 원두 시음 기록 앱. 내 커피 취향을 기록하고 선호하는 맛을 찾아갈 수 있습니다.",
      url: "https://taste-notes-sandy.vercel.app/",
      image: null,
      tags: ["Coffee", "Notes", "Tasting"],
      icon: "☕",
      status: "live",
    },
  ]

  const sortedProjects = [...projects].sort((a, b) => b.id - a.id)

  return (
    <Layout
      title={`Playground - ${siteTitle}`}
      description="개인적으로 만든 프로젝트들을 모아놓은 갤러리입니다."
      contentMaxWidth="1100px"
    >
      <div
        style={{
          margin: "0 auto",
          padding: "20px 0 40px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              marginBottom: "16px",
              color: "#2d2823",
              fontWeight: "bold",
              fontFamily:
                "'Iropke Batang', 'Pretendard Variable', 'Pretendard', serif",
            }}
          >
            Playground
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#4a453e",
              margin: "0",
            }}
          >
            개인적으로 만든 프로젝트들을 모아놓은 갤러리입니다.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
          }}
        >
          {sortedProjects.map((project) => (
            <article
              key={project.id}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e8e4db",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SitePreviewThumbnail
                url={project.url}
                title={project.title}
                image={project.image}
                icon={project.icon}
                status={project.status}
              />

              <div
                style={{
                  padding: "24px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    marginBottom: "12px",
                    color: "#2d2823",
                    fontWeight: "600",
                  }}
                >
                  {project.title}
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#4a453e",
                    lineHeight: "1.6",
                    marginBottom: "16px",
                    flex: 1,
                  }}
                >
                  {project.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "20px",
                  }}
                >
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "#f0ede6",
                        color: "#4a453e",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() =>
                    window.open(project.url, "_blank", "noopener,noreferrer")
                  }
                  leftIcon={<ExternalLink size={14} />}
                >
                  열기
                </Button>
              </div>
            </article>
          ))}
        </div>

        {sortedProjects.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                color: "#6b645c",
                margin: "0",
              }}
            >
              아직 프로젝트가 없습니다. 곧 추가될 예정입니다!
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default PlaygroundPage
