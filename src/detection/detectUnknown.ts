import type { DetectionResult } from '../types'

export function detectUnknown(): DetectionResult {
  return {
    platform: 'unknown',
    sourceName: 'Unknown',
    url: window.location.href,
    confidence: 'none',
    rawPageTitle: document.title,
    detectedAt: Date.now(),
  }
}
