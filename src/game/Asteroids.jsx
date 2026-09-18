import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROCK_COUNT = 140

// A scattered instanced-mesh asteroid field. Cheap to render (one draw call)
// and gives the empty space between planets some texture to fly through.
export default function Asteroids() {
  const meshRef = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const rocks = useMemo(() => {
    const items = []
    for (let i = 0; i < ROCK_COUNT; i++) {
      const clusterAngle = Math.floor(Math.random() * 3) * (Math.PI * 0.66)
      const spread = 22
      const clusterRadius = 55 + Math.floor(Math.random() * 3) * 45

      items.push({
        x: Math.cos(clusterAngle) * clusterRadius + (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * 14,
        z: Math.sin(clusterAngle) * clusterRadius + (Math.random() - 0.5) * spread,
        scale: 0.4 + Math.random() * 1.6,
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
