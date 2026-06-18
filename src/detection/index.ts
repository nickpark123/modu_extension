import type { DetectionResult } from '../types'
import { detectNaver } from './detectNaver'
import { detectKakao } from './detectKakao'
import { detectGoogle } from './detectGoogle'
import { detectUnknown } from './detectUnknown'

export function runDetection(): DetectionResult {
  const { hostname, pathname } = window.location

  if (hostname === 'map.naver.com' || hostname === 'place.naver.com') {
    return detectNaver()
  }

  if (hostname === 'map.kakao.com' || hostname === 'place.map.kakao.com') {
    return detectKakao()
  }

  const isGoogleMaps =
    (hostname === 'www.google.com' || hostname === 'google.com' || hostname === 'maps.google.com') &&
    pathname.startsWith('/maps')
  if (isGoogleMaps) {
    return detectGoogle()
  }

  return detectUnknown()
}
