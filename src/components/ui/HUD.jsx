import { useState } from 'react'

import {
  useI18n,
  LANGUAGES,
} from '../../i18n'

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
  const {
    lang,
    setLang,
    dictionary,
  } = useI18n()

  const { hud } = dictionary

  const [menuOpen, setMenuOpen] =
    useState(false)

  return (
    <div className="hud">
      <div className="hud-vignette" />

      {!mobile && (
        <div className="crosshair" />
      )}

      {/* ===================================================
          DESKTOP TOP BAR
          =================================================== */}

      {!mobile && (
        <div className="hud-topbar">
          <div className="hud-lang-switch">
            {LANGUAGES.map(
              (code) => (
                <button
                  key={code}
                  className={`hud-lang-btn ${
                    lang === code
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setLang(code)
                  }
                >
                  {code.toUpperCase()}
                </button>
              ),
            )}
          </div>

          <button
            className="hud-icon-btn"
            onClick={
              onToggleSound
            }
            aria-label="Sound"
          >
            {soundMuted
              ? '🔇'
              : '🔊'}
          </button>

          <button
            className="hud-icon-btn"
            onClick={
              onToggleMusic
            }
            aria-label="Music"
          >
            {musicMuted
              ? '🎵'
              : '🎶'}
          </button>

          <button
            className="hud-text-btn"
            onClick={
              onOpenPortfolio
            }
          >
            {hud.portfolioLink} →
          </button>
        </div>
      )}

      {/* ===================================================
          MOBILE MENU
          =================================================== */}

      {mobile && (
        <div className="mobile-menu-container">
          <button
            type="button"
            className={`hud-menu-btn ${
              menuOpen
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setMenuOpen(
                (prev) => !prev,
              )
            }
            aria-label="Menu"
            aria-expanded={
              menuOpen
            }
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <div className="hud-menu">
              <div className="hud-menu-title">
                MENU
              </div>

              <div className="hud-menu-section">
                <div className="hud-menu-label">
                  LANGUAGE
                </div>

                <div className="hud-menu-languages">
                  {LANGUAGES.map(
                    (code) => (
                      <button
                        key={code}
                        type="button"
                        className={`hud-lang-btn ${
                          lang ===
                          code
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setLang(
                            code,
                          )
                        }
                      >
                        {code.toUpperCase()}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                type="button"
                className="hud-menu-action"
                onClick={
                  onToggleSound
                }
              >
                {soundMuted
                  ? '🔇 Sound off'
                  : '🔊 Sound on'}
              </button>

              <button
                type="button"
                className="hud-menu-action"
                onClick={
                  onToggleMusic
                }
              >
                {musicMuted
                  ? '🎵 Music off'
                  : '🎶 Music on'}
              </button>

              <button
                type="button"
                className="hud-menu-action"
                onClick={
                  onOpenPortfolio
                }
              >
                {hud.portfolioLink}{' '}
                →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          SPEED
          =================================================== */}

      <div className="hud-panel hud-speed">
        <div className="hud-label">
          {hud.speedLabel}
        </div>

        <div className="hud-value">
          {Math.round(
            speedPct * 100,
          )}
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

      {/* ===================================================
          BOOST
          =================================================== */}

      <div
        className={`hud-panel hud-boost ${
          overheat
            ? 'overheat'
            : ''
        }`}
      >
        <div className="hud-label">
          {overheat
            ? hud.overheatLabel
            : hud.nitroLabel}
        </div>

        <div className="hud-bar-track vertical">
          <div
            className={`hud-bar-fill boost-fill ${
              boosting
                ? 'boosting'
                : ''
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