import type { CodeContent } from '@spark/types'
import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block'
import { toCodeBlockLanguage } from '@/lib/aiElementsAdapters'

interface CodeCardProps {
  content: CodeContent
}

export function CodeCard({ content }: CodeCardProps) {
  const language = toCodeBlockLanguage(content.language)

  return (
    <CodeBlock code={content.code} language={language}>
      {content.copyable !== false ? <CodeBlockCopyButton /> : null}
    </CodeBlock>
  )
}
