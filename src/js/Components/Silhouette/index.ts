import * as THREE from 'three'
import remap from '../../Utils/remap'
import Easing from 'easing-functions'

export default class Silhouette {
  public mesh: THREE.InstancedMesh
  constructor() {
    const a = 200
    const origGeom = new THREE.PlaneGeometry(0.344, 1)
    const geom = this.createGeometry(a, origGeom)

    const t = new THREE.TextureLoader().load(
      require('@textures/silhouette.png').default
    )

    const mat = new THREE.MeshBasicMaterial({
      alphaMap: t,
      color: 0x000000,
      transparent: true,
      alphaTest: 0.99,
    })

    this.mesh = new THREE.InstancedMesh(geom, mat, a)
    const obj = new THREE.Object3D()
    for (let index = 0; index < a; index++) {
      const s = remap(Math.random(), [0, 1], [0.9, 1.1])
      obj.scale.setScalar(s * 8)
      const r =
        (Easing.Exponential.Out(Math.random()) * 8 + 2) *
        Math.sign(Math.random() - 0.5)
      obj.position.x = r
      obj.position.z = remap(Math.random(), [0, 1], [4, 6])
      obj.position.y = -1
      obj.updateMatrix()
      this.mesh.setMatrixAt(index, obj.matrix)
    }
  }

  private createGeometry(amount: number, origGeometry: THREE.BufferGeometry) {
    const geometry = new THREE.InstancedBufferGeometry()

    geometry.instanceCount = amount

    Object.keys(origGeometry.attributes).forEach((attributeName) => {
      geometry.attributes[attributeName] =
        origGeometry.attributes[attributeName]
    })
    geometry.index = origGeometry.index

    const index = new Float32Array(amount)

    for (let i = 0; i < amount; i++) index[i] = i
    geometry.setAttribute(
      'aIndex',
      new THREE.InstancedBufferAttribute(index, 1, false)
    )

    return geometry
  }
}
