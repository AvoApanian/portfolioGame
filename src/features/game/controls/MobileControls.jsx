import { useState } from 'react'
import logger from '../../../utils/logger'
import './mobile-controls.css'

export default function MobileControls({ onInput }) {
  const [boostActive, setBoostActive] = useState(false)
  const [brakeActive, setBrakeActive] = useState(false)

  const setBoost = (value) => {
    setBoostActive(value)
    onInput({ mobile: true, boost: value, brake: brakeActive })
    logger.debug('Controls', 'Boost button', { active: value })
  }

  const setBrake = (value) => {
    setBrakeActive(value)
    onInput({ mobile: true, boost: boostActive, brake: value })
    logger.debug('Controls', 'Brake button', { active: value })
  }

  return (
    <div className="mobile-controls">
      <div className="action-buttons">
        <button
          className={`action-btn brake-btn ${brakeActive ? 'active' : ''}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setBrake(true)
          }}
          onPointerUp={() => setBrake(false)}
          onPointerCancel={() => setBrake(false)}
        >
          BRAKE
        </button>

        <button
          className={`action-btn boost-btn ${boostActive ? 'active' : ''}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setBoost(true)
          }}
          onPointerUp={() => setBoost(false)}
          onPointerCancel={() => setBoost(false)}
        >
          BOOST
        </button>
      </div>
    </div>
  )
}
