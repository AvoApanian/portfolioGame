import { useMemo } from 'react'
import * as THREE from 'three'

function makeGalaxyTexture(hue) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.translate(size / 2, size / 2)

  const arms = 2
  for (let a = 0; a < 900; a++) {
    const t = a / 900
    const armOffset = (a % arms) * ((Math.PI * 2) / arms)
    const angle = t * Math.PI * 6 + armOffset
    const radius = t * size * 0.46
    const spread = (Math.random() - 0.5) * (10 + t * 18)

    const x = Math.cos(angle) * radius + spread
    const y = Math.sin(angle) * radius + spread

    const alpha = (1 - t) * 0.5 * Math.random()
    ctx.fillStyle = `hsla(${hue}, 80%, ${70 - t * 30}%, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, 1.4 + Math.random() * 1.6, 0, Math.PI * 2)
    ctx.fill()
  }

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.18)
  core.addColorStop(0, `hsla(${hue}, 60%, 90%, 0.9)`)
  core.addColorStop(1, `hsla(${hue}, 60%, 90%, 0)`)
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function GalaxySprite({ position, hue, size }) {
  const texture = useMemo(() => makeGalaxyTexture(hue), [hue])

  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

const GALAXIES = [
  { position: [260, 60, -320], hue: 260, size: 140 },
  { position: [-100, -40, 260], hue: 200, size: 170 },
  { position: [230, 120, 340], hue: 320, size: 120 },
  { position: [400, -70, -60], hue: 30, size: 150 },
]

export default function Galaxies() {
  return (
    <>
      {GALAXIES.map((g, i) => (
        <GalaxySprite key={i} {...g} />
      ))}
    </>
  )
}
