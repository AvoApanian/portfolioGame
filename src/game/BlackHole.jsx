import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A stylised black hole: a light-swallowing core plus a glowing,
// spinning accretion disk built from two overlapping tori.
export default function BlackHole({ position = [-160, 10, -220], scale = 1 }) {
  const diskRef = useRef(null)
  const diskRef2 = useRef(null)

  useFrame((_, delta) => {
    if (diskRef.current) diskRef.current.rotation.z += delta * 0.15
    if (diskRef2.current) diskRef2.current.rotation.z -= delta * 0.22
  })

  return (
    <group position={position} scale={scale}>
      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* photon ring glow */}
      <mesh>
        <sphereGeometry args={[6.4, 32, 32]} />
        <meshBasicMaterial
          color="#ffb066"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* accretion disk, two layers for a richer swirl */}
      <mesh ref={diskRef} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[11, 2.4, 16, 96]} />
        <meshBasicMaterial
          color="#ff9a3c"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={diskRef2} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[8.5, 1.1, 16, 96]} />
        <meshBasicMaterial
          color="#ffe6b0"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight color="#ff9a3c" intensity={6} distance={60} />
    </group>
  )
}
