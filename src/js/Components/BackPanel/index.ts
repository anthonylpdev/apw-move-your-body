import Analyser from '../Analyser'
import * as THREE from 'three'
import cremap from '../../Utils/cremap'

export default class BackPanel {
  private meshes: THREE.Mesh[]
  private state: Analyser['state']
  private matetial: THREE.MeshBasicMaterial
  private baseColor: THREE.Color
  public group: THREE.Group

  constructor(meshes: THREE.Mesh[], state: Analyser['state']) {
    this.meshes = meshes
    this.state = state
    this.group = new THREE.Group()

    this.baseColor = new THREE.Color(0xe56f00)

    this.matetial = new THREE.MeshBasicMaterial({ color: 0xe56f00 })
    for (const mesh of this.meshes) {
      mesh.material = this.matetial
    }

    this.group.add(...this.meshes)
  }

  public tick(time: number, delta: number) {
    this.matetial.color
      .copy(this.baseColor)
      .multiplyScalar(cremap(this.state.freqOccupency, [0.15, 1], [0, 1]))
  }
}
