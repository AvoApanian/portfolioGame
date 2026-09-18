import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CAPACITY = 80
const MAX_AGE = 0.9
const SPAWN_INTERVAL = 0.014

export default function PlasmaTrail({ rocketRef, speedRef, boostRef }) {
  const pointsRef = useRef(null)
  const spawnCursor = useRef(0)
  const timeSinceSpawn = useRef(0)
  const ages = useRef(new Float32Array(CAPACITY).fill(MAX_AGE + 1))

  const { positions, geometry } = useMemo(() => {
    const positions = new Float32Array(CAPACITY * 3)
    const colors = new Float32Array(CAPACITY * 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return { positions, geometry }
  }, [])

  useFrame((_, delta) => {
    const speed = Math.abs(speedRef.current)
    const moving = speed > 0.4
    const boosting = boostRef.current > 0.05

    if (moving && rocketRef.current) {
      timeSinceSpawn.current += delta

      while (timeSinceSpawn.current > SPAWN_INTERVAL) {
        timeSinceSpawn.current -= SPAWN_INTERVAL

        const i = spawnCursor.current
        spawnCursor.current = (i + 1) % CAPACITY

        const worldPos = new THREE.Vector3(-1.35, 0, 0)
        rocketRef.current.localToWorld(worldPos)

        const jitter = 0.12
        positions[i * 3] = worldPos.x + (Math.random() - 0.5) * jitter
        positions[i * 3 + 1] = worldPos.y + (Math.random() - 0.5) * jitter
        positions[i * 3 + 2] = worldPos.z + (Math.random() - 0.5) * jitter

        ages.current[i] = 0
      }
    }

    const colorAttr = geometry.attributes.color
    const posAttr = geometry.attributes.position

    for (let i = 0; i < CAPACITY; i++) {
      if (ages.current[i] > MAX_AGE) {
        colorAttr.array[i * 3] = 0
        colorAttr.array[i * 3 + 1] = 0
        colorAttr.array[i * 3 + 2] = 0
        continue
      }

      ages.current[i] += delta
      const fade = Math.max(0, 1 - ages.current[i] / MAX_AGE)

      if (boosting) {
        colorAttr.array[i * 3] = 0.5 * fade
        colorAttr.array[i * 3 + 1] = 0.85 * fade
        colorAttr.array[i * 3 + 2] = 1.0 * fade
      } else {
        colorAttr.array[i * 3] = 1.0 * fade
        colorAttr.array[i * 3 + 1] = 0.45 * fade
        colorAttr.array[i * 3 + 2] = 0.12 * fade
      }
    }

    colorAttr.needsUpdate = true
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.22}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
