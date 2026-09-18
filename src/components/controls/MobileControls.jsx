import { useRef, useState } from 'react'
import './mobile-controls.css'

export default function MobileControls({ onInput }) {
  const joystickRef = useRef(null)
  const stateRef = useRef({ joystickX: 0, joystickY: 0, boost: false, brake: false })
  const [knobStyle, setKnobStyle] = useState({ x: 0, y: 0 })
  const [boostActive, setBoostActive] = useState(false)
  const [brakeActive, setBrakeActive] = useState(false)

  const emit = () => {
    const s = stateRef.current
    onInput({
      mobile: true,
      joystickX: s.joystickX,
      joystickY: s.joystickY,
      boost: s.boost,
      brake: s.brake,
    })
  }

  const updateJoystick = (event) => {
    const joystick = joystickRef.current
    if (!joystick) return

    const rect = joystick.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let x = event.clientX - centerX
    let y = event.clientY - centerY

    const radius = rect.width / 2
    const distance = Math.sqrt(x * x + y * y)

    if (distance > radius) {
      x = (x / distance) * radius
      y = (y / distance) * radius
    }

    const normalizedX = x / radius
    const normalizedY = y / radius

    stateRef.current.joystickX = normalizedX
    stateRef.current.joystickY = normalizedY
    setKnobStyle({ x: x, y: y })
    emit()
  }

  const releaseJoystick = () => {
    stateRef.current.joystickX = 0
    stateRef.current.joystickY = 0
    setKnobStyle({ x: 0, y: 0 })
    emit()
  }

  const startJoystick = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateJoystick(event)
  }

  const setBoost = (value) => {
    stateRef.current.boost = value
    setBoostActive(value)
    emit()
  }

  const setBrake = (value) => {
    stateRef.current.brake = value
    setBrakeActive(value)
    emit()
  }

  return (
    <div className="mobile-controls">
      <div
        ref={joystickRef}
        className="joystick-base"
        onPointerDown={startJoystick}
        onPointerMove={(event) => {
          if (event.buttons === 0) return
          updateJoystick(event)
        }}
        onPointerUp={releaseJoystick}
        onPointerCancel={releaseJoystick}
      >
        <div className="joystick-ring" />
        <div
          className="joystick-knob"
          style={{ transform: `translate(calc(-50% + ${knobStyle.x}px), calc(-50% + ${knobStyle.y}px))` }}
        />
      </div>

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
          BRK
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
