import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import MyDat from '../../../Utils/MyDat'
import FrontLasers from '../../FrontLasers'
import BackLight from '../../BackLight'
import CenterLight from '../../CenterLight'
import BackLasers from '../../BackLasers'
import Analyser from '../../Analyser'
import BackPanel from '../../BackPanel'
import Silhouette from '../../Silhouette'
import ScreenMaterial from '../../Material/ScreenMaterial'

export default class MainScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera

  private renderer: THREE.WebGLRenderer
  private state: Analyser['state']

  private tickingObjects: { tick: (time: number, delta: number) => void }[] = []
  private targetCursor: THREE.Vector2 = new THREE.Vector2()
  private cursor: THREE.Vector2 = new THREE.Vector2()
  private cameraNull: THREE.Object3D

  constructor(
    renderer: THREE.WebGLRenderer,
    gltf: GLTF,
    renderTarget: THREE.WebGLRenderTarget,
    renderTarget2: THREE.WebGLRenderTarget,
    state: Analyser['state']
  ) {
    this.state = state
    this.renderer = renderer
    this.setCamera(gltf)
    this.setObjects(gltf, renderTarget, renderTarget2)
    this.renderer.compile(this.scene, this.camera)
  }

  private setCamera(gltf: GLTF) {
    const camRoot = gltf.scene.getObjectByName('Camera')
    this.camera = camRoot.children[0] as THREE.PerspectiveCamera

    this.cameraNull = new THREE.Object3D()
    this.cameraNull.position.set(0, 4.673530578613281, -9.32719898223877)

    this.camera.position.z = 35
    camRoot.quaternion.multiply(this.camera.quaternion)
    this.camera.quaternion.copy(camRoot.quaternion)
    // const controls = new OrbitControls(this.camera, this.renderer.domElement)
    // controls.target.set(0, 6.673530578613281, -9.32719898223877)
    // controls.enabled = false
    // controls.update()
    // MyDat.getGUI().add(controls, 'enabled').name('orbitControls')
    MyDat.getGUI()
      .add(this.camera, 'fov', 20, 45, 0.1)
      .onChange(() => this.camera.updateProjectionMatrix())

    const resize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    }
    resize()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', (event) => {
      this.targetCursor.x = (event.clientX / window.innerWidth) * 2 - 1
      this.targetCursor.y = -(event.clientY / window.innerHeight) * 2 + 1
    })
  }

  private setObjects(
    gltf: GLTF,
    renderTarget: THREE.WebGLRenderTarget,
    renderTarget2: THREE.WebGLRenderTarget
  ) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    const lightGui = MyDat.getGUI().addFolder('Light')

    const gltfChildren = gltf.scene.children
    let untouchedChildren = gltfChildren.filter(
      (o) =>
        !o.name.startsWith('Light') &&
        !o.name.startsWith('Shape') &&
        o.name !== 'Middle_Back_light_Null' &&
        o.name !== 'Head' &&
        !/(Back_light)$/.test(o.name)
    )

    const frontLasers = gltfChildren.filter((o) => o.name.startsWith('Light_2'))
    const frontLasersObj = new FrontLasers(
      frontLasers as THREE.Mesh[],
      this.state
    )
    const backLasers = gltfChildren.filter((o) => o.name.startsWith('Light_1'))
    const backLasersObj = new BackLasers(backLasers as THREE.Mesh[], this.state)

    const backLight = new BackLight(gltf, this.state, lightGui)
    const centerLight = new CenterLight(lightGui)
    const middle = gltf.scene.getObjectByName('Middle') as THREE.Mesh
    const rightSide = gltf.scene.getObjectByName('Right_Side') as THREE.Mesh
    const leftSide = gltf.scene.getObjectByName('Left_Side') as THREE.Mesh
    const screenMaterial = new ScreenMaterial({
      map: renderTarget.texture,
      ratio: 1,
    })

    middle.material = screenMaterial.material
    rightSide.material = screenMaterial.material
    rightSide.visible = false
    leftSide.material = screenMaterial.material
    leftSide.visible = false

    const sLeft = gltf.scene.getObjectByName('Sound_Left') as THREE.Mesh
    const sRight = gltf.scene.getObjectByName('Sound_Right') as THREE.Mesh
    const panelMaterial = new ScreenMaterial({
      map: renderTarget2.texture,
      ratio: 1,
    })
    sLeft.material = panelMaterial.material
    sRight.material = panelMaterial.material

    const backPanels = gltfChildren.filter((o) =>
      /(Back_light)$/.test(o.name)
    ) as THREE.Mesh[]
    const backPanel = new BackPanel(backPanels, this.state)

    this.tickingObjects.push(
      backLight,
      backPanel,
      backLasersObj,
      frontLasersObj
    )
    const sil = new Silhouette()

    this.scene.add(
      ...untouchedChildren,
      centerLight.light,
      frontLasersObj.group,
      backLasersObj.group,
      backLight.group,
      backPanel.group,
      sil.mesh
      // new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial())
    )
    this.cameraNull.add(this.camera)
    this.scene.add(this.cameraNull)
  }

  public tick(time: number, delta: number) {
    this.cursor.lerp(this.targetCursor, 0.02)
    this.cameraNull.rotation.x = this.cursor.y * 0.05
    this.cameraNull.rotation.y = this.cursor.x * 0.3
    for (const obj of this.tickingObjects) obj.tick(time, delta)
  }
}
