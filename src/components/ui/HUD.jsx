import { useEffect, useState } from 'react'
import './hud.css'

export default function HUD({
  speedPct,
  boostPct,
  boosting,
  overheat,
  heading,
  mobile,
  muted,
  onToggleMute,
  onOpenPortfolio,
}) {
  const [hintVisible, setHintVisible] = useState(!mobile)

  useEffect(() => {
    if (mobile) return
    const timer = setTimeout(() => setHintVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [mobile])

  const headingDeg = (-heading * 180) / Math.PI

  return (
    <div className="hud">
      <div className="hud-vignette" />

      {!mobile && <div className="crosshair" />}

      <div className="hud-topbar">
        <button className="hud-icon-btn" onClick={onToggleMute} aria-label="Son">
          {muted ? '🔇' : '🔊'}
        </button>
        <button className="hud-text-btn" onClick={onOpenPortfolio}>
          Portfolio classique →
        </button>
      </div>

      <div className="hud-panel hud-speed">
        <div className="hud-label">Vitesse</div>
        <div className="hud-value">{Math.round(speedPct * 100)}</div>
        <div className="hud-bar-track">
          <div className="hud-bar-fill speed-fill" style={{ width: `${speedPct * 100}%` }} />
        </div>
      </div>

      <div className={`hud-panel hud-boost ${overheat ? 'overheat' : ''}`}>
        <div className="hud-label">{overheat ? 'Surchauffe' : 'Nitro'}</div>
        <div className="hud-bar-track vertical">
          <div
            className={`hud-bar-fill boost-fill ${boosting ? 'boosting' : ''}`}
            style={{ height: `${boostPct * 100}%` }}
          />
        </div>
      </div>

      <div className="hud-compass">
        <div className="compass-ring" style={{ transform: `rotate(${headingDeg}deg)` }}>
          <span className="tick n">N</span>
          <span className="tick e">E</span>
          <span className="tick s">S</span>
          <span className="tick w">O</span>
        </div>
        <div className="compass-needle" />
      </div>

      {hintVisible && !mobile && (
        <div className="hud-hint">
          <span>W</span> avancer&nbsp;&nbsp;
          <span>A / D</span> orienter&nbsp;&nbsp;
          <span>MAJ</span> boost&nbsp;&nbsp;
          <span>ESPACE</span> frein
        </div>
      )}
    </div>
  )
}
