import {
  AlertCircle,
  AlertTriangle,
  Info,
  Shield,
  Zap,
} from 'lucide-react'
import type { SystemContent } from '@spark/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface SystemCardProps {
  content: SystemContent
}

const systemIcons = {
  welcome: Zap,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  context: Shield,
  limit: AlertTriangle,
}

const systemStyles = {
  welcome: 'border-primary/30 bg-primary/10',
  info: 'border-border bg-muted/50',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  error: 'border-destructive/30 bg-destructive/10',
  context: 'border-accent bg-accent/50',
  limit: 'border-orange-500/30 bg-orange-500/10',
}

export function SystemCard({ content }: SystemCardProps) {
  const systemType = content.systemType || 'info'
  const Icon = systemIcons[systemType]

  return (
    <Alert
      className={cn('w-full', systemStyles[systemType])}
      variant={systemType === 'error' ? 'destructive' : 'default'}
    >
      <Icon />
      <AlertDescription className="whitespace-pre-wrap">
        {content.content}
      </AlertDescription>
    </Alert>
  )
}
