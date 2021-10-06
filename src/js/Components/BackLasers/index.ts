import * as THREE from 'three'
import MyDat from '../../Utils/MyDat'
import LaserMaterial from '../Material/LaserMaterial'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'

export default class BackLasers {
  private meshes: THREE.Mesh[]
  public group: THREE.Group
  private gui: dat.GUI

  constructor(meshes: THREE.Mesh[]) {
    this.meshes = meshes
    this.group = new THREE.Group()
    this.gui = MyDat.getGUI().addFolder('BackLasers')

    const laserMaterial = new LaserMaterial(
      { blur: 0, decay: 0.2, color: 0xf72ae8 },
      this.gui
    )
    const lights: THREE.SpotLight[] = []
    for (const mesh of this.meshes) {
      mesh.material = laserMaterial.material
      const l = new THREE.SpotLight(0xf72ae8, 20, 20, 0.03, 0.5)
      l.position.copy(mesh.position)
      l.position.y += 0.5
      l.target = mesh
      lights.push(l)
    }
    console.log(lights)

    this.group.add(...this.meshes, ...lights)
  }
}
