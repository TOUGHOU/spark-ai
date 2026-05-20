import { useState } from 'react'
import { Download, Link2, Loader2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ParsedVideo {
  videoId: string
  title: string
}

type PageStatus = 'idle' | 'parsing' | 'parsed' | 'downloading' | 'done' | 'error'

export function DouyinDownloadPage() {
  const [shareLink, setShareLink] = useState('')
  const [parsed, setParsed] = useState<ParsedVideo | null>(null)
  const [status, setStatus] = useState<PageStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleParse = async () => {
    const link = shareLink.trim()
    if (!link) {
      setError('请输入抖音分享链接')
      return
    }

    setError(null)
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

      setParsed({ videoId: data.videoId, title: data.title })
      setStatus('parsed')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : '解析失败')
    }
  }

  const handleDownload = async () => {
    const link = shareLink.trim()
    if (!link) return

    setError(null)
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
      if (!reader) {
        throw new Error('无法读取视频流')
      }

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
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : '下载失败')
    }
  }

  const isBusy = status === 'parsing' || status === 'downloading'

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Video className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">抖音视频下载</h1>
          <p className="text-muted-foreground text-sm">
            粘贴分享链接，解析后下载无水印视频到本地
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">分享链接</CardTitle>
            <CardDescription>
              支持完整分享文案，会自动提取其中的链接
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="粘贴抖音分享链接或分享文案..."
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

            <div className="flex gap-2">
              <Button
                className="flex-1"
                type="button"
                disabled={isBusy || !shareLink.trim()}
                onClick={handleParse}
              >
                {status === 'parsing' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    解析中...
                  </>
                ) : (
                  '解析视频'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isBusy || !shareLink.trim()}
                onClick={handleDownload}
              >
                {status === 'downloading' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    下载中...
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    直接下载
                  </>
                )}
              </Button>
            </div>

            {status === 'downloading' && (
              <div className="space-y-2">
                <Progress value={downloadProgress} />
                <p className="text-center text-muted-foreground text-xs">
                  {downloadProgress > 0
                    ? `下载进度 ${downloadProgress}%`
                    : '正在连接服务器...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {parsed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">视频信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">标题：</span>
                {parsed.title}
              </p>
              <p>
                <span className="text-muted-foreground">视频 ID：</span>
                {parsed.videoId}
              </p>
              {status === 'parsed' && (
                <Button
                  className="mt-2 w-full gap-2"
                  type="button"
                  onClick={handleDownload}
                >
                  <Download className="size-4" />
                  下载到本地
                </Button>
              )}
              {status === 'done' && (
                <p className="text-green-600 dark:text-green-400 text-xs">
                  下载完成，请查看浏览器下载目录
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
