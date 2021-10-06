import LaserMaterial, {
  LaserMaterialParams,
} from '../../Material/LaserMaterial'
import * as THREE from 'three'
import Analyser, { Note } from '../../Analyser'
import cremap from '../../../Utils/cremap'
import observableState, {
  ObservableState,
} from '../../../Utils/observableState'

export default class FrontLaser {
  public mesh: THREE.Mesh
  private mat: LaserMaterial
  private state: Analyser['state']
  private laserState: ObservableState<LaserMaterialParams>
  //   private enable: boolean = false
  private nbr: number
  private melodies: [string, string]

  private static nbr = 1

  constructor(
    mesh: THREE.Mesh,
    state: Analyser['state'],
    melodies: [string, string]
  ) {
    this.melodies = melodies
    FrontLaser.nbr++
    this.nbr = FrontLaser.nbr
    this.state = state
    this.mesh = mesh
    this.laserState = observableState({
      blur: 0,
      decay: 0.2,
      color: 0xff4c50,
      intensity: 2,
    })
    this.mat = new LaserMaterial(
      this.laserState
      // MyDat.getGUI().addFolder(FrontLaser.nbr.toString())
    )
    this.mesh.material = this.mat.material
  }

  public tick(time: number, delta: number) {
    const keys = [
      'melody1',
      'melody2',
      'melody3',
      'melody4',
      'melody5',
      'melody6',
      'melody7',
      'melody8',
    ]

    const c = keys
      .map((k) => this.state[k])
      .sort((a, b) => b.normVal - a.normVal)

    const a = this.state[`melody${this.nbr}`]

    this.mesh.visible =
      this.state[this.melodies[0]] === c[0] ||
      this.state[this.melodies[0]] === c[1] ||
      this.state[this.melodies[1]] === c[0] ||
      this.state[this.melodies[1]] === c[1]

    // if (this.state.freqOccupency > 0.7) this.enable = true
  }
}
