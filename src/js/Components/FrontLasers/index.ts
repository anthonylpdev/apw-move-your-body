import * as THREE from 'three'
import MyDat from '../../Utils/MyDat'
import LaserMaterial from '../Material/LaserMaterial'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'

export default class FrontLasers {
  private meshes: THREE.Mesh[]
  public group: THREE.Group
  private gui: dat.GUI

  constructor(meshes: THREE.Mesh[]) {
    this.meshes = meshes
    this.group = new THREE.Group()
    this.gui = MyDat.getGUI().addFolder('FrontLasers')

    const laserMaterial = new LaserMaterial(
      { blur: 0, decay: 0.2, color: 0xff4c00 },
      this.gui
    )

    for (const mesh of this.meshes) mesh.material = laserMaterial.material

    this.group.add(...this.meshes)
  }
}
