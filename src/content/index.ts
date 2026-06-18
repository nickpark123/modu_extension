import { runDetection } from '../detection'
import type { DetectionResult } from '../types'

chrome.runtime.onMessage.addListener(
  (message: { type: string }, _sender, sendResponse: (r: DetectionResult) => void) => {
    if (message.type === 'MODU_DETECT') {
      sendResponse(runDetection())
    }
    // return true keeps the channel open; safe even though runDetection is sync
    return true
  },
)
