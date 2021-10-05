import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import MyDat from '../../Utils/MyDat'

export default class CenterLight {
  private params = {
    color: 0xe5ffff,
    intensity: 1.13,
    distance: 20,
    decay: 2,
  }

  private gui: dat.GUI

  public light: THREE.PointLight

  constructor(parentGui = MyDat.getGUI()) {
    this.gui = parentGui.addFolder('Point Light')
    this.setupObject()
    this.setupGui()
  }

  private setupObject() {
    this.light = new THREE.PointLight(
      this.params.color,
      this.params.intensity,
      this.params.distance,
      this.params.decay
    )
    this.light.position.set(0, 3, 5)
  }

  private setupGui() {
    this.gui
      .add(this.params, 'intensity', 0, 1.5, 0.01)
      .onChange((v) => (this.light.intensity = v))
    this.gui
      .add(this.params, 'distance')
      .onChange((v) => (this.light.distance = v))
    this.gui
      .add(this.params, 'decay', 0.5, 2.5, 0.01)
      .onChange((v) => (this.light.decay = v))
    this.gui
      .addColor(this.params, 'color')
      .onChange((v) => (this.light.color = new THREE.Color(v)))
  }
}
