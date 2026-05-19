import { Download, File, FileText } from 'lucide-react'
import type { FileContent } from '@spark/types'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FileCardProps {
  content: FileContent
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileCard({ content }: FileCardProps) {
  const isImage =
    content.fileType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(content.fileName)

  return (
    <Card className="gap-0 py-0 ring-1 ring-border" size="sm">
      <CardContent className="flex items-center gap-3 p-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            isImage
              ? 'bg-primary/15 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isImage ? <FileText className="size-5" /> : <File className="size-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{content.fileName}</p>
          {content.fileSize != null && (
            <p className="text-muted-foreground text-xs">
              {formatFileSize(content.fileSize)}
            </p>
          )}
        </div>

        {content.url && (
          <a
            className={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost' }))}
            download={content.fileName}
            href={content.url}
            title="下载文件"
          >
            <Download className="size-4" />
          </a>
        )}
      </CardContent>

      {isImage && content.url && (
        <img
          alt={content.fileName}
          className="max-w-full border-t"
          src={content.url}
        />
      )}
    </Card>
  )
}
