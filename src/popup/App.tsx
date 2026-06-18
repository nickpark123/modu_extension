import React, { useEffect, useState } from 'react'
import './App.css'
import { detectPlatform } from '../shared/platform'
import type { Platform } from '../types'
import HomeView from './HomeView'
import ManualFormView from './ManualFormView'
import RatingFormView from './RatingFormView'
import DetectionView from './DetectionView'

export interface ManualFormData {
  name: string
  address: string
  url: string
  platform: Platform
}

type View = 'home' | 'detection' | 'manual-form' | 'rating-form'

// Prefill carried from DetectionView → ManualFormView
interface ManualPrefill {
  name: string
  address: string
  url: string
  platform: Platform
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [activeTabUrl, setActiveTabUrl] = useState('')
  const [activeTabPlatform, setActiveTabPlatform] = useState<Platform>('unknown')
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined)
  const [pendingRestaurant, setPendingRestaurant] = useState<ManualFormData | null>(null)
  const [manualPrefill, setManualPrefill] = useState<ManualPrefill | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      const url = tab?.url ?? ''
      setActiveTabUrl(url)
      setActiveTabPlatform(detectPlatform(url))
      setActiveTabId(tab?.id)
    })
  }, [])

  if (view === 'detection') {
    return (
      <DetectionView
        tabId={activeTabId}
        activeTabUrl={activeTabUrl}
        activeTabPlatform={activeTabPlatform}
        onBack={() => setView('home')}
        onConfirm={(data) => {
          setPendingRestaurant(data)
          setView('rating-form')
        }}
        onAddManually={(prefill) => {
          setManualPrefill({
            name: prefill.name ?? '',
            address: prefill.address ?? '',
            url: prefill.url ?? activeTabUrl,
            platform: prefill.platform ?? activeTabPlatform,
          })
          setView('manual-form')
        }}
      />
    )
  }

  if (view === 'manual-form') {
    const pre = manualPrefill
    return (
      <ManualFormView
        initialName={pre?.name ?? ''}
        initialAddress={pre?.address ?? ''}
        initialUrl={pre?.url ?? activeTabUrl}
        initialPlatform={pre?.platform ?? activeTabPlatform}
        onBack={() => {
          setManualPrefill(null)
          setView('home')
        }}
        onContinue={(data) => {
          setManualPrefill(null)
          setPendingRestaurant(data)
          setView('rating-form')
        }}
      />
    )
  }

  if (view === 'rating-form' && pendingRestaurant !== null) {
    return (
      <RatingFormView
        restaurantData={pendingRestaurant}
        onBack={() => setView('manual-form')}
        onSaved={() => {
          setPendingRestaurant(null)
          setView('home')
        }}
      />
    )
  }

  return (
    <HomeView
      onDetect={() => setView('detection')}
      onAddManually={() => setView('manual-form')}
    />
  )
}
