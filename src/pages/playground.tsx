import React from "react"
import Layout from "../components/Layout"
import { graphql, Link } from "gatsby"
import { BookOpen, ExternalLink } from "lucide-react"
import InlineStyles from "../components/InlineStyles"
import projectData from "../data/playground-projects.json"
import { SitePreviewThumbnail } from "../components/playground/SitePreviewThumbnail"

interface PlaygroundPageProps {
  data: {
    allMarkdownRemark: {
      nodes: {
        parent: { name: string }
        fields: { slug: string; isDraft: boolean }
        frontmatter: { title: string }
      }[]
    }
  }
}

interface Project {
  id: number
  title: string
  description: string
  url: string
  image: string | null
  tags: string[]
  icon: string
  status: string
  relatedPost?: string
  embedPreview?: boolean
  linkLabel?: string
}

const PlaygroundPage: React.FC<PlaygroundPageProps> = ({ data }) => {
  const projects: Project[] = projectData
  const postsByName = new Map(
    data.allMarkdownRemark.nodes.map((post) => [post.parent.name, post])
  )

  const sortedProjects = [...projects].sort((a, b) => b.id - a.id)

  return (
    <Layout
      title="Playground"
      description="개인적으로 만든 프로젝트들을 모아놓은 갤러리입니다."
      contentMaxWidth="1100px"
    >
      <InlineStyles
        css={`
          .project-link {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 40px;
            padding: 8px 12px;
            border: 1px solid transparent;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.4;
            text-decoration: none;
          }
          .project-link-primary {
            background: var(--color-primary-500);
            color: white;
          }
          .project-link-primary:hover {
            background: var(--color-primary-600);
            color: white;
          }
          .project-link-secondary {
            border-color: var(--color-border-default);
            color: var(--color-text-primary);
          }
          .project-link-secondary:hover {
            background: var(--color-background-secondary);
          }
          .project-post-pending {
            text-align: center;
            padding: 8px 12px;
            color: var(--color-text-secondary);
            font-size: 13px;
          }
        `}
      />
      <div
        style={{
          margin: "0 auto",
          padding: "20px 0 40px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px"
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              marginBottom: "16px",
              color: "#2d2823",
              fontWeight: "bold",
              fontFamily:
                "'Iropke Batang', 'Pretendard Variable', 'Pretendard', serif"
            }}
          >
            Playground
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#4a453e",
              margin: "0"
            }}
          >
            개인적으로 만든 프로젝트들을 모아놓은 갤러리입니다.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px"
          }}
        >
          {sortedProjects.map((project) => {
            const relatedPost = project.relatedPost
              ? postsByName.get(project.relatedPost)
              : undefined
            return (
              <article
                key={project.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e8e4db",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <SitePreviewThumbnail
                  url={project.url}
                  title={project.title}
                  image={project.image}
                  icon={project.icon}
                  status={project.status === "close" ? "close" : "live"}
                  allowIframe={project.embedPreview !== false}
                />

                <div
                  style={{
                    padding: "24px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      marginBottom: "12px",
                      color: "#2d2823",
                      fontWeight: "600"
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
                      flex: 1
                    }}
                  >
                    {project.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "20px"
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
                          fontWeight: "500"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <a
                      className="project-link project-link-primary"
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} ${
                        project.linkLabel || "열기"
                      } (새 탭)`}
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      {project.linkLabel || "열기"}
                    </a>
                    {relatedPost ? (
                      <Link
                        className="project-link project-link-secondary"
                        to={relatedPost.fields.slug}
                        aria-label={`${relatedPost.frontmatter.title}${
                          relatedPost.fields.isDraft
                            ? " (초안 미리보기)"
                            : " 읽기"
                        }`}
                      >
                        <BookOpen size={14} aria-hidden="true" />
                        {relatedPost.fields.isDraft
                          ? "제작기 미리보기 · 초안"
                          : "제작기 읽기"}
                      </Link>
                    ) : project.relatedPost ? (
                      <span className="project-post-pending">
                        제작기 준비 중
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {sortedProjects.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px"
            }}
          >
            <p
              style={{
                fontSize: "18px",
                color: "#6b645c",
                margin: "0"
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

export const query = graphql`
  query PlaygroundPage($allowedDraftStates: [Boolean!]!) {
    allMarkdownRemark(
      filter: { fields: { isDraft: { in: $allowedDraftStates } } }
    ) {
      nodes {
        parent {
          ... on File {
            name
          }
        }
        fields {
          slug
          isDraft
        }
        frontmatter {
          title
        }
      }
    }
  }
`
