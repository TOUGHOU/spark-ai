import { useState } from 'react'
import { toast } from 'sonner'
import { Download, Link2, Loader2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ParsedVideo {
  videoId: string
  title: string
  previewUrl: string
}

type PageStatus = 'idle' | 'parsing' | 'parsed' | 'downloading' | 'done' | 'error'

export function DouyinDownloadPage() {
  const [shareLink, setShareLink] = useState('')
  const [parsed, setParsed] = useState<ParsedVideo | null>(null)
  const [status, setStatus] = useState<PageStatus>('idle')
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleParse = async () => {
    const link = shareLink.trim()
    if (!link) {
      toast.error('请输入抖音分享链接')
      return
    }

    setParsed(null)
    setStatus('parsing')

    try {
      const res = await fetch('/api/douyin/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareLink: link }),
      })
      const data = await res.json()

      if (!res.ok || data.status === 'error') {
        throw new Error(data.error || '解析失败')
      }

      setParsed({
        videoId: data.videoId,
        title: data.title,
        previewUrl: data.previewUrl,
      })
      setStatus('parsed')
    } catch (err) {
      setStatus('error')
      toast.error(err instanceof Error ? err.message : '解析失败')
    }
  }

  const handleDownload = async () => {
    const link = shareLink.trim()
    if (!link) return

    setDownloadProgress(0)
    setStatus('downloading')

    try {
      const res = await fetch('/api/douyin/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareLink: link }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `下载失败 (${res.status})`)
      }

      const contentLength = Number(res.headers.get('Content-Length') || 0)
      const disposition = res.headers.get('Content-Disposition') || ''
      const filenameMatch = disposition.match(/filename\*=UTF-8''(.+)/)
      const filename = filenameMatch
        ? decodeURIComponent(filenameMatch[1])
        : `${parsed?.videoId || 'douyin'}.mp4`

      const reader = res.body?.getReader()
      if (!reader) throw new Error('无法读取视频流')

      const chunks: Uint8Array[] = []
      let received = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          chunks.push(value)
          received += value.length
          if (contentLength > 0) {
            setDownloadProgress(Math.round((received / contentLength) * 100))
          }
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)

      setDownloadProgress(100)
      setStatus('done')
      toast.success('已保存到下载目录')
    } catch (err) {
      setStatus('error')
      toast.error(err instanceof Error ? err.message : '下载失败')
    }
  }

  const isBusy = status === 'parsing' || status === 'downloading'

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-center gap-2 px-0.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Video className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight">抖音视频下载</h1>
            <p className="text-muted-foreground text-xs leading-tight">
              粘贴分享链接，解析预览后下载
            </p>
          </div>
        </div>

        <Card
          className={cn(
            'flex min-h-0 flex-col py-0',
            parsed && 'min-h-0 flex-1',
          )}
        >
          <CardContent
            className={cn(
              'flex flex-col gap-3 p-3',
              parsed && 'min-h-0 flex-1',
            )}
          >
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Link2 className="absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 w-full pl-8 text-sm"
                  placeholder="粘贴分享链接或分享文案"
                  value={shareLink}
                  disabled={isBusy}
                  onChange={e => {
                    setShareLink(e.target.value)
                    if (status !== 'idle' && status !== 'error') {
                      setStatus('idle')
                      setParsed(null)
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isBusy) handleParse()
                  }}
                />
              </div>
              <Button
                className="h-9 shrink-0 px-3 text-sm"
                size="sm"
                type="button"
                disabled={isBusy || !shareLink.trim()}
                onClick={handleParse}
              >
                {status === 'parsing' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  '解析'
                )}
              </Button>
              <Button
                className="h-9 shrink-0 gap-1.5 px-3 text-sm"
                size="sm"
                type="button"
                variant="secondary"
                disabled={isBusy || !shareLink.trim()}
                onClick={handleDownload}
              >
                {status === 'downloading' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Download className="size-3.5" />
                    下载
                  </>
                )}
              </Button>
            </div>

            {status === 'downloading' && (
              <div className="shrink-0 space-y-1">
                <Progress className="h-1" value={downloadProgress} />
                <p className="text-muted-foreground text-center text-[11px]">
                  {downloadProgress > 0
                    ? `${downloadProgress}%`
                    : '连接中…'}
                </p>
              </div>
            )}

            {parsed && (
              <div className="flex min-h-0 flex-1 flex-col gap-2 border-t pt-3">
                <p
                  className="shrink-0 text-sm font-medium"
                  title={parsed.title}
                >
                  {parsed.title}
                </p>
                <div className="flex min-h-0 flex-1 overflow-hidden rounded-md border bg-black">
                  <video
                    key={parsed.previewUrl}
                    className="size-full object-contain"
                    src={parsed.previewUrl}
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
