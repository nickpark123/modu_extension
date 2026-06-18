import type { Platform } from '../types'

export function detectPlatform(url: string): Platform {
  try {
    const { hostname } = new URL(url)
    if (hostname.includes('naver.com')) return 'naver'
    if (hostname.includes('kakao.com')) return 'kakao'
    if (hostname.includes('google.com')) return 'google'
  } catch {
    // invalid or missing URL
  }
  return 'unknown'
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  naver: 'Naver',
  kakao: 'Kakao',
  google: 'Google',
  unknown: 'Other',
}
