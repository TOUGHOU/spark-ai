import type { ThinkingContent } from '@spark/types'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'

interface ThinkingCardProps {
  content: ThinkingContent
}

export function ThinkingCard({ content }: ThinkingCardProps) {
  const isStreaming = !content.isComplete

  return (
    <Reasoning defaultOpen isStreaming={isStreaming}>
      <ReasoningTrigger
        getThinkingMessage={(streaming) =>
          streaming ? '正在思考...' : '思考完成'
        }
      />
      <ReasoningContent>{content.content}</ReasoningContent>
    </Reasoning>
  )
}
