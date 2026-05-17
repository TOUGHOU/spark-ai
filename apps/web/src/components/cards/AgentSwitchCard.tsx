import { ArrowRight, Bot } from 'lucide-react'
import type { AgentSwitchContent } from '@spark/types'

interface AgentSwitchCardProps {
  content: AgentSwitchContent
}

export function AgentSwitchCard({ content }: AgentSwitchCardProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-2">
      {content.fromAgent && (
        <>
          <Bot size={14} />
          <span>{content.fromAgent}</span>
        </>
      )}
      <ArrowRight size={14} className="mx-1" />
      <Bot size={14} className="text-blue-400" />
      <span className="text-blue-400">{content.toAgent}</span>
      
      {content.reason && (
        <span className="text-gray-500">({content.reason})</span>
      )}
    </div>
  )
}
