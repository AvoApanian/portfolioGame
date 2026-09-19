import {
  forwardRef,
  useRef,
} from 'react'

import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

import * as THREE from 'three'

import rocketModel from '../../mesh3D/fusee.glb'
import PlasmaTrail from './PlasmaTrail'

const ENGINE_POSITION = [
  -1.2,
  0,
  0,
]

function Engine({
  position,
  moving,
  boosting,
  overheat,
}) {
  const outer = useRef(null)
  const middle = useRef(null)
  const inner = useRef(null)
  const light = useRef(null)

  useFrame((state) => {
    const t =
      state.clock.elapsedTime

    const flicker =
      1 +
      (Math.random() - 0.5) *
        0.08

    if (outer.current) {
      outer.current.visible =
        moving.current
    }

    if (middle.current) {
      middle.current.visible =
        moving.current
    }

    if (inner.current) {
      inner.current.visible =
        moving.current
    }

    if (light.current) {
      const base =
        boosting.current
          ? 4.2
          : 2.5

      light.current.intensity =
        moving.current
          ? base +
            Math.sin(t * 40) *
              0.8
          : 0

      light.current.color.set(
        overheat.current
          ? '#ff2200'
          : boosting.current
            ? '#66ccff'
            : '#ff4500',
      )
    }

    if (!moving.current) {
      return
    }

    const speedBoost =
      boosting.current
        ? 1.6
        : 1

    const lenOuter =
      (1 +
        Math.sin(t * 28) *
          0.18) *
      speedBoost *
      flicker

    const lenMiddle =
      (1 +
        Math.sin(t * 42) *
          0.22) *
      speedBoost *
      flicker

    const lenInner =
      (1 +
        Math.sin(t * 55) *
          0.25) *
      speedBoost *
      flicker

    outer.current.scale.set(
      1,
      lenOuter,
      lenOuter,
    )

    middle.current.scale.set(
      1,
      lenMiddle,
      lenMiddle,
    )

    inner.current.scale.set(
      1,
      lenInner,
      lenInner,
    )

    const outerColor =
      overheat.current
        ? '#ff5500'
        : boosting.current
          ? '#00aaff'
          : '#ff2200'

    const midColor =
      overheat.current
        ? '#ffaa00'
        : boosting.current
          ? '#66eeff'
          : '#ff6600'

    const innerColor =
      overheat.current
        ? '#ffffff'
        : boosting.current
          ? '#eaffff'
          : '#fff700'

    outer.current.material.color.set(
      outerColor,
    )

    middle.current.material.color.set(
      midColor,
    )

    inner.current.material.color.set(
      innerColor,
    )
  })

  return (
    <group position={position}>
      <mesh
        ref={outer}
        rotation={[
          0,
          0,
          Math.PI / 2,
        ]}
        visible={false}
      >
        <coneGeometry
          args={[
            0.35,
            1.6,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#ff2200"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={middle}
        rotation={[
          0,
          0,
          Math.PI / 2,
        ]}
        visible={false}
      >
        <coneGeometry
          args={[
            0.25,
            1.3,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={inner}
        rotation={[
          0,
          0,
          Math.PI / 2,
        ]}
        visible={false}
      >
        <coneGeometry
          args={[
            0.13,
            0.9,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#fff700"
        />
      </mesh>

      <pointLight
        ref={light}
        color="#ff4500"
        intensity={0}
        distance={5}
        decay={2}
      />
    </group>
  )
}

const Rocket = forwardRef(
  function Rocket(
    {
      speedRef,
      boostRef,
    },
    ref,
  ) {
    const { scene } =
      useGLTF(rocketModel)

    const bobGroup =
      useRef(null)

    const moving =
      useRef(false)

    const boosting =
      useRef(false)

    const overheat =
      useRef(false)

    const boostHeat =
      useRef(0)

    useFrame(
      (state, delta) => {
        const speed =
          Math.abs(
            speedRef.current,
          )

        moving.current =
          speed > 0.05

        boosting.current =
          boostRef.current >
          0.05

        boostHeat.current =
          THREE.MathUtils.clamp(
            boostHeat.current +
              (boosting.current
                ? delta * 0.35
                : -delta * 0.5),
            0,
            1,
          )

        overheat.current =
          boostHeat.current >
          0.9

        if (!bobGroup.current) {
          return
        }

        const t =
          state.clock.elapsedTime

        bobGroup.current.position.y =
          Math.sin(t * 1.6) *
          0.06

        bobGroup.current.rotation.z =
          Math.sin(t * 1.1) *
          0.02
      },
    )

    return (
      <group ref={ref}>
        <group ref={bobGroup}>
          <primitive
            object={scene}
            rotation={[
              0,
              0,
              -Math.PI / 2,
            ]}
          />

          <Engine
            position={
              ENGINE_POSITION
            }
            moving={moving}
            boosting={boosting}
            overheat={overheat}
          />
        </group>

        <PlasmaTrail
          rocketRef={ref}
          speedRef={speedRef}
          boostRef={boostRef}
        />
      </group>
    )
  },
)

useGLTF.preload(rocketModel)

export default Rocket

