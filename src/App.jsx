import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import GameScene from './features/game/GameScene'
import KeyboardControls from './features/game/controls/KeyboardControls'
import MobileControls from './features/game/controls/MobileControls'
import HUD from './features/hud/HUD'
import InfoPanel from './features/hud/InfoPanel'
import Portfolio from './features/portfolio/Portfolio'
import soundManager from './audio/soundManager'
import logger from './utils/logger'

function getViewFromHash() {
  return window.location.hash === '#/portfolio' ? 'portfolio' : 'game'
}

export default function App() {
  const [view, setView] = useState(getViewFromHash)

  const [input, setInput] = useState({
    boost: false,
    brake: false,
    mobile: false,
  })

  const [hud, setHud] = useState({
    speedPct: 0,
    boostPct: 1,
    boosting: false,
    overheat: false,
    orbiting: false,
  })

  const [activePlanet, setActivePlanet] = useState(null)
  const [soundMuted, setSoundMuted] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)
  const [mobile, setMobile] = useState(false)

  const exitOrbitRef = useRef(false)
  const audioStarted = useRef(false)

  useEffect(() => {
    const onHashChange = () => {
      const next = getViewFromHash()
      logger.info('App', 'View changed', { view: next })
      setView(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 900)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const startAudio = () => {
      if (audioStarted.current) return
      audioStarted.current = true
      soundManager.init()
      soundManager.setSfxMuted(soundMuted)
      soundManager.setMusicMuted(musicMuted)
    }

    window.addEventListener('keydown', startAudio, { once: true })
    window.addEventListener('pointerdown', startAudio, { once: true })

    return () => {
      window.removeEventListener('keydown', startAudio)
      window.removeEventListener('pointerdown', startAudio)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = useCallback((partial) => {
    setInput((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleHudUpdate = useCallback((data) => {
    setHud(data)
  }, [])

  const handlePlanetChange = useCallback((planet) => {
    setActivePlanet(planet)
    if (planet) soundManager.playPanelOpen()
  }, [])

  const handleClosePanel = useCallback(() => {
    exitOrbitRef.current = true
    setActivePlanet(null)
  }, [])

  const handleToggleSound = useCallback(() => {
    setSoundMuted((prev) => {
      const next = !prev
      soundManager.setSfxMuted(next)
      soundManager.playUiClick()
      return next
    })
  }, [])

  const handleToggleMusic = useCallback(() => {
    setMusicMuted((prev) => {
      const next = !prev
      soundManager.setMusicMuted(next)
      return next
    })
  }, [])

  const goToPortfolio = useCallback(() => {
    logger.info('App', 'Navigating to classic portfolio')
    window.location.hash = '#/portfolio'
  }, [])

  const goToGame = useCallback(() => {
    logger.info('App', 'Navigating back to game')
    window.location.hash = ''
  }, [])

  if (view === 'portfolio') {
    return <Portfolio onBackToGame={goToGame} />
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100vw',
          aspectRatio: '16 / 9',
          maxHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        {!mobile && <KeyboardControls onInput={handleInput} />}

        <Canvas camera={{ position: [-8, 3.5, 0], fov: 50 }}>
          <GameScene
            input={input}
            onHudUpdate={handleHudUpdate}
            onPlanetChange={handlePlanetChange}
            exitOrbitRef={exitOrbitRef}
          />
        </Canvas>

        <HUD
          speedPct={hud.speedPct}
          boostPct={hud.boostPct}
          boosting={hud.boosting}
          overheat={hud.overheat}
          mobile={mobile}
          soundMuted={soundMuted}
          musicMuted={musicMuted}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onOpenPortfolio={goToPortfolio}
        />

        <InfoPanel planet={activePlanet} onClose={handleClosePanel} />

        {mobile && <MobileControls onInput={handleInput} />}
      </div>
    </div>
  )
}
