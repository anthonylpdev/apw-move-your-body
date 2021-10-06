import * as THREE from 'three'
import MyDat from '../../Utils/MyDat'
import Analyser from '../Analyser'
import BackLaser from '../BackLasers/BackLaser'
import LaserMaterial from '../Material/LaserMaterial'
import fragmentShader from './fragmentShader.frag'
import FrontLaser from './FrontLaser'
import vertexShader from './vertexShader.vert'

const assoc = {
  ['Light_2001']: ['melody1', 'melody2'],
  ['Light_2003']: ['melody3', 'melody4'],
  ['Light_2002']: ['melody5', 'melody6'],
  ['Light_2007']: ['melody7', 'melody8'],
  ['Light_2006']: ['melody1', 'melody2'],
  ['Light_2004']: ['melody3', 'melody4'],
  ['Light_2005']: ['melody5', 'melody6'],
  ['Light_2008']: ['melody7', 'melody8'],
}

export default class FrontLasers {
  private lasers: FrontLaser[] = []
  public group: THREE.Group
  private state: Analyser['state']

  constructor(meshes: THREE.Mesh[], state: Analyser['state']) {
    console.log(meshes)
    this.state = state
    this.group = new THREE.Group()

    for (const mesh of meshes)
      this.lasers.push(new FrontLaser(mesh, this.state, assoc[mesh.name]))

    this.group.add(...this.lasers.map((l) => l.mesh))
  }

  public tick(time: number, delta: number) {
    for (const laser of this.lasers) laser.tick(time, delta)
  }
}
