import React from "react"

const DraftBadge: React.FC = () => (
  <span style={{
    display: "inline-block",
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: "12px",
    background: "#fff0ce",
    color: "#6b4710",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: "1.2",
  }}>
    초안 · 미발행
  </span>
)

export default DraftBadge
