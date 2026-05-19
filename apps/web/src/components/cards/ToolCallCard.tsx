import type { ToolCallContent } from '@spark/types'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import { mapToolCallToUIPart } from '@/lib/aiElementsAdapters'

interface ToolCallCardProps {
  content: ToolCallContent
}

export function ToolCallCard({ content }: ToolCallCardProps) {
  const part = mapToolCallToUIPart(content)

  return (
    <Tool defaultOpen>
      <ToolHeader
        state={part.state}
        title={content.toolName}
        type={part.type}
      />
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput errorText={part.errorText} output={part.output} />
      </ToolContent>
    </Tool>
  )
}
