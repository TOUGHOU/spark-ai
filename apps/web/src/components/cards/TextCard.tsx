import type { TextContent } from '@spark/types'
import { MessageResponse } from '@/components/ai-elements/message'

interface TextCardProps {
  content: TextContent
}

export function TextCard({ content }: TextCardProps) {
  if (content.markdown) {
    return <MessageResponse>{content.text}</MessageResponse>
  }

  return <p className="whitespace-pre-wrap text-sm">{content.text}</p>
}
