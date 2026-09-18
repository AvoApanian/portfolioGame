import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Asteroids from './Asteroids'
import ShootingStars from './ShootingStars'
import BlackHole from './BlackHole'
import Galaxies from './Galaxies'
import { PLANETS } from '../data/planets'

const STAR_PALETTE = ['#ffffff', '#cfe8ff', '#ffe9c2', '#ffd0d0', '#d6c2ff']

function StarField() {
  const starsRef = useRef(null)

  const { positions, colors } = useMemo(() => {
    const positions = []
    const colors = []
    const color = new THREE.Color()

    for (let i = 0; i < 5000; i++) {
      const radius = 30 + Math.random() * 220
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      )

      // Mostly white/blue-white stars with occasional warm/cool outliers,
      // plus per-star brightness variance for a less uniform sky.
      const palette = STAR_PALETTE[Math.random() < 0.75 ? 0 : Math.floor(Math.random() * STAR_PALETTE.length)]
      color.set(palette)
      const brightness = 0.5 + Math.random() * 0.6
      colors.push(color.r * brightness, color.g * brightness, color.b * brightness)
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    }
  }, [])

  useFrame((state) => {
    if (!starsRef.current) return
    starsRef.current.rotation.y = state.clock.elapsedTime * 0.003
    starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.02
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// A handful of brighter stars connected by faint lines - a recognisable
// constellation shape, loosely inspired by Orion's belt + shoulders.
function Constellation({ position, scalePattern }) {
  const points = useMemo(
    () =>
      [
        [0, 2.2, 0],
        [1.6, 3.4, -0.3],
        [-1.6, 3.4, 0.3],
        [0, 1.1, 0.1],
        [0.9, 0, -0.1],
        [-0.9, 0, 0.1],
      ].map((p) => new THREE.Vector3(...p).multiplyScalar(scalePattern)),
    [scalePattern],
  )

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      points[1], points[0], points[2],
      points[0], points[3], points[4],
      points[3], points[5],
    ])
    return geo
  }, [points])

  return (
    <group position={position}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#8fb8ff" transparent opacity={0.35} />
      </lineSegments>

      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshBasicMaterial color="#eaf4ff" />
        </mesh>
      ))}
    </group>
  )
}

function CosmicParticles() {
  const particlesRef = useRef(null)

  const particles = useMemo(() => {
    const positions = []
    for (let i = 0; i < 1200; i++) {
      positions.push(
        (Math.random() - 0.5) * 180,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 180,
      )
    }
    return new Float32Array(positions)
  }, [])

  useFrame((_, delta) => {
    if (!particlesRef.current) return
    particlesRef.current.rotation.y += delta * 0.01
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.35} color="#8fa8ff" transparent opacity={0.25} depthWrite={false} />
    </points>
  )
}

function Nebula({ position, color, scale }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={1.5}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.025}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight color={color} intensity={4} distance={35} />
    </group>
  )
}

function CosmicDust() {
  const dust = useMemo(() => {
    const positions = []
    for (let i = 0; i < 900; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 15 + Math.random() * 100
      positions.push(Math.cos(angle) * radius, (Math.random() - 0.5) * 35, Math.sin(angle) * radius)
    }
    return new Float32Array(positions)
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={dust.length / 3} array={dust} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#b7c7ff" transparent opacity={0.45} depthWrite={false} />
    </points>
  )
}

function Moon({ orbitRadius, orbitSpeed, size, color }) {
  const orbitRef = useRef(null)

  useFrame((_, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += delta * orbitSpeed
  })

  return (
    <group ref={orbitRef}>
      <mesh position={[orbitRadius, 0, 0]}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

function Planet({ position, size, color, ring, moon }) {
  const planetRef = useRef(null)

  useFrame((_, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.08
  })

  return (
    <group position={position}>
      <mesh scale={1.8}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.035}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
      </mesh>

      {ring && (
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 2.4, 64]} />
          <meshBasicMaterial
            color={ring}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {moon && <Moon {...moon} />}

      <pointLight position={[5, 2, 5]} color={color} intensity={2} distance={20} />
    </group>
  )
}

export default function Space() {
  return (
    <>
      <color attach="background" args={['#01020a']} />

      <StarField />
      <CosmicParticles />
      <CosmicDust />
      <ShootingStars />
      <Galaxies />

      <Constellation position={[-90, 55, -140]} scalePattern={6} />
      <Constellation position={[120, -35, 160]} scalePattern={8} />

      <Nebula position={[40, 15, -70]} color="#6a00ff" scale={[5, 3, 3]} />
      <Nebula position={[-80, -10, -100]} color="#0055ff" scale={[7, 4, 4]} />
      <Nebula position={[100, 20, 40]} color="#ff0088" scale={[4, 3, 5]} />
      <Nebula position={[-40, 30, 80]} color="#00ccff" scale={[6, 3, 3]} />

      {/* The 4 "CV planets" - positions/colors/content live in src/data/planets.js,
          shared with GameScene.jsx which handles proximity + orbit + the info panel. */}
      {PLANETS.map((p) => (
        <Planet
          key={p.id}
          position={p.position}
          size={p.size}
          color={p.color}
          ring={p.ring}
          moon={p.moon}
        />
      ))}

      <BlackHole position={[-170, 25, -260]} scale={1.1} />

      <Asteroids />
    </>
  )
}
