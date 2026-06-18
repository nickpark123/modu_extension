import type { DetectionResult } from '../types'

// e.g. "광화문국밥 - Google Maps" or "광화문국밥 · Google Maps"
function cleanTitle(title: string): string | undefined {
  const m = title.match(/^(.+?)\s*[-·]\s*Google Maps$/i)
  return m?.[1].trim()
}

function ogTitle(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim() || undefined
}

export function detectGoogle(): DetectionResult {
  const url = window.location.href
  const rawPageTitle = document.title
  const pathname = window.location.pathname

  // /maps/place/ is Google Maps' canonical place URL structure
  const isPlacePage = pathname.startsWith('/maps/place/')

  const possibleName = cleanTitle(rawPageTitle) ?? ogTitle()

  const confidence =
    isPlacePage && possibleName ? 'high' :
    isPlacePage            ? 'medium' :
    possibleName           ? 'medium' : 'low'

  return { platform: 'google', sourceName: 'Google Maps', url, possibleName, confidence, rawPageTitle, detectedAt: Date.now() }
}
