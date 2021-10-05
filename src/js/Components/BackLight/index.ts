import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import MyDat from '../../Utils/MyDat'

export default class BackLight {
  private params = {
    color: 0xc3f0ff,
    intensity: 2,
    distance: 28,
    angle: 1.09,
    penumbra: 1,
    decay: 0.7,
  }

  private gui: dat.GUI

  private light: THREE.SpotLight
  public group: THREE.Group

  constructor(gltf: GLTF, parentGui = MyDat.getGUI()) {
    this.gui = parentGui.addFolder('Back light')
    this.setupObject(gltf)
    this.setupGui()
  }

  private setupObject(gltf: GLTF) {
    this.group = new THREE.Group()
    this.light = new THREE.SpotLight(
      this.params.color,
      this.params.intensity,
      this.params.distance,
      this.params.angle,
      this.params.penumbra,
      this.params.decay
    )

    const nullObj = gltf.scene.getObjectByName('Middle_Back_light_Null')
    const middleScreen = gltf.scene.getObjectByName('Middle')

    this.light.position.copy(nullObj.position)
    this.light.quaternion.copy(nullObj.quaternion)
    this.light.target = new THREE.Object3D().copy(middleScreen)
    this.light.target.updateMatrixWorld()

    this.group.add(this.light, this.light.target)
  }

  private setupGui() {
    this.gui
      .addColor(this.params, 'color')
      .onChange((v) => (this.light.color = new THREE.Color(v)))
    this.gui
      .add(this.params, 'intensity', 0, 8, 0.01)
      .onChange((v) => (this.light.intensity = v))
    this.gui
      .add(this.params, 'distance')
      .onChange((v) => (this.light.distance = v))
    this.gui
      .add(this.params, 'angle', 0, Math.PI / 2)
      .onChange((v) => (this.light.angle = v))
    this.gui
      .add(this.params, 'penumbra', 0, 1, 0.01)
      .onChange((v) => (this.light.penumbra = v))
    this.gui
      .add(this.params, 'decay', 0, 3)
      .onChange((v) => (this.light.decay = v))
  }
}
