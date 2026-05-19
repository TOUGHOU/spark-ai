import { ExternalLink, Link } from 'lucide-react'
import type { ActionContent } from '@spark/types'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActionCardProps {
  content: ActionContent
  onAction?: (value: string) => void
}

const variantStyles = {
  primary: 'default' as const,
  secondary: 'secondary' as const,
  danger: 'destructive' as const,
  ghost: 'ghost' as const,
}

export function ActionCard({ content, onAction }: ActionCardProps) {
  const variant = variantStyles[content.variant || 'secondary']

  if (content.actionType === 'link' && content.href) {
    return (
      <a
        className={cn(buttonVariants({ size: 'sm', variant }), 'inline-flex gap-2')}
        href={content.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Link className="size-3.5" />
        {content.label}
        <ExternalLink className="size-3" />
      </a>
    )
  }

  return (
    <button
      className={cn(buttonVariants({ size: 'sm', variant }), 'inline-flex gap-2')}
      type="button"
      onClick={() => onAction?.(content.value || content.label)}
    >
      {content.label}
    </button>
  )
}
