import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CORRIDOR_START_X, CORRIDOR_END_X } from '../../constants/gameConfig'

const ROCK_COUNT = 220

export default function Asteroids() {
  const meshRef = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const rocks = useMemo(() => {
    const items = []
    for (let i = 0; i < ROCK_COUNT; i++) {
      items.push({
        x: CORRIDOR_START_X + Math.random() * (CORRIDOR_END_X - CORRIDOR_START_X),
        y: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 260,
        scale: 0.4 + Math.random() * 1.8,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      })
    }
    return items
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    rocks.forEach((rock, i) => {
      rock.rot[1] += rock.rotSpeed * delta

      dummy.position.set(rock.x, rock.y, rock.z)
      dummy.rotation.set(rock.rot[0], rock.rot[1], rock.rot[2])
      dummy.scale.setScalar(rock.scale)
      dummy.updateMatrix()

      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, ROCK_COUNT]}>
      <dodecahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color="#5b5a63" roughness={1} metalness={0.05} flatShading />
    </instancedMesh>
  )
}
