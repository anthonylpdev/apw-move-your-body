import * as THREE from 'three'
import Analyser from '../Analyser'
import BackLaser from './BackLaser'

export default class BackLasers {
  private lasers: BackLaser[] = []
  public group: THREE.Group

  private state: Analyser['state']

  constructor(meshes: THREE.Mesh[], state: Analyser['state']) {
    this.state = state
    this.group = new THREE.Group()

    for (const mesh of meshes) {
      this.lasers.push(new BackLaser(mesh, this.state))
    }

    this.group.add(
      ...this.lasers.map((l) => l.mesh),
      ...this.lasers.map((l) => l.light)
    )
  }

  public tick(time: number, delta: number) {
    for (const laser of this.lasers) laser.tick(time, delta)
  }
}
