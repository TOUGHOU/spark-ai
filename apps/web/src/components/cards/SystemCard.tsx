import { Info, AlertTriangle, AlertCircle, Zap, Shield } from 'lucide-react'
import type { SystemContent } from '@spark/types'

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
  welcome: 'bg-blue-900/20 border-blue-500/30 text-blue-300',
  info: 'bg-gray-800/50 border-gray-600/30 text-gray-300',
  warning: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300',
  error: 'bg-red-900/20 border-red-500/30 text-red-300',
  context: 'bg-purple-900/20 border-purple-500/30 text-purple-300',
  limit: 'bg-orange-900/20 border-orange-500/30 text-orange-300',
}

export function SystemCard({ content }: SystemCardProps) {
  const Icon = systemIcons[content.systemType || 'info']
  const style = systemStyles[content.systemType || 'info']

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${style}`}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <div className="text-sm whitespace-pre-wrap">
        {content.content}
      </div>
    </div>
  )
}
