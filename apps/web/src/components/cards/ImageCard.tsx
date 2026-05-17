import { useState } from 'react'
import { Image as ImageIcon, Loader } from 'lucide-react'
import type { ImageContent } from '@spark/types'

interface ImageCardProps {
  content: ImageContent
}

export function ImageCard({ content }: ImageCardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 max-w-sm">
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader size={24} className="animate-spin text-gray-400" />
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-400">
          <ImageIcon size={24} />
          <span className="text-sm mt-2">图片加载失败</span>
        </div>
      ) : (
        <img
          src={content.url}
          alt={content.alt || '图片'}
          className={`max-w-full ${loading ? 'hidden' : ''}`}
          style={{
            width: content.width ? `${content.width}px` : 'auto',
            height: content.height ? `${content.height}px` : 'auto',
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
        />
      )}
    </div>
  )
}
