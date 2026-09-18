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

  return (
    <div className="hud">
      <div className="hud-vignette" />

      {!mobile && <div className="crosshair" />}

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

        <button className="hud-icon-btn" onClick={onToggleSound} aria-label="Sound">
          {soundMuted ? '🔇' : '🔊'}
        </button>

        <button className="hud-icon-btn" onClick={onToggleMusic} aria-label="Music">
          {musicMuted ? '🎵' : '🎶'}
        </button>

        <button className="hud-text-btn" onClick={onOpenPortfolio}>
          {hud.portfolioLink} →
        </button>
      </div>

      <div className="hud-panel hud-speed">
        <div className="hud-label">{hud.speedLabel}</div>
        <div className="hud-value">{Math.round(speedPct * 100)}</div>
        <div className="hud-bar-track">
          <div className="hud-bar-fill speed-fill" style={{ width: `${speedPct * 100}%` }} />
        </div>
      </div>

      <div className={`hud-panel hud-boost ${overheat ? 'overheat' : ''}`}>
        <div className="hud-label">{overheat ? hud.overheatLabel : hud.nitroLabel}</div>
        <div className="hud-bar-track vertical">
          <div
            className={`hud-bar-fill boost-fill ${boosting ? 'boosting' : ''}`}
            style={{ height: `${boostPct * 100}%` }}
          />
        </div>
      </div>

      {!mobile && <div className="hud-hint">{hud.controlsHint}</div>}
    </div>
  )
}
