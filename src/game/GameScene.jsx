import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import Rocket from './Rocket'
import Space from './Space'
import { PLANETS } from './planets'

import soundManager from '../../audio/soundManager'
import logger from '../../utils/logger'

import {
  CRUISE_SPEED,
  BOOST_MAX_SPEED,
  BRAKE_TARGET_SPEED,
  SPEED_SMOOTHING,
  LINE_CORRECTION_SPEED,
  BOOST_DRAIN,
  BOOST_RECHARGE,
  HUD_UPDATE_INTERVAL,
  ORBIT_TRIGGER_RADIUS,
  ORBIT_RESET_RADIUS,
  ORBIT_DURATION,
  ORBIT_ANGULAR_SPEED,
  ORBIT_CRUISE_SPEED,
} from '../../constants/gameConfig'

export default function GameScene({
  input,
  onHudUpdate,
  onPlanetChange,
  exitOrbitRef,
}) {
  const rocketRef = useRef(null)

  const speed = useRef(0)
  const boostFuel = useRef(100)
  const boostAmount = useRef(0)
  const hudTimer = useRef(0)
  const wasBoosting = useRef(false)

  const planetState = useRef(
    PLANETS.map(() => ({
      triggered: false,
    })),
  )

  const orbit = useRef({
    active: false,
    index: -1,
    angle: 0,
    radius: 0,
    timer: 0,
  })

  const { camera } = useThree()

  useFrame((_, delta) => {
    if (!rocketRef.current) return

    /* =====================================================
       ORBIT
       ===================================================== */

    if (orbit.current.active) {
      orbit.current.timer += delta

      const forcedExit = exitOrbitRef?.current

      if (forcedExit) {
        exitOrbitRef.current = false
      }

      if (
        orbit.current.timer > ORBIT_DURATION ||
        forcedExit
      ) {
        orbit.current.active = false

        onPlanetChange?.(null)

        soundManager.playPanelClose()

        logger.info(
          'Game',
          'Orbit ended',
          {
            planet:
              PLANETS[orbit.current.index]?.id,
          },
        )
      } else {
        const planet =
          PLANETS[orbit.current.index]

        orbit.current.angle +=
          ORBIT_ANGULAR_SPEED * delta

        const px = planet.position[0]
        const py = planet.position[1]
        const pz = planet.position[2]

        const r = orbit.current.radius

        const x =
          px +
          Math.cos(orbit.current.angle) *
            r

        const z =
          pz +
          Math.sin(orbit.current.angle) *
            r

        const y =
          py +
          Math.sin(
            orbit.current.angle * 2,
          ) *
            1.2

        rocketRef.current.position.set(
          x,
          y,
          z,
        )

        const tangent =
          orbit.current.angle +
          Math.PI / 2

        rocketRef.current.rotation.y =
          tangent

        speed.current =
          ORBIT_CRUISE_SPEED

        const facingX =
          Math.cos(tangent)

        const facingZ =
          Math.sin(tangent)

        const cameraDistance = 8
        const cameraHeight = 3.2

        const targetCameraX =
          x -
          facingX *
            cameraDistance

        const targetCameraZ =
          z -
          facingZ *
            cameraDistance

        const smooth =
          1 -
          Math.exp(-5 * delta)

        camera.position.x +=
          (targetCameraX -
            camera.position.x) *
          smooth

        camera.position.y +=
          (cameraHeight -
            camera.position.y) *
          smooth

        camera.position.z +=
          (targetCameraZ -
            camera.position.z) *
          smooth

        camera.lookAt(
          x + facingX * 4,
          y,
          z + facingZ * 4,
        )

        soundManager.updateThrust(
          0.45,
          false,
        )

        hudTimer.current += delta

        if (
          hudTimer.current >=
            HUD_UPDATE_INTERVAL &&
          onHudUpdate
        ) {
          hudTimer.current = 0

          onHudUpdate({
            speedPct: 0.45,
            boostPct:
              boostFuel.current / 100,
            boosting: false,
            overheat: false,
            orbiting: true,
          })
        }

        return
      }
    }

    /* =====================================================
       INPUT
       ===================================================== */

    const wantsForward =
      !!input?.forward

    const wantsBoost =
      !!input?.boost &&
      boostFuel.current > 2 &&
      wantsForward

    const wantsBrake =
      !!input?.brake

    /* =====================================================
       BOOST
       ===================================================== */

    if (wantsBoost) {
      boostFuel.current =
        Math.max(
          0,
          boostFuel.current -
            BOOST_DRAIN * delta,
        )

      boostAmount.current =
        THREE.MathUtils.lerp(
          boostAmount.current,
          1,
          1 -
            Math.pow(
              0.001,
              delta,
            ),
        )
    } else {
      boostFuel.current =
        Math.min(
          100,
          boostFuel.current +
            BOOST_RECHARGE * delta,
        )

      boostAmount.current =
        THREE.MathUtils.lerp(
          boostAmount.current,
          0,
          1 -
            Math.pow(
              0.001,
              delta,
            ),
        )
    }

    const boosting =
      boostAmount.current > 0.05

    if (
      boosting &&
      !wasBoosting.current
    ) {
      soundManager.playBoostStart()

      logger.info(
        'Game',
        'Boost engaged',
      )
    }

    if (
      !boosting &&
      wasBoosting.current
    ) {
      logger.info(
        'Game',
        'Boost released',
      )
    }

    wasBoosting.current =
      boosting

    /* =====================================================
       SPEED
       ===================================================== */

    let targetSpeed = 0

    if (wantsBrake) {
      targetSpeed =
        BRAKE_TARGET_SPEED
    } else if (wantsForward) {
      targetSpeed = boosting
        ? BOOST_MAX_SPEED
        : CRUISE_SPEED
    } else {
      targetSpeed = 0
    }

    speed.current =
      THREE.MathUtils.lerp(
        speed.current,
        targetSpeed,
        1 -
          Math.pow(
            0.001,
            delta *
              SPEED_SMOOTHING,
          ),
      )

    /* =====================================================
       THRUST AUDIO
       ===================================================== */

    const thrustLevel =
      Math.min(
        1,
        speed.current /
          CRUISE_SPEED /
          2,
      )

    soundManager.updateThrust(
      thrustLevel,
      boosting,
    )

    /* =====================================================
       FORWARD MOVEMENT
       ===================================================== */

    rocketRef.current.position.x +=
      speed.current * delta

    /* =====================================================
       KEEP ROCKET ON CENTER LINE
       ===================================================== */

    const correction =
      1 -
      Math.pow(
        0.001,
        delta *
          LINE_CORRECTION_SPEED,
      )

    rocketRef.current.position.z +=
      (0 -
        rocketRef.current.position.z) *
      correction

    rocketRef.current.position.y +=
      (0 -
        rocketRef.current.position.y) *
      correction

    rocketRef.current.rotation.y = 0

    /* =====================================================
       PLANETS
       ===================================================== */

    const rx =
      rocketRef.current.position.x

    const rz =
      rocketRef.current.position.z

    PLANETS.forEach(
      (planet, i) => {
        const dx =
          rx -
          planet.position[0]

        const dz =
          rz -
          planet.position[2]

        const dist =
          Math.hypot(dx, dz)

        const state =
          planetState.current[i]

        if (
          dist >
          ORBIT_RESET_RADIUS
        ) {
          state.triggered = false
        } else if (
          !state.triggered &&
          dist <
            ORBIT_TRIGGER_RADIUS &&
          !orbit.current.active
        ) {
          state.triggered = true

          orbit.current = {
            active: true,
            index: i,
            angle: Math.atan2(
              dz,
              dx,
            ),
            radius:
              planet.orbitRadius,
            timer: 0,
          }

          onPlanetChange?.(
            planet,
          )

          soundManager.playOrbitChime()

          logger.info(
            'Game',
            'Orbit started',
            {
              planet:
                planet.id,
            },
          )
        }
      },
    )

    /* =====================================================
       CAMERA
       ===================================================== */

    const cameraDistance =
      boosting
        ? 9.5
        : 8

    const cameraHeight = 3.5

    const shake =
      boosting
        ? (Math.random() - 0.5) *
          0.08
        : 0

    const targetCameraX =
      rocketRef.current.position.x -
      cameraDistance

    const targetCameraZ =
      rocketRef.current.position.z

    const smooth =
      1 -
      Math.exp(-5 * delta)

    camera.position.x +=
      (targetCameraX -
        camera.position.x) *
        smooth +
      shake

    camera.position.y +=
      (cameraHeight -
        camera.position.y) *
      smooth

    camera.position.z +=
      (targetCameraZ -
        camera.position.z) *
        smooth +
      shake

    camera.lookAt(
      rocketRef.current.position.x +
        4,
      rocketRef.current.position.y,
      rocketRef.current.position.z,
    )

    /* =====================================================
       HUD
       ===================================================== */

    hudTimer.current += delta

    if (
      hudTimer.current >=
        HUD_UPDATE_INTERVAL &&
      onHudUpdate
    ) {
      hudTimer.current = 0

      onHudUpdate({
        speedPct:
          Math.min(
            1,
            speed.current /
              BOOST_MAX_SPEED,
          ),

        boostPct:
          boostFuel.current / 100,

        boosting,

        overheat:
          boosting &&
          boostFuel.current < 15,

        orbiting: false,
      })
    }
  })

  return (
    <>
      <Space />

      <ambientLight
        intensity={1.2}
      />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
      />

      <Rocket
        ref={rocketRef}
        speedRef={speed}
        boostRef={boostAmount}
      />
    </>
  )
}