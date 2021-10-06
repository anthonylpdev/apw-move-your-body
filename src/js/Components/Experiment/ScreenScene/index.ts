import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import AbstractSquares from '../../AbstractSquares'

export default class ScreenScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera

  private tickingObjects: { tick: (time: number, delta: number) => void }[] = []

  constructor(gltf: GLTF) {
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
      200,
      (gltf.scene.getObjectByName('Shape_2') as THREE.Mesh).geometry
    )
    this.tickingObjects.push(squares)
    this.scene.add(this.camera, squares.mesh)
  }

  public tick(time: number, delta: number) {
    for (const obj of this.tickingObjects) obj.tick(time, delta)
  }
}
