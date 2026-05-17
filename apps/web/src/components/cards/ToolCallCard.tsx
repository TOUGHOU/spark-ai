import { Bot, CheckCircle, XCircle, Loader } from 'lucide-react'
import type { ToolCallContent } from '@spark/types'

interface ToolCallCardProps {
  content: ToolCallContent
}

export function ToolCallCard({ content }: ToolCallCardProps) {
  const status = content.status || 'pending'

  const StatusIcon = {
    pending: Loader,
    success: CheckCircle,
    error: XCircle,
  }[status]

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Bot size={14} className="text-blue-400" />
        <span className="text-sm font-medium text-blue-400">
          {content.toolName}
        </span>
        <StatusIcon 
          size={14} 
          className={
            status === 'pending' ? 'text-yellow-400 animate-spin' :
            status === 'success' ? 'text-green-400' : 'text-red-400'
          }
        />
      </div>

      {content.toolArgs && Object.keys(content.toolArgs).length > 0 && (
        <div className="text-xs text-gray-400 mb-2">
          <span className="text-gray-500">参数:</span>
          <pre className="mt-1 p-2 bg-gray-900 rounded overflow-x-auto">
            {JSON.stringify(content.toolArgs, null, 2)}
          </pre>
        </div>
      )}

      {content.toolResult && (
        <div className="text-xs text-gray-400">
          <span className="text-gray-500">结果:</span>
          <pre className="mt-1 p-2 bg-gray-900 rounded overflow-x-auto">
            {content.toolResult}
          </pre>
        </div>
      )}
    </div>
  )
}
