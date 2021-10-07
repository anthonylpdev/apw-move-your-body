import * as THREE from 'three'
import MyDat from '../../../Utils/MyDat'
import observableState, {
  ObservableState,
} from '../../../Utils/observableState'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'

export type ScreenMaterialParams = {
  map: THREE.Texture
  ratio: number
}

export default class ScreenMaterial {
  private params: ObservableState<ScreenMaterialParams>

  public material: THREE.RawShaderMaterial

  constructor(
    params: ScreenMaterialParams | ObservableState<ScreenMaterialParams>
  ) {
    this.params = 'onChange' in params ? params : observableState(params)

    this.material = new THREE.RawShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uMap: { value: this.params.map },
        uRatio: { value: this.params.ratio },
      },
    })

    this.params.onChange('map', (v) => (this.material.uniforms.uMap.value = v))
  }
}
