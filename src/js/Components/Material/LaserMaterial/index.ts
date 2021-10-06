import * as THREE from 'three'
import MyDat from '../../../Utils/MyDat'
import observableState, {
  ObservableState,
} from '../../../Utils/observableState'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'

export type LaserMaterialParams = {
  blur: number
  decay: number
  color: THREE.ColorRepresentation
  intensity: number
}

export default class LaserMaterial {
  private params: ObservableState<LaserMaterialParams>

  private gui: dat.GUI

  public material: THREE.RawShaderMaterial

  constructor(
    params: LaserMaterialParams | ObservableState<LaserMaterialParams>,
    parentGui = null
  ) {
    this.params = 'onChange' in params ? params : observableState(params)

    this.material = new THREE.RawShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uBlur: { value: this.params.blur },
        uDecay: { value: this.params.decay },
        uColor: { value: new THREE.Color(this.params.color) },
        uIntensity: { value: this.params.intensity },
      },
      transparent: true,
    })

    this.params.onChange('color', (v) =>
      this.material.uniforms.uColor.value.set(v)
    )
    this.params.onChange(
      'decay',
      (v) => (this.material.uniforms.uDecay.value = v)
    )
    this.params.onChange(
      'blur',
      (v) => (this.material.uniforms.uBlur.value = v)
    )
    this.params.onChange(
      'intensity',
      (v) => (this.material.uniforms.uIntensity.value = v)
    )

    if (parentGui) {
      this.gui = parentGui.addFolder('LaserMaterial')
      this.gui.addColor(this.params, 'color')
      this.gui.add(this.params, 'decay', 0, 1, 0.01)
      this.gui.add(this.params, 'blur', 0, 1, 0.01)
      this.gui.add(this.params, 'intensity', 0, 1, 0.01)
    }
  }
}
