import React from 'react'

// CSS is trusted source code, never user content. Style elements are raw-text
// HTML elements: escaped children such as &gt; cause hydration mismatches.
const InlineStyles: React.FC<{ css: string }> = ({ css }) => (
  <style dangerouslySetInnerHTML={{ __html: css }} />
)

export default InlineStyles
