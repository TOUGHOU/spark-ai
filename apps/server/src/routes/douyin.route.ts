import type { Context } from 'hono'
import { Readable } from 'node:stream'
import { DouyinProcessor } from '../services/douyin.service.js'

const processor = new DouyinProcessor()

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'douyin_video'
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
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '解析失败'
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
    const response = await processor.fetchVideoStream(videoInfo)
    const filename = `${sanitizeFilename(videoInfo.title)}.mp4`

    const headers: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    }
    const contentLength = response.headers['content-length']
    if (contentLength) {
      headers['Content-Length'] = String(contentLength)
    }

    const webStream = Readable.toWeb(
      response.data as InstanceType<typeof Readable>,
    )

    return new Response(webStream as ReadableStream, { headers })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '下载失败'
    return c.json({ status: 'error', error: message }, 500)
  }
}
