import React, { useState } from 'react'
import type { Platform } from '../types'
import { PLATFORM_LABELS } from '../shared/platform'
import type { ManualFormData } from './App'

interface Props {
  initialName: string
  initialAddress: string
  initialUrl: string
  initialPlatform: Platform
  onBack: () => void
  onContinue: (data: ManualFormData) => void
}

const PLATFORMS: Platform[] = ['naver', 'kakao', 'google', 'unknown']

export default function ManualFormView({
  initialName,
  initialAddress,
  initialUrl,
  initialPlatform,
  onBack,
  onContinue,
}: Props) {
  const [name, setName] = useState(initialName)
  const [address, setAddress] = useState(initialAddress)
  const [url, setUrl] = useState(initialUrl)
  const [platform, setPlatform] = useState<Platform>(initialPlatform)
  const [touched, setTouched] = useState(false)

  const nameValid = name.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!nameValid) return
    onContinue({ name: name.trim(), address: address.trim(), url: url.trim(), platform })
  }

  return (
    <div className="view">
      <div className="nav">
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <h2 className="form-title">Add Restaurant</h2>

        <div className="form-group">
          <label className="form-label">
            Restaurant Name <span className="required">*</span>
          </label>
          <input
            className={`form-input${touched && !nameValid ? ' input-error' : ''}`}
            type="text"
            placeholder="e.g. 광화문국밥"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {touched && !nameValid && <span className="error-msg">Name is required</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Address <span className="optional">(optional)</span>
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. 종로구 세종대로…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Page URL <span className="optional">(optional)</span>
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Source Platform <span className="optional">(optional)</span>
          </label>
          <div className="btn-group">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                className={`group-btn${platform === p ? ' active' : ''}`}
                onClick={() => setPlatform(p)}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-full btn-primary-full">
          Continue →
        </button>
      </form>
    </div>
  )
}
