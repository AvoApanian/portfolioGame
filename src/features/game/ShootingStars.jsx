import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CORRIDOR_START_X, CORRIDOR_END_X } from '../../constants/gameConfig'

const STREAK_COUNT = 8
const CENTER_X = (CORRIDOR_START_X + CORRIDOR_END_X) / 2

function randomSpawn() {
  const radius = 140 + Math.random() * 60
  const theta = Math.random() * Math.PI * 2
  const y = (Math.random() - 0.5) * 70

  const dir = new THREE.Vector3(
    -Math.cos(theta) + (Math.random() - 0.5) * 0.4,
    (Math.random() - 0.5) * 0.3,
    -Math.sin(theta) + (Math.random() - 0.5) * 0.4,
  ).normalize()

  return {
    position: new THREE.Vector3(
      CENTER_X + Math.cos(theta) * radius,
      y,
      Math.sin(theta) * radius,
    ),
    dir,
    speed: 60 + Math.random() * 50,
    life: 0,
    maxLife: 1.1 + Math.random() * 0.6,
    delay: Math.random() * 12,
  }
}

export default function ShootingStars() {
  const groupRef = useRef(null)

  const streaks = useMemo(
    () => new Array(STREAK_COUNT).fill(null).map(() => randomSpawn()),
    [],
  )

  useFrame((_, delta) => {
    streaks.forEach((s, i) => {
      const mesh = groupRef.current?.children[i]
      if (!mesh) return

      if (s.delay > 0) {
        s.delay -= delta
        mesh.visible = false
        return
      }

      s.life += delta

      if (s.life > s.maxLife) {
        Object.assign(s, randomSpawn())
        mesh.visible = false
        return
      }

      mesh.visible = true

      s.position.addScaledVector(s.dir, s.speed * delta)
      mesh.position.copy(s.position)
      mesh.lookAt(s.position.clone().add(s.dir))

      const fadeIn = Math.min(1, s.life / 0.15)
      const fadeOut = Math.min(1, (s.maxLife - s.life) / 0.4)
      mesh.material.opacity = 0.9 * Math.min(fadeIn, fadeOut)
    })
  })

  return (
    <group ref={groupRef}>
      {streaks.map((_, i) => (
        <mesh key={i}>
          <planeGeometry args={[0.12, 4.5]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#aaddff' : '#ffffff'}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
