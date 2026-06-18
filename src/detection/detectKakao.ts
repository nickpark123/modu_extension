import type { DetectionResult } from '../types'

// e.g. "광화문국밥 - 카카오맵" → "광화문국밥"
function cleanTitle(title: string): string | undefined {
  const m = title.match(/^(.+?)\s*[-–]\s*카카오맵$/) ??
            title.match(/^(.+?)\s*[-–]\s*KakaoMap$/i)
  return m?.[1].trim()
}

function ogTitle(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim() || undefined
}

export function detectKakao(): DetectionResult {
  const url = window.location.href
  const rawPageTitle = document.title
  const hostname = window.location.hostname

  // place.map.kakao.com is a dedicated place detail subdomain
  const isPlacePage = hostname === 'place.map.kakao.com'

  const possibleName = cleanTitle(rawPageTitle) ?? ogTitle()

  const confidence =
    isPlacePage && possibleName ? 'high' :
    possibleName               ? 'medium' : 'low'

  return { platform: 'kakao', sourceName: 'KakaoMap', url, possibleName, confidence, rawPageTitle, detectedAt: Date.now() }
}
