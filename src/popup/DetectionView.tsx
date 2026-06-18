import React, { useEffect, useState } from 'react'
import type { Confidence, DetectionResult, Platform } from '../types'
import type { ManualFormData } from './App'

interface Props {
  tabId: number | undefined
  activeTabUrl: string
  activeTabPlatform: Platform
  onConfirm: (data: ManualFormData) => void
  onAddManually: (prefill: Partial<ManualFormData>) => void
  onBack: () => void
}

type DetectState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'result'; data: DetectionResult }

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high:   'High confidence',
  medium: 'Possible match — please confirm',
  low:    'Low confidence — please verify',
  none:   'Not a recognized restaurant page',
}

export default function DetectionView({
  tabId,
  activeTabUrl,
  activeTabPlatform,
  onConfirm,
  onAddManually,
  onBack,
}: Props) {
  const [state, setState] = useState<DetectState>({ status: 'loading' })
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (tabId === undefined) {
      setState({ status: 'error', message: 'Could not reach this page.' })
      return
    }
    chrome.tabs.sendMessage(tabId, { type: 'MODU_DETECT' }, (response: DetectionResult | undefined) => {
      if (chrome.runtime.lastError || !response) {
        setState({
          status: 'error',
          message: 'Detection failed. Try navigating to a restaurant page first, or add manually.',
        })
        return
      }
      setState({ status: 'result', data: response })
      setName(response.possibleName ?? '')
      setAddress(response.possibleAddress ?? '')
    })
  }, [tabId])

  const manualPrefill = (): Partial<ManualFormData> => {
    if (state.status === 'result') {
      return {
        name: name.trim() || undefined,
        address: address.trim() || undefined,
        url: state.data.url,
        platform: state.data.platform,
      }
    }
    return { url: activeTabUrl, platform: activeTabPlatform }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (state.status === 'loading') {
    return (
      <div className="view">
        <div className="nav">
          <button className="back-btn" onClick={onBack}>← Back</button>
        </div>
        <div className="detection-loading">
          <div className="loading-spinner" />
          <span className="loading-label">Detecting…</span>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (state.status === 'error') {
    return (
      <div className="view">
        <div className="nav">
          <button className="back-btn" onClick={onBack}>← Back</button>
        </div>
        <div className="form">
          <h2 className="form-title">Detection Failed</h2>
          <p className="detection-message">{state.message}</p>
          <button
            className="btn-full btn-primary-full"
            onClick={() => onAddManually({ url: activeTabUrl, platform: activeTabPlatform })}
          >
            Add Manually Instead
          </button>
        </div>
      </div>
    )
  }

  // ── Result ────────────────────────────────────────────────────────────────

  const { data } = state
  const isNone = data.confidence === 'none'
  const canConfirm = name.trim().length > 0

  return (
    <div className="view">
      <div className="nav">
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="form">
        <h2 className="form-title">Detected Restaurant</h2>

        <div className={`confidence-badge confidence-${data.confidence}`}>
          {CONFIDENCE_LABEL[data.confidence]}
        </div>

        {isNone && (
          <p className="detection-message">
            This does not look like a supported restaurant page. You can still add it manually.
          </p>
        )}

        {data.confidence === 'low' && (
          <p className="detection-message">
            Detection confidence is low. Please confirm or correct the name below.
          </p>
        )}

        {data.confidence === 'medium' && (
          <p className="detection-message">
            We found a possible restaurant — please confirm the name before continuing.
          </p>
        )}

        <div className="form-group">
          <label className="form-label">
            Restaurant Name <span className="required">*</span>
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter or confirm name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Address <span className="optional">(optional)</span>
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter address…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="detection-meta">
          <div className="detection-meta-row">
            <span className="detection-meta-key">Source</span>
            <span className="detection-meta-val">{data.sourceName}</span>
          </div>
          <div className="detection-meta-row">
            <span className="detection-meta-key">URL</span>
            <span className="detection-meta-val detection-url" title={data.url}>{data.url}</span>
          </div>
        </div>

        <button
          className="btn-full btn-primary-full"
          disabled={!canConfirm}
          onClick={() =>
            onConfirm({
              name: name.trim(),
              address: address.trim(),
              url: data.url,
              platform: data.platform,
            })
          }
        >
          Confirm &amp; Continue →
        </button>

        <button
          className="btn-full btn-ghost-full"
          onClick={() => onAddManually(manualPrefill())}
        >
          Add Manually Instead
        </button>
      </div>
    </div>
  )
}
