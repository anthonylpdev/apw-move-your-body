import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import MyDat from '../../../Utils/MyDat'
import { AppState } from '..'

export default class MainScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera

  private renderer: THREE.WebGLRenderer
  private state: AppState

  private tickingObjects: { tick: (time: number, delta: number) => void }[] = []

  constructor(renderer: THREE.WebGLRenderer, gltf: GLTF, state: AppState) {
    this.state = state
    this.renderer = renderer
    this.setCamera()
    this.setObjects(gltf)
  }

  private setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    this.camera.position.z = 5.3
    this.camera.position.y = 0.7
    this.camera.position.x = 0.02
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.enabled = false
    MyDat.getGUI().add(controls, 'enabled').name('orbitControls')
    MyDat.getGUI()
      .add(this.camera, 'fov', 35, 90, 0.1)
      .onChange(() => this.camera.updateProjectionMatrix())

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    })
  }

  private setObjects(gltf: GLTF) {
    this.scene = new THREE.Scene()
  }

  public tick(time: number, delta: number) {
    for (const obj of this.tickingObjects) obj.tick(time, delta)
  }
}
