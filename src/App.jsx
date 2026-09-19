import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Canvas } from '@react-three/fiber'

import GameScene from './features/game/GameScene'
import KeyboardControls from './features/game/controls/KeyboardControls'
import MobileControls from './features/game/controls/MobileControls'

import HUD from './features/hud/HUD'
import InfoPanel from './features/hud/InfoPanel'
import Portfolio from './features/portfolio/Portfolio'

import soundManager from './audio/soundManager'
import logger from './utils/logger'

import './index.css'



function getViewFromHash() {
  return window.location.hash === '#/portfolio'
    ? 'portfolio'
    : 'game'
}


function getIsMobile() {
  return (
    window.innerWidth <= 900 ||
    window.matchMedia('(pointer: coarse)').matches
  )
}



export default function App() {
  const [view, setView] = useState(
    getViewFromHash
  )

  const [mobile, setMobile] = useState(
    getIsMobile
  )

  const [input, setInput] = useState({
    boost: false,
    brake: false,
    mobile: getIsMobile(),
  })

  const [hud, setHud] = useState({
    speedPct: 0,
    boostPct: 1,
    boosting: false,
    overheat: false,
    orbiting: false,
  })

  const [activePlanet, setActivePlanet] =
    useState(null)

  const [soundMuted, setSoundMuted] =
    useState(false)

  const [musicMuted, setMusicMuted] =
    useState(false)

  const exitOrbitRef = useRef(false)
  const audioStarted = useRef(false)


  useEffect(() => {
    const onHashChange = () => {
      const next = getViewFromHash()

      logger.info(
        'App',
        'View changed',
        {
          view: next,
        }
      )

      setView(next)
    }

    window.addEventListener(
      'hashchange',
      onHashChange
    )

    return () => {
      window.removeEventListener(
        'hashchange',
        onHashChange
      )
    }
  }, [])



  useEffect(() => {
    const checkMobile = () => {
      const isMobile = getIsMobile()

      setMobile(isMobile)

      setInput((prev) => ({
        ...prev,

        mobile: isMobile,

        brake: isMobile
          ? false
          : prev.brake,

        /*
         * Même chose pour boost.
         */
        boost: isMobile
          ? false
          : prev.boost,
      }))
    }

    checkMobile()

    window.addEventListener(
      'resize',
      checkMobile
    )

    window.addEventListener(
      'orientationchange',
      checkMobile
    )

    /*
     * VisualViewport améliore le comportement
     * sur mobile lorsque la taille réelle du
     * viewport change.
     */
    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        'resize',
        checkMobile
      )
    }

    return () => {
      window.removeEventListener(
        'resize',
        checkMobile
      )

      window.removeEventListener(
        'orientationchange',
        checkMobile
      )

      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          'resize',
          checkMobile
        )
      }
    }
  }, [])


  /* =======================================================
     AUDIO
     ======================================================= */

  useEffect(() => {
    const startAudio = () => {
      if (audioStarted.current) {
        return
      }

      audioStarted.current = true

      soundManager.init()

      soundManager.setSfxMuted(
        soundMuted
      )

      soundManager.setMusicMuted(
        musicMuted
      )
    }

    window.addEventListener(
      'keydown',
      startAudio,
      {
        once: true,
      }
    )

    window.addEventListener(
      'pointerdown',
      startAudio,
      {
        once: true,
      }
    )

    return () => {
      window.removeEventListener(
        'keydown',
        startAudio
      )

      window.removeEventListener(
        'pointerdown',
        startAudio
      )
    }
  }, [musicMuted, soundMuted])


  /* =======================================================
     INPUT
     ======================================================= */

  const handleInput = useCallback(
    (partial) => {
      setInput((prev) => ({
        ...prev,
        ...partial,
      }))
    },
    []
  )


  /* =======================================================
     HUD
     ======================================================= */

  const handleHudUpdate = useCallback(
    (data) => {
      setHud(data)
    },
    []
  )


  /* =======================================================
     PLANET
     ======================================================= */

  const handlePlanetChange = useCallback(
    (planet) => {
      setActivePlanet(planet)

      if (planet) {
        soundManager.playPanelOpen()
      }
    },
    []
  )


  const handleClosePanel = useCallback(
    () => {
      exitOrbitRef.current = true

      setActivePlanet(null)
    },
    []
  )


  /* =======================================================
     SOUND
     ======================================================= */

  const handleToggleSound = useCallback(
    () => {
      setSoundMuted((prev) => {
        const next = !prev

        soundManager.setSfxMuted(next)
        soundManager.playUiClick()

        return next
      })
    },
    []
  )


  /* =======================================================
     MUSIC
     ======================================================= */

  const handleToggleMusic = useCallback(
    () => {
      setMusicMuted((prev) => {
        const next = !prev

        soundManager.setMusicMuted(next)

        return next
      })
    },
    []
  )


  /* =======================================================
     PORTFOLIO
     ======================================================= */

  const goToPortfolio = useCallback(
    () => {
      logger.info(
        'App',
        'Navigating to classic portfolio'
      )

      window.location.hash =
        '#/portfolio'
    },
    []
  )


  const goToGame = useCallback(
    () => {
      logger.info(
        'App',
        'Navigating back to game'
      )

      window.location.hash = ''
    },
    []
  )


  /* =======================================================
     PORTFOLIO VIEW
     ======================================================= */

  if (view === 'portfolio') {
    return (
      <div className="portfolio-view">
        <Portfolio
          onBackToGame={goToGame}
        />
      </div>
    )
  }


  /* =======================================================
     GAME
     ======================================================= */

  return (
    <div className="app">
      <div className="game-frame">

        {!mobile && (
          <KeyboardControls
            onInput={handleInput}
          />
        )}


        {/* =================================================
            THREE.JS
            ================================================= */}

        <Canvas
          className="game-canvas"

          camera={{
            position: [-8, 3.5, 0],
            fov: 50,
          }}

          dpr={[1, 2]}

          gl={{
            antialias: true,
            powerPreference:
              'high-performance',
          }}

          /*
           * Évite certains comportements tactiles
           * indésirables du navigateur.
           */
          style={{
            touchAction: 'none',
          }}
        >
          <GameScene
            input={input}
            onHudUpdate={handleHudUpdate}
            onPlanetChange={handlePlanetChange}
            exitOrbitRef={exitOrbitRef}
          />
        </Canvas>


        {/* =================================================
            UI
            ================================================= */}

        <div className="game-ui">
          <HUD
            speedPct={hud.speedPct}
            boostPct={hud.boostPct}
            boosting={hud.boosting}
            overheat={hud.overheat}
            mobile={mobile}
            soundMuted={soundMuted}
            musicMuted={musicMuted}
            onToggleSound={
              handleToggleSound
            }
            onToggleMusic={
              handleToggleMusic
            }
            onOpenPortfolio={
              goToPortfolio
            }
          />

          <InfoPanel
            planet={activePlanet}
            onClose={handleClosePanel}
          />
        </div>


        {/* =================================================
            MOBILE CONTROLS
            ================================================= */}

        {mobile && (
          <div className="mobile-layer">
            <MobileControls
              onInput={handleInput}
            />
          </div>
        )}

      </div>
    </div>
  )
}