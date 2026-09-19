import { useState } from 'react'
import logger from '../../../utils/logger'
import './mobile-controls.css'

export default function MobileControls({ onInput }) {
  const [boostActive, setBoostActive] = useState(false)

  const handleBoostDown = (event) => {
    event.preventDefault()

    setBoostActive(true)

    onInput({
      mobile: true,
      forward: true,
      brake: false,
      boost: true,
    })

    logger.debug('Controls', 'Boost started')
  }

  const handleBoostUp = (event) => {
    event.preventDefault()

    setBoostActive(false)

    onInput({
      mobile: true,
      forward: true,
      brake: false,
      boost: false,
    })

    logger.debug('Controls', 'Boost released')
  }

  return (
    <div className="mobile-controls">
      <button
        type="button"
        className={`mobile-boost-button ${
          boostActive ? 'active' : ''
        }`}
        onPointerDown={handleBoostDown}
        onPointerUp={handleBoostUp}
        onPointerCancel={handleBoostUp}
        aria-label="Boost"
      >
        <span className="boost-symbol">⚡</span>

        <span className="boost-content">
          <span className="boost-title">
            BOOST
          </span>

          <span className="boost-subtitle">
            {boostActive ? 'ACTIVE' : 'HOLD'}
          </span>
        </span>
      </button>
    </div>
  )
}