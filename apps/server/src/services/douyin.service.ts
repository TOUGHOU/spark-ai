import axios from 'axios'

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1',
}

export interface DouyinVideoInfo {
  url: string
  title: string
  videoId: string
}

export interface DownloadProgress {
  downloaded: number
  total: number
  percentage: number
}

/** 将 HTML/JSON 中的转义视频地址还原为可请求的 URL */
function normalizeVideoUrl(rawUrl: string): string {
  let url = rawUrl.trim()

  if (url.includes('\\u') || url.includes('\\/')) {
    try {
      url = JSON.parse(`"${url.replace(/"/g, '\\"')}"`) as string
    } catch {
      url = url
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16)),
        )
        .replace(/\\\//g, '/')
    }
  }

  // 无反斜杠的 u002f 残留会导致 DNS 解析主机名 "u002f"
  if (/u002[fF]/i.test(url)) {
    url = url.replace(/u002[fF]/gi, '/')
  }

  // 规范协议后的多余斜杠：https:////host -> https://host
  url = url.replace(/^(https?:)\/{2,}/i, '$1//')
  url = url.replace(/^(https?:\/\/)\/+/i, '$1')

  if (url.startsWith('https:/') && !url.startsWith('https://')) {
    url = `https://${url.slice(7).replace(/^\/+/, '')}`
  }

  const protocolMatch = url.match(/^(https?:\/\/)/i)
  if (protocolMatch) {
    const protocol = protocolMatch[1]
    const rest = url.slice(protocol.length).replace(/\/+/g, '/')
    url = protocol + rest
  }

  return url
}

export class DouyinProcessor {
  async parseShareUrl(shareText: string): Promise<DouyinVideoInfo> {
    const urlRegex = /https?:\/\/[^\s]+/g
    const urls = shareText.match(urlRegex)

    if (!urls || urls.length === 0) {
      throw new Error('未找到有效的分享链接')
    }

    const shareUrl = urls[0]

    const shareResponse = await axios.get(shareUrl, {
      headers: HEADERS,
      maxRedirects: 5,
    })

    const finalUrl =
      (shareResponse.request as { res?: { responseUrl?: string } })?.res
        ?.responseUrl || shareUrl
    const videoIdMatch = finalUrl.match(/video\/([^/?]+)/)
    const videoId = videoIdMatch ? videoIdMatch[1] : this.generateVideoId()

    const videoPageUrl = `https://www.iesdouyin.com/share/video/${videoId}`
    const response = await axios.get(videoPageUrl, { headers: HEADERS })

    return this.extractVideoInfoFromHtml(response.data as string, videoId)
  }

  private extractVideoInfoFromHtml(
    html: string,
    videoId: string,
  ): DouyinVideoInfo {
    const videoUrlMatch = html.match(
      /"play_addr"[^}]*"url_list"[^[]*\[\s*"([^"]+)"/,
    )

    if (videoUrlMatch?.[1]) {
      const cleanUrl = normalizeVideoUrl(
        videoUrlMatch[1].replace('playwm', 'play'),
      )
      const titleMatch =
        html.match(/"desc"\s*:\s*"([^"]+)"/) ||
        html.match(/<title>([^<]+)<\/title>/)

      const title = titleMatch
        ? titleMatch[1].replace(/[\\/:*?"<>|]/g, '_').trim()
        : `douyin_${videoId}`

      return { url: cleanUrl, title, videoId }
    }

    return {
      url: `https://aweme.snssdk.com/aweme/v1/play/?video_id=${videoId}`,
      title: `douyin_${videoId}`,
      videoId,
    }
  }

  async fetchVideoStream(videoInfo: DouyinVideoInfo) {
    const url = normalizeVideoUrl(videoInfo.url)
    if (!/^https?:\/\//i.test(url)) {
      throw new Error(`无效的视频地址: ${url.slice(0, 80)}`)
    }
    return axios.get(url, {
      headers: HEADERS,
      responseType: 'stream',
    })
  }

  private generateVideoId(): string {
    return (
      'douyin_' +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7)
    )
  }
}
