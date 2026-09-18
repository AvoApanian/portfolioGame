import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Rocket from './Rocket'
import Space from './Space'
import { PLANETS } from '../data/planets'
import soundManager from '../audio/soundManager'

const ACCELERATION = 11
const BRAKE_DECEL = 22
const IDLE_DECAY = 0.08
const MAX_SPEED = 14
const BOOST_MAX_SPEED = 23
const BOOST_ACCEL_MULT = 1.9
const TURN_SPEED = 2.6
const BOOST_DRAIN = 42
const BOOST_RECHARGE = 20
const HUD_UPDATE_INTERVAL = 0.08

const ORBIT_TRIGGER_RADIUS = 20
const ORBIT_RESET_RADIUS = 36
const ORBIT_DURATION = 9
const ORBIT_ANGULAR_SPEED = 0.45
const ORBIT_CRUISE_SPEED = 6.5

export default function GameScene({ input, onHudUpdate, onPlanetChange, exitOrbitRef }) {
  const rocketRef = useRef(null)

  const speed = useRef(0)
  const angle = useRef(0)
  const velocityAngle = useRef(0)
  const boostFuel = useRef(100)
  const turnInput = useRef(0)
  const boostAmount = useRef(0)
  const hudTimer = useRef(0)
  const wasBoosting = useRef(false)

  const planetState = useRef(PLANETS.map(() => ({ triggered: false })))
  const orbit = useRef({ active: false, index: -1, angle: 0, radius: 0, timer: 0 })

  const { camera } = useThree()

  useFrame((_, delta) => {
    if (!rocketRef.current) return

    // ==========================================================
    // ORBIT MODE - a planet was reached: autopilot circles it
    // while the CV info panel is open, then flight resumes.
    // ==========================================================
    if (orbit.current.active) {
      orbit.current.timer += delta

      const forcedExit = exitOrbitRef?.current
      if (forcedExit) exitOrbitRef.current = false

      if (orbit.current.timer > ORBIT_DURATION || forcedExit) {
        orbit.current.active = false
        onPlanetChange?.(null)
        soundManager.playPanelClose()
      } else {
        const planet = PLANETS[orbit.current.index]
        orbit.current.angle += ORBIT_ANGULAR_SPEED * delta

        const px = planet.position[0]
        const py = planet.position[1]
        const pz = planet.position[2]
        const r = orbit.current.radius

        const x = px + Math.cos(orbit.current.angle) * r
        const z = pz + Math.sin(orbit.current.angle) * r
        const y = py + Math.sin(orbit.current.angle * 2) * 1.2

        rocketRef.current.position.set(x, y, z)

        const tangent = orbit.current.angle + Math.PI / 2
        rocketRef.current.rotation.y = tangent
        angle.current = tangent
        velocityAngle.current = tangent
        speed.current = ORBIT_CRUISE_SPEED

        const facingX = Math.cos(tangent)
        const facingZ = Math.sin(tangent)
        const cameraDistance = 8
        const cameraHeight = 3.2

        const targetCameraX = x - facingX * cameraDistance
        const targetCameraZ = z - facingZ * cameraDistance
        const smooth = 1 - Math.exp(-5 * delta)

        camera.position.x += (targetCameraX - camera.position.x) * smooth
        camera.position.y += (cameraHeight - camera.position.y) * smooth
        camera.position.z += (targetCameraZ - camera.position.z) * smooth

        camera.lookAt(x + facingX * 4, y, z + facingZ * 4)

        soundManager.updateThrust(0.45, false)

        hudTimer.current += delta
        if (hudTimer.current >= HUD_UPDATE_INTERVAL && onHudUpdate) {
          hudTimer.current = 0
          onHudUpdate({
            speedPct: 0.45,
            boostPct: boostFuel.current / 100,
            boosting: false,
            overheat: false,
            heading: tangent,
            orbiting: true,
          })
        }

        return
      }
    }

    // ==========================================================
    // INPUT (desktop keys or mobile joystick + buttons, unified)
    // ==========================================================
    let throttle = 0
    let turn = 0

    if (input.mobile) {
      throttle = Math.max(0, -input.joystickY || 0)
      turn = -(input.joystickX || 0)
    } else {
      if (input.forward) throttle = 1
      if (input.left) turn += 1
      if (input.right) turn -= 1
    }

    const wantsBoost = !!input.boost && boostFuel.current > 2
    const wantsBrake = !!input.brake

    // ==========================================================
    // NITRO / BOOST GAUGE
    // ==========================================================
    if (wantsBoost && throttle > 0) {
      boostFuel.current = Math.max(0, boostFuel.current - BOOST_DRAIN * delta)
      boostAmount.current = THREE.MathUtils.lerp(boostAmount.current, 1, 1 - Math.pow(0.001, delta))
    } else {
      boostFuel.current = Math.min(100, boostFuel.current + BOOST_RECHARGE * delta)
      boostAmount.current = THREE.MathUtils.lerp(boostAmount.current, 0, 1 - Math.pow(0.001, delta))
    }

    const boosting = boostAmount.current > 0.05

    if (boosting && !wasBoosting.current) soundManager.playBoostStart()
    wasBoosting.current = boosting

    // ==========================================================
    // SPEED - throttle / idle decay / brake
    // ==========================================================
    const maxSpeed = boosting ? BOOST_MAX_SPEED : MAX_SPEED
    const accel = ACCELERATION * (boosting ? BOOST_ACCEL_MULT : 1)

    if (wantsBrake) {
      speed.current = Math.max(0, speed.current - BRAKE_DECEL * delta)
    } else if (throttle > 0) {
      speed.current += accel * throttle * delta
    } else {
      speed.current *= Math.pow(IDLE_DECAY, delta)
    }

    speed.current = Math.min(speed.current, maxSpeed)

    soundManager.updateThrust(Math.min(1, speed.current / MAX_SPEED), boosting)

    // ==========================================================
    // ROTATION - facing angle is direct/responsive; the velocity
    // (travel) angle eases toward it for a light drift feel.
    // ==========================================================
    const turnRate = TURN_SPEED * (wantsBrake ? 1.5 : 1)
    angle.current += turn * turnRate * delta
    turnInput.current = turn

    const driftEase = wantsBrake ? 8 : 3.2
    let angleDiff = angle.current - velocityAngle.current
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
    velocityAngle.current += angleDiff * Math.min(1, driftEase * delta)

    rocketRef.current.rotation.y = angle.current

    // ==========================================================
    // MOVEMENT
    // ==========================================================
    const directionX = Math.cos(velocityAngle.current)
    const directionZ = Math.sin(velocityAngle.current)

    rocketRef.current.position.x += directionX * speed.current * delta
    rocketRef.current.position.z += directionZ * speed.current * delta

    // ==========================================================
    // CV PLANETS - proximity check (with hysteresis so flying away
    // and back lets you re-trigger the same planet).
    // ==========================================================
    const rx = rocketRef.current.position.x
    const rz = rocketRef.current.position.z

    PLANETS.forEach((planet, i) => {
      const dx = rx - planet.position[0]
      const dz = rz - planet.position[2]
      const dist = Math.hypot(dx, dz)
      const state = planetState.current[i]

      if (dist > ORBIT_RESET_RADIUS) {
        state.triggered = false
      } else if (!state.triggered && dist < ORBIT_TRIGGER_RADIUS && !orbit.current.active) {
        state.triggered = true
        orbit.current = {
          active: true,
          index: i,
          angle: Math.atan2(dz, dx),
          radius: planet.orbitRadius,
          timer: 0,
        }
        onPlanetChange?.(planet)
        soundManager.playOrbitChime()
      }
    })

    // ==========================================================
    // CAMERA - chases the nose direction, with a subtle boost shake
    // ==========================================================
    const facingX = Math.cos(angle.current)
    const facingZ = Math.sin(angle.current)

    const cameraDistance = boosting ? 9.5 : 8
    const cameraHeight = 3.5
    const shake = boosting ? (Math.random() - 0.5) * 0.08 : 0

    const targetCameraX = rocketRef.current.position.x - facingX * cameraDistance
    const targetCameraZ = rocketRef.current.position.z - facingZ * cameraDistance

    const smooth = 1 - Math.exp(-5 * delta)

    camera.position.x += (targetCameraX - camera.position.x) * smooth + shake
    camera.position.y += (cameraHeight - camera.position.y) * smooth
    camera.position.z += (targetCameraZ - camera.position.z) * smooth + shake

    const lookAhead = 4
    camera.lookAt(
      rocketRef.current.position.x + facingX * lookAhead,
      rocketRef.current.position.y,
      rocketRef.current.position.z + facingZ * lookAhead,
    )

    // ==========================================================
    // HUD (throttled state push - avoids re-rendering React every frame)
    // ==========================================================
    hudTimer.current += delta
    if (hudTimer.current >= HUD_UPDATE_INTERVAL && onHudUpdate) {
      hudTimer.current = 0
      onHudUpdate({
        speedPct: Math.min(1, speed.current / MAX_SPEED),
        boostPct: boostFuel.current / 100,
        boosting,
        overheat: boosting && boostFuel.current < 15,
        heading: angle.current,
        orbiting: false,
      })
    }
  })

  return (
    <>
      <Space />

      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={2} />

      <Rocket ref={rocketRef} speedRef={speed} boostRef={boostAmount} turnRef={turnInput} />
    </>
  )
}
