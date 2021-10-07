import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import AbstractSquares from '../../AbstractSquares'

export default class ScreenScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  private mainCamera: THREE.PerspectiveCamera
  private correctionQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    Math.PI / 4
  )
  private identityQuat = new THREE.Quaternion()

  private tickingObjects: { tick: (time: number, delta: number) => void }[] = []

  constructor(gltf: GLTF, camera: THREE.PerspectiveCamera) {
    this.mainCamera = camera
    this.setCamera(gltf)
    this.setObjects(gltf)
  }

  private setCamera(gltf: GLTF) {
    this.camera = new THREE.PerspectiveCamera(22.9, 1)
  }

  private setObjects(gltf: GLTF) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('black')

    const squares = new AbstractSquares(
      100,
      (gltf.scene.getObjectByName('Shape_3') as THREE.Mesh).geometry
    )
    this.tickingObjects.push(squares)
    this.scene.add(this.camera, squares.mesh)
  }

  public tick(time: number, delta: number) {
    this.mainCamera.getWorldQuaternion(this.camera.quaternion)
    this.camera.quaternion.slerp(this.identityQuat, 0.5)
    this.camera.quaternion.multiply(this.correctionQuat)
    for (const obj of this.tickingObjects) obj.tick(time, delta)
  }
}
