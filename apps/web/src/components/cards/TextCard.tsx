import type { TextContent } from '@spark/types'

interface TextCardProps {
  content: TextContent
}

export function TextCard({ content }: TextCardProps) {
  if (content.markdown) {
    return (
      <div className="prose prose-invert prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text) }} />
      </div>
    )
  }

  return <p className="whitespace-pre-wrap">{content.text}</p>
}

// Simple markdown renderer (you can replace with react-markdown or marked)
function renderMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>')
}
