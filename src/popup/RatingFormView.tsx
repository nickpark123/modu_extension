import React, { useState } from 'react'
import { ALL_TAGS } from '../types'
import type { Tag, WouldGoAgain } from '../types'
import { makeCanonicalKey, saveEntry } from '../shared/storage'
import type { ManualFormData } from './App'

interface Props {
  restaurantData: ManualFormData
  onBack: () => void
  onSaved: () => void
}

const WGA_OPTIONS: { value: WouldGoAgain; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' },
]

export default function RatingFormView({ restaurantData, onBack, onSaved }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [wouldGoAgain, setWouldGoAgain] = useState<WouldGoAgain | null>(null)
  const [tags, setTags] = useState<Set<Tag>>(new Set())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleTag(tag: Tag) {
    setTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  async function handleSave() {
    if (rating === 0 || wouldGoAgain === null || saving) return
    setSaving(true)
    try {
      await saveEntry({
        restaurant: {
          canonicalKey: makeCanonicalKey(restaurantData.name, restaurantData.address || undefined),
          name: restaurantData.name,
          address: restaurantData.address || undefined,
          platform: restaurantData.platform === 'unknown' ? undefined : restaurantData.platform,
          sourceUrl: restaurantData.url || undefined,
        },
        rating,
        wouldGoAgain,
        tags: Array.from(tags),
        note,
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const displayRating = hovered || rating
  const canSave = rating > 0 && wouldGoAgain !== null

  return (
    <div className="view">
      <div className="nav">
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="form">
        <h2 className="form-title">Rate Your Visit</h2>
        <p className="form-restaurant-name">"{restaurantData.name}"</p>

        <div className="form-group">
          <label className="form-label">Rating <span className="required">*</span></label>
          <div className="star-group">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`star-btn${displayRating >= n ? ' active' : ''}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Would you go again? <span className="required">*</span></label>
          <div className="btn-group">
            {WGA_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`group-btn${wouldGoAgain === value ? ' active' : ''}`}
                onClick={() => setWouldGoAgain(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Tags <span className="optional">(optional)</span>
          </label>
          <div className="tags-group">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-btn${tags.has(tag) ? ' active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Note <span className="optional">(optional)</span>
          </label>
          <textarea
            className="form-input form-textarea"
            placeholder="Short note about this visit…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        <button
          type="button"
          className="btn-full btn-primary-full"
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
