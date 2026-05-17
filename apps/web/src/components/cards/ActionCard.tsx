import { Link, ExternalLink } from 'lucide-react'
import type { ActionContent } from '@spark/types'

interface ActionCardProps {
  content: ActionContent
  onAction?: (value: string) => void
}

export function ActionCard({ content, onAction }: ActionCardProps) {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 border border-gray-600',
  }

  const variant = content.variant || 'secondary'

  if (content.actionType === 'link' && content.href) {
    return (
      <a
        href={content.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${variantStyles[variant]}`}
      >
        <Link size={14} />
        {content.label}
        <ExternalLink size={12} />
      </a>
    )
  }

  return (
    <button
      onClick={() => onAction?.(content.value || content.label)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${variantStyles[variant]}`}
    >
      {content.label}
    </button>
  )
}
