import { ArrowRight, Bot } from 'lucide-react'
import type { AgentSwitchContent } from '@spark/types'
import { Badge } from '@/components/ui/badge'

interface AgentSwitchCardProps {
  content: AgentSwitchContent
}

export function AgentSwitchCard({ content }: AgentSwitchCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
      {content.fromAgent && (
        <Badge className="gap-1 font-normal" variant="secondary">
          <Bot className="size-3" />
          {content.fromAgent}
        </Badge>
      )}
      <ArrowRight className="size-4 shrink-0" />
      <Badge className="gap-1 font-normal" variant="default">
        <Bot className="size-3" />
        {content.toAgent}
      </Badge>
      {content.reason && (
        <span className="text-muted-foreground text-xs">({content.reason})</span>
      )}
    </div>
  )
}
