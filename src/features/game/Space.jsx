import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Asteroids from './Asteroids'
import ShootingStars from './ShootingStars'
import BlackHole from './BlackHole'
import Galaxies from './Galaxies'
import { PLANETS } from './planets'
import { CORRIDOR_START_X, CORRIDOR_END_X } from '../../constants/gameConfig'

const CORRIDOR_CENTER_X = (CORRIDOR_START_X + CORRIDOR_END_X) / 2
const CORRIDOR_LENGTH = CORRIDOR_END_X - CORRIDOR_START_X

const STAR_PALETTE = ['#ffffff', '#cfe8ff', '#ffe9c2', '#ffd0d0', '#d6c2ff']

function StarField() {
  const starsRef = useRef(null)

  const { positions, colors } = useMemo(() => {
    const positions = []
    const colors = []
    const color = new THREE.Color()

    for (let i = 0; i < 8000; i++) {
      const radius = 40 + Math.random() * (CORRIDOR_LENGTH * 0.75)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions.push(
        CORRIDOR_CENTER_X + radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      )

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
    starsRef.current.rotation.y = state.clock.elapsedTime * 0.0015
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

  const lineGeometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        points[1], points[0], points[2],
        points[0], points[3], points[4],
        points[3], points[5],
      ]),
    [points],
  )

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
    for (let i = 0; i < 2200; i++) {
      positions.push(
        CORRIDOR_START_X + Math.random() * CORRIDOR_LENGTH,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 220,
      )
    }
    return new Float32Array(positions)
  }, [])

  useFrame((_, delta) => {
    if (!particlesRef.current) return
    particlesRef.current.rotation.y += delta * 0.005
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

function NebulaField() {
  const nebulae = useMemo(() => {
    const palette = ['#6a00ff', '#0055ff', '#ff0088', '#00ccff', '#ff8800', '#22ffaa']
    const items = []
    for (let i = 0; i < 9; i++) {
      items.push({
        position: [
          CORRIDOR_START_X + Math.random() * CORRIDOR_LENGTH,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 200,
        ],
        color: palette[i % palette.length],
        scale: [4 + Math.random() * 4, 3 + Math.random() * 2, 3 + Math.random() * 4],
      })
    }
    return items
  }, [])

  return (
    <>
      {nebulae.map((n, i) => (
        <Nebula key={i} {...n} />
      ))}
    </>
  )
}

function CosmicDust() {
  const dust = useMemo(() => {
    const positions = []
    for (let i = 0; i < 1800; i++) {
      positions.push(
        CORRIDOR_START_X + Math.random() * CORRIDOR_LENGTH,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 220,
      )
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
      <NebulaField />

      <Constellation position={[-30, 55, -140]} scalePattern={6} />
      <Constellation position={[180, -45, 170]} scalePattern={8} />
      <Constellation position={[380, 40, -120]} scalePattern={7} />

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

      <BlackHole />

      <Asteroids />
    </>
  )
}
