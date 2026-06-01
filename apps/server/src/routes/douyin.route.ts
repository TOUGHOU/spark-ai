import type { Context } from 'hono'
import { Readable } from 'node:stream'
import { DouyinProcessor } from '../services/douyin.service.js'

const processor = new DouyinProcessor()

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'douyin_video'
}

async function streamDouyinVideo(
  shareLink: string,
  options: { inline: boolean; filename: string },
) {
  const videoInfo = await processor.parseShareUrl(shareLink)
  const response = await processor.fetchVideoStream(videoInfo)

  const headers: Record<string, string> = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Content-Disposition': options.inline
      ? 'inline'
      : `attachment; filename*=UTF-8''${encodeURIComponent(options.filename)}`,
  }
  const contentLength = response.headers['content-length']
  if (contentLength) {
    headers['Content-Length'] = String(contentLength)
  }

  const webStream = Readable.toWeb(
    response.data as InstanceType<typeof Readable>,
  )

  return new Response(webStream as ReadableStream, { headers })
}

export async function handleDouyinParse(c: Context) {
  try {
    const body = await c.req.json<{ shareLink?: string }>()
    const shareLink = body.shareLink?.trim()

    if (!shareLink) {
      return c.json({ error: '请提供抖音分享链接' }, 400)
    }

    const videoInfo = await processor.parseShareUrl(shareLink)

    return c.json({
      status: 'success',
      videoId: videoInfo.videoId,
      title: videoInfo.title,
      previewUrl: `/api/douyin/preview?shareLink=${encodeURIComponent(shareLink)}`,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '解析失败'
    return c.json({ status: 'error', error: message }, 500)
  }
}

export async function handleDouyinPreview(c: Context) {
  try {
    const shareLink = c.req.query('shareLink')?.trim()

    if (!shareLink) {
      return c.json({ error: '请提供抖音分享链接' }, 400)
    }

    return streamDouyinVideo(shareLink, {
      inline: true,
      filename: 'preview.mp4',
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '预览失败'
    return c.json({ status: 'error', error: message }, 500)
  }
}

export async function handleDouyinDownload(c: Context) {
  try {
    const body = await c.req.json<{ shareLink?: string }>()
    const shareLink = body.shareLink?.trim()

    if (!shareLink) {
      return c.json({ error: '请提供抖音分享链接' }, 400)
    }

    const videoInfo = await processor.parseShareUrl(shareLink)
    const filename = `${sanitizeFilename(videoInfo.title)}.mp4`

    return streamDouyinVideo(shareLink, { inline: false, filename })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '下载失败'
    return c.json({ status: 'error', error: message }, 500)
  }
}
