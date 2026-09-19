import { useState } from 'react'
import logger from '../../../utils/logger'
import './mobile-controls.css'

export default function MobileControls({ onInput }) {
  const [boostActive, setBoostActive] = useState(false)

  const setBoost = (value) => {
    setBoostActive(value)

    onInput({
      mobile: true,
      boost: value,
      brake: false,
    })

    logger.debug('Controls', 'Boost button', { active: value })
  }

  return (
    <div className="mobile-controls">
      <button
        type="button"
        className={`boost-btn ${boostActive ? 'active' : ''}`}
        onPointerDown={(event) => {
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          setBoost(true)
        }}
        onPointerUp={(event) => {
          event.preventDefault()
          setBoost(false)
        }}
        onPointerCancel={() => setBoost(false)}
        onLostPointerCapture={() => setBoost(false)}
        aria-label="Boost"
      >
        BOOST
      </button>
    </div>
  )
}
