import * as THREE from 'three'
import MyDat from '../../Utils/MyDat'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'

export default class AbstractSquares {
  private geometry: THREE.InstancedBufferGeometry
  private material: THREE.RawShaderMaterial
  private gui: dat.GUI
  public mesh: THREE.InstancedMesh

  constructor(amount: number, baseGeometry: THREE.BufferGeometry) {
    this.geometry = this.createGeometry(amount, baseGeometry)

    this.gui = MyDat.getGUI().addFolder('Squares')

    this.material = new THREE.RawShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uMaxDistance: { value: 90 },
        uMinDistance: { value: -1.7 },
        uSquareAmounts: { value: amount },
        uTime: { value: 0 },
      },
    })

    this.gui
      .add(this.material.uniforms.uMaxDistance, 'value')
      .name('uMaxDistance')
    this.gui
      .add(this.material.uniforms.uMinDistance, 'value')
      .name('uMinDistance')

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, amount)

    for (let index = 0; index < amount; index++)
      this.mesh.setMatrixAt(index, new THREE.Matrix4())
  }

  private createGeometry(amount: number, origGeometry: THREE.BufferGeometry) {
    const geometry = new THREE.InstancedBufferGeometry()

    geometry.instanceCount = amount

    Object.keys(origGeometry.attributes).forEach((attributeName) => {
      geometry.attributes[attributeName] =
        origGeometry.attributes[attributeName]
    })
    geometry.index = origGeometry.index

    const index = new Float32Array(amount)

    for (let i = 0; i < amount; i++) index[i] = i
    geometry.setAttribute(
      'aIndex',
      new THREE.InstancedBufferAttribute(index, 1, false)
    )

    return geometry
  }

  public tick(time: number, delta: number) {
    this.material.uniforms.uTime.value = time
  }
}
