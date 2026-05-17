import { FileText, Download, File } from 'lucide-react'
import type { FileContent } from '@spark/types'

interface FileCardProps {
  content: FileContent
}

export function FileCard({ content }: FileCardProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isImage = content.fileType?.startsWith('image/') || 
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(content.fileName)

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isImage ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'
        }`}>
          {isImage ? <FileText size={20} /> : <File size={20} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {content.fileName}
          </p>
          {content.fileSize && (
            <p className="text-xs text-gray-400">
              {formatFileSize(content.fileSize)}
            </p>
          )}
        </div>

        {/* Actions */}
        {content.url && (
          <a
            href={content.url}
            download={content.fileName}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="下载文件"
          >
            <Download size={16} className="text-gray-400" />
          </a>
        )}
      </div>

      {/* Preview for images */}
      {isImage && content.url && (
        <div className="mt-3">
          <img 
            src={content.url} 
            alt={content.fileName}
            className="max-w-full rounded-lg" 
          />
        </div>
      )}
    </div>
  )
}
