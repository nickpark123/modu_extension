export type Platform = 'naver' | 'kakao' | 'google' | 'unknown'

export type WouldGoAgain = 'yes' | 'no' | 'unsure'

export type Confidence = 'high' | 'medium' | 'low' | 'none'

export const ALL_TAGS = [
  'date',
  'group dinner',
  'family',
  'solo',
  'cheap eats',
  'cafe',
  'drinking',
  'visitors',
  'local favorite',
  'worth the wait',
] as const

export type Tag = (typeof ALL_TAGS)[number]

export interface Restaurant {
  canonicalKey: string
  name: string
  address?: string
  platform?: Platform
  sourceUrl?: string
}

export interface UserRestaurantEntry {
  id: string
  restaurant: Restaurant
  rating: number        // 1–5
  wouldGoAgain: WouldGoAgain
  tags: Tag[]
  note: string
  savedAt: number
}

// Safe identity signals only — no review text, ratings, photos, or usernames
export interface DetectionResult {
  platform: Platform
  sourceName: string    // human-readable: "Naver Map", "KakaoMap", "Google Maps"
  url: string
  possibleName?: string
  possibleAddress?: string
  confidence: Confidence
  rawPageTitle: string
  detectedAt: number
}
