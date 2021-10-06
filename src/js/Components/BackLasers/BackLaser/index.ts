import LaserMaterial, {
  LaserMaterialParams,
} from '../../Material/LaserMaterial'
import * as THREE from 'three'
import Analyser, { Note } from '../../Analyser'
import cremap from '../../../Utils/cremap'
import observableState, {
  ObservableState,
} from '../../../Utils/observableState'
import MyDat from '../../../Utils/MyDat'
import BackLasers from '..'

const colors = {
  // melody1: { r: 229, g: 111, b: 0 },
  // melody2: { r: 255, g: 0, b: 61 },
  // melody3: { r: 50, g: 10, b: 255 },
  // melody4: { r: 210, g: 20, b: 255 },
  // melody5: { r: 246, g: 1, b: 157 },
  // melody6: { r: 110, g: 20, b: 230 },
  // melody7: { r: 3, g: 94, b: 232 },
  // melody8: { r: 212, g: 0, b: 120 },
  melody1: 0xff56c9,
  melody2: 0xff4747,
  melody3: 0xcd4ff7,
  melody4: 0x6766ff,
  melody5: 0x66ecff,
  melody6: 0xbec475,
  melody7: 0xd560ff,
  melody8: 0xffef60,
}

export default class BackLaser {
  public mesh: THREE.Mesh
  private mat: LaserMaterial
  public light: THREE.SpotLight
  private state: Analyser['state']
  private laserState: ObservableState<LaserMaterialParams>
  private enable: boolean = false

  constructor(mesh: THREE.Mesh, state: Analyser['state']) {
    this.state = state
    this.mesh = mesh
    this.laserState = observableState({
      blur: 0,
      decay: 0.5,
      color: 0xf72ae8,
      intensity: 0,
    })
    this.mat = new LaserMaterial(
      this.laserState
      // MyDat.getGUI().addFolder(BackLaser.nbr.toString())
    )
    this.mesh.material = this.mat.material

    this.light = new THREE.SpotLight(0xf72ae8, 0, 20, 0.03, 0.5)
    this.light.position.copy(mesh.position)
    this.light.position.y += 0.5
    this.light.target = mesh

    this.laserState.onChange('color', (v) => this.light.color.set(v))
  }

  public tick(time: number, delta: number) {
    let value = this.enable ? 1 : 0
    this.light.intensity = value * 5
    this.laserState.intensity = value

    let color = 0xf72ae8
    let max = 0

    const keys = Object.keys(colors)

    const c = keys
      .map((k) => ({ color: colors[k], note: this.state[k] }))
      .sort((a, b) => b.note.normVal - a.note.normVal)

    if (Math.abs(c[0].note.normVal - c[1].note.normVal) > 0.05)
      this.laserState.color = c[0].color

    // let totalVal = 0
    // for (const k of keys) {
    //   const note = this.state[k] as Note
    //   totalVal += note.val
    // }
    // for (const k of keys) {
    //   const note = this.state[k] as Note
    //   const inf = note.val / totalVal
    //   rgb.r += (colors[k].r * inf) / 255
    //   rgb.g += (colors[k].g * inf) / 255
    //   rgb.b += (colors[k].b * inf) / 255
    // }
    // ;(this.mat.material.uniforms.uColor.value as THREE.Color).setRGB(
    //   rgb.r,
    //   rgb.g,
    //   rgb.b
    // )

    // if (this.state.freqOccupency > 0.7) this.enable = true
    console.log(this.state.bass.speed)
    if (this.state.bass.speed > 0.5) this.enable = !this.enable
  }
}
