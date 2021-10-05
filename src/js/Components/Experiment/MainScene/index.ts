import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import MyDat from '../../../Utils/MyDat'
import { AppState } from '..'
import FrontLasers from '../../FrontLasers'
import BackLight from '../../BackLight'
import CenterLight from '../../CenterLight'
import BackLasers from '../../BackLasers'

export default class MainScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera

  private renderer: THREE.WebGLRenderer
  private state: AppState

  private tickingObjects: { tick: (time: number, delta: number) => void }[] = []

  constructor(
    renderer: THREE.WebGLRenderer,
    gltf: GLTF,
    renderTarget: THREE.WebGLRenderTarget,
    state: AppState
  ) {
    this.state = state
    this.renderer = renderer
    this.setCamera(gltf)
    this.setObjects(gltf, renderTarget)
  }

  private setCamera(gltf: GLTF) {
    const camRoot = gltf.scene.getObjectByName('Camera')
    this.camera = camRoot.children[0] as THREE.PerspectiveCamera

    this.camera.position.copy(camRoot.position)
    camRoot.quaternion.multiply(this.camera.quaternion)
    this.camera.quaternion.copy(camRoot.quaternion)
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.target.set(0, 6.673530578613281, -9.32719898223877)
    controls.enabled = false
    controls.update()
    MyDat.getGUI().add(controls, 'enabled').name('orbitControls')
    MyDat.getGUI()
      .add(this.camera, 'fov', 20, 45, 0.1)
      .onChange(() => this.camera.updateProjectionMatrix())

    const resize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    }
    resize()

    window.addEventListener('resize', resize)
  }

  private setObjects(gltf: GLTF, renderTarget: THREE.WebGLRenderTarget) {
    this.scene = new THREE.Scene()

    const lightGui = MyDat.getGUI().addFolder('Light')

    const gltfChildren = gltf.scene.children
    let untouchedChildren = gltfChildren.filter(
      (o) => !o.name.startsWith('Light') || o.name !== 'Middle_Back_light_Null'
    )

    const frontLasers = gltfChildren.filter((o) => o.name.startsWith('Light_2'))
    const frontLasersObj = new FrontLasers(frontLasers as THREE.Mesh[])
    const backLasers = gltfChildren.filter((o) => o.name.startsWith('Light_1'))
    const backLasersObj = new BackLasers(backLasers as THREE.Mesh[])

    const backLight = new BackLight(gltf, lightGui)
    const centerLight = new CenterLight(lightGui)
    const middle = gltf.scene.getObjectByName('Middle') as THREE.Mesh
    const rightSide = gltf.scene.getObjectByName('Right_Side') as THREE.Mesh
    const leftSide = gltf.scene.getObjectByName('Left_Side') as THREE.Mesh
    const material = new THREE.MeshBasicMaterial()
    material.map = renderTarget.texture

    middle.material = material
    rightSide.material = material
    leftSide.material = material

    this.scene.add(
      ...untouchedChildren,
      centerLight.light,
      frontLasersObj.group,
      backLasersObj.group,
      backLight.group
      // new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial())
    )
    this.scene.add(this.camera)
  }

  public tick(time: number, delta: number) {
    for (const obj of this.tickingObjects) obj.tick(time, delta)
  }
}
