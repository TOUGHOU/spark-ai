import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ThinkingContent } from '@spark/types'

interface ThinkingCardProps {
  content: ThinkingContent
}

export function ThinkingCard({ content }: ThinkingCardProps) {
  const [expanded, setExpanded] = useState(!content.isComplete)

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-300 hover:bg-purple-900/30 transition-colors"
      >
        <Brain size={14} className={content.isComplete ? 'text-purple-400' : 'animate-pulse'} />
        <span>{content.isComplete ? '思考完成' : '正在思考...'}</span>
        {expanded ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-3 pb-3 text-sm text-gray-300">
          <pre className="whitespace-pre-wrap font-mono text-xs">
            {content.content}
          </pre>
        </div>
      )}
    </div>
  )
}
