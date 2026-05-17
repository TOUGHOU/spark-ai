import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { CodeContent } from '@spark/types'

interface CodeCardProps {
  content: CodeContent
}

export function CodeCard({ content }: CodeCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 uppercase">
          {content.language || 'code'}
        </span>
        {content.copyable && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="复制代码"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-gray-400" />
            )}
          </button>
        )}
      </div>
      
      {/* Code */}
      <pre className="p-3 overflow-x-auto">
        <code className="text-gray-100">{content.code}</code>
      </pre>
    </div>
  )
}
