import React from 'react'

interface Props {
  onDetect: () => void
  onAddManually: () => void
}

const SECTIONS = [
  { id: 'current-page', label: 'Current Page', placeholder: 'No page detected' },
  { id: 'detected-restaurant', label: 'Detected Restaurant', placeholder: 'Nothing detected yet' },
  { id: 'my-modu-rating', label: 'My Modu Rating', placeholder: 'Not rated yet' },
  { id: 'public-sources', label: 'Public Sources', placeholder: 'No sources linked' },
] as const

export default function HomeView({ onDetect, onAddManually }: Props) {
  return (
    <div>
      <header className="header">
        <div className="header-top">
          <span className="title">Modu</span>
          <span className="title-ko">모두</span>
        </div>
        <p className="subtitle">Your personal restaurant trust layer.</p>
      </header>

      <div className="actions">
        <button className="btn btn-primary" onClick={onDetect}>Detect Restaurant</button>
        <button className="btn" onClick={onAddManually}>Add Manually</button>
        <button className="btn">Saved Places</button>
      </div>

      <div className="sections">
        {SECTIONS.map(({ id, label, placeholder }) => (
          <div key={id} className="section">
            <div className="section-header">{label}</div>
            <div className="section-body">
              <span className="placeholder">{placeholder}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
