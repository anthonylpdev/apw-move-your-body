import * as THREE from 'three'

export default function (point: THREE.Vector2): THREE.Vector2 {
  return point.set(
    1 - (2 * point.x) / window.innerWidth,
    1 - (2 * point.y) / window.innerHeight
  )
}
