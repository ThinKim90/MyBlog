import React, { useEffect, useRef, useState } from "react"
import { Monitor } from "lucide-react"

interface SitePreviewThumbnailProps {
  url: string
  title: string
  image?: string | null
  icon: string
  status?: "live" | "close"
  allowIframe?: boolean
}

const PREVIEW_HEIGHT = 200
const IFRAME_HEIGHT = 800
const PREVIEW_SCALE = PREVIEW_HEIGHT / IFRAME_HEIGHT

export const SitePreviewThumbnail: React.FC<SitePreviewThumbnailProps> = ({
  url,
  title,
  image,
  icon,
  status = "live",
  allowIframe = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageFailed, setImageFailed] = useState(false)

  const showIframe = allowIframe && !image && !imageFailed

  useEffect(() => {
    if (image || !allowIframe) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "120px" }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [image, allowIframe])

  useEffect(() => {
    if (!isVisible || image || !allowIframe) return

    const timeout = window.setTimeout(() => {
      setIsLoading(false)
    }, 6000)

    return () => window.clearTimeout(timeout)
  }, [isVisible, image, allowIframe])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${PREVIEW_HEIGHT}px`,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #8b7d6b 0%, #6b645c 100%)",
      }}
    >
      {image && !imageFailed && (
        <img
          src={image}
          alt={`${title} 미리보기`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageFailed(true)
            setIsLoading(false)
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      )}

      {showIframe && isVisible && (
        <iframe
          key={url}
          src={url}
          title={`${title} 미리보기`}
          loading="lazy"
          tabIndex={-1}
          onLoad={() => setIsLoading(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${100 / PREVIEW_SCALE}%`,
            height: `${IFRAME_HEIGHT}px`,
            border: "none",
            transformOrigin: "top left",
            transform: `scale(${PREVIEW_SCALE})`,
            pointerEvents: "none",
            background: "#ffffff",
          }}
        />
      )}

      {isLoading && isVisible && (showIframe || (image && !imageFailed)) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "14px",
            gap: "8px",
            background: "rgba(45, 40, 35, 0.35)",
            zIndex: 1,
          }}
        >
          <Monitor size={16} />
          <span>미리보기 불러오는 중...</span>
        </div>
      )}

      {(imageFailed || (!image && !allowIframe)) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "64px", opacity: 0.8 }}>{icon}</span>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background:
            status === "live" ? "rgba(0, 0, 0, 0.7)" : "rgba(107, 100, 92, 0.9)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "500",
          zIndex: 2,
        }}
      >
        {status === "live" ? "Live" : "Close"}
      </div>
    </div>
  )
}
