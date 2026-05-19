import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import type { ImageContent } from '@spark/types'
import { Loader } from '@/components/ai-elements/loader'
import { cn } from '@/lib/utils'

interface ImageCardProps {
  content: ImageContent
}

export function ImageCard({ content }: ImageCardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border bg-muted/50 p-8 text-muted-foreground">
        <ImageIcon className="size-6" />
        <span className="text-sm">图片加载失败</span>
      </div>
    )
  }

  return (
    <div className="relative max-w-sm overflow-hidden rounded-md">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader size={24} />
        </div>
      )}
      <img
        alt={content.alt || '图片'}
        className={cn(
          'h-auto max-w-full rounded-md',
          loading && 'invisible',
        )}
        height={content.height}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        onLoad={() => setLoading(false)}
        src={content.url}
        width={content.width}
      />
    </div>
  )
}
