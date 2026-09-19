import { useState } from 'react'
import { useI18n, LANGUAGES } from '../../i18n'
import './hud.css'

export default function HUD({
  speedPct,
  boostPct,
  boosting,
  overheat,
  mobile,
  soundMuted,
  musicMuted,
  onToggleSound,
  onToggleMusic,
  onOpenPortfolio,
}) {
  const { lang, setLang, dictionary } = useI18n()
  const { hud } = dictionary
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="hud">
      <div className="hud-vignette" />

      {!mobile && <div className="crosshair" />}

      {!mobile && (
        <div className="hud-topbar">
          <div className="hud-lang-switch">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                className={`hud-lang-btn ${lang === code ? 'active' : ''}`}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            className="hud-icon-btn"
            onClick={onToggleSound}
            aria-label="Sound"
          >
            {soundMuted ? '🔇' : '🔊'}
          </button>

          <button
            className="hud-icon-btn"
            onClick={onToggleMusic}
            aria-label="Music"
          >
            {musicMuted ? '🎵' : '🎶'}
          </button>

          <button
            className="hud-text-btn"
            onClick={onOpenPortfolio}
          >
            {hud.portfolioLink} →
          </button>
        </div>
      )}

      {mobile && (
        <div className="mobile-menu-container">
          <button
            type="button"
            className={`mobile-menu-button ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-title">MENU</div>

              <div className="mobile-menu-section">
                <div className="mobile-menu-label">LANGUAGE</div>

                <div className="mobile-menu-languages">
                  {LANGUAGES.map((code) => (
                    <button
                      key={code}
                      className={`hud-lang-btn ${
                        lang === code ? 'active' : ''
                      }`}
                      onClick={() => setLang(code)}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="mobile-menu-action"
                onClick={onToggleSound}
              >
                {soundMuted ? '🔇 Sound off' : '🔊 Sound on'}
              </button>

              <button
                className="mobile-menu-action"
                onClick={onToggleMusic}
              >
                {musicMuted ? '🎵 Music off' : '🎶 Music on'}
              </button>

              <button
                className="mobile-menu-action"
                onClick={onOpenPortfolio}
              >
                {hud.portfolioLink} →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="hud-panel hud-speed">
        <div className="hud-label">{hud.speedLabel}</div>

        <div className="hud-value">
          {Math.round(speedPct * 100)}
        </div>

        <div className="hud-bar-track">
          <div
            className="hud-bar-fill speed-fill"
            style={{
              width: `${speedPct * 100}%`,
            }}
          />
        </div>
      </div>

      <div
        className={`hud-panel hud-boost ${
          overheat ? 'overheat' : ''
        }`}
      >
        <div className="hud-label">
          {overheat ? hud.overheatLabel : hud.nitroLabel}
        </div>

        <div className="hud-bar-track vertical">
          <div
            className={`hud-bar-fill boost-fill ${
              boosting ? 'boosting' : ''
            }`}
            style={{
              height: `${boostPct * 100}%`,
            }}
          />
        </div>
      </div>

      {!mobile && (
        <div className="hud-hint">
          {hud.controlsHint}
        </div>
      )}
    </div>
  )
}
