import type { DetectionResult } from '../types'

// Strips known Naver Map title suffixes to extract the place name.
// e.g. "광화문국밥 : 네이버지도" → "광화문국밥"
function cleanTitle(title: string): string | undefined {
  const m = title.match(/^(.+?)\s*:\s*네이버\s*지도$/) ??
            title.match(/^(.+?)\s*[-:]\s*Naver\s*Maps?$/i)
  return m?.[1].trim()
}

function ogTitle(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim() || undefined
}

export function detectNaver(): DetectionResult {
  const url = window.location.href
  const rawPageTitle = document.title
  const pathname = window.location.pathname
  const hostname = window.location.hostname

  // Dedicated place page patterns
  const isPlacePage =
    hostname === 'place.naver.com' ||
    /\/v5\/entry\/place\/\d+/.test(pathname)

  const possibleName = cleanTitle(rawPageTitle) ?? ogTitle()

  const confidence =
    isPlacePage && possibleName ? 'high' :
    isPlacePage            ? 'medium' :
    possibleName           ? 'medium' : 'low'

  return { platform: 'naver', sourceName: 'Naver Map', url, possibleName, confidence, rawPageTitle, detectedAt: Date.now() }
}
