import * as THREE from 'three'

export default class GPGPU {
  private size: THREE.Vector2
  private renderer: THREE.WebGLRenderer
  private targetA: THREE.WebGLRenderTarget
  private targetB: THREE.WebGLRenderTarget
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private quad: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.RawShaderMaterial>
  private rendererSizeTemp: THREE.Vector2 = new THREE.Vector2()
  public outputTexture: THREE.Texture

  constructor({
    size,
    renderer,
    shader,
    initTexture,
  }: {
    size: THREE.Vector2
    renderer: THREE.WebGLRenderer
    shader: THREE.RawShaderMaterial
    initTexture: THREE.Texture
  }) {
    this.size = size
    this.renderer = renderer
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('red')

    this.camera = new THREE.OrthographicCamera(
      -this.size.x / 2,
      this.size.x / 2,
      -this.size.y / 2,
      this.size.y / 2
    )
    this.camera.position.z = 100

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(), shader)
    this.quad.scale.set(this.size.x, this.size.y, 0)
    this.quad.rotateX(Math.PI)

    this.scene.add(this.quad)

    this.targetA = new THREE.WebGLRenderTarget(this.size.x, this.size.y, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.FloatType,
      stencilBuffer: false,
    })
    this.targetB = this.targetA.clone()

    this.prerender(initTexture)
  }

  private prerender(initTexture: THREE.Texture) {
    this.setQuadTexture(initTexture)

    this.renderer.getSize(this.rendererSizeTemp)
    // this.renderer.setSize(this.size.x, this.size.y, false)

    this.renderer.setRenderTarget(this.targetA)
    this.renderer.render(this.scene, this.camera)

    this.renderer.setRenderTarget(this.targetB)
    this.renderer.render(this.scene, this.camera)
    // this.renderer.setSize(
    //   this.rendererSizeTemp.x,
    //   this.rendererSizeTemp.y,
    //   false
    // )
    this.outputTexture = this.targetB.texture
  }

  private setQuadTexture(texture: THREE.Texture) {
    this.quad.material.uniforms.uFbo.value = texture
  }

  public render() {
    ;[this.targetB, this.targetA] = [this.targetA, this.targetB] // Intervert fbos
    this.setQuadTexture(this.targetA.texture)

    this.renderer.getSize(this.rendererSizeTemp)
    // this.renderer.setSize(this.size.x, this.size.y, false)
    this.renderer.setRenderTarget(this.targetB)
    // this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)
    // pass the new positional values to the scene users see

    this.renderer.setRenderTarget(null)
    this.outputTexture = this.targetB.texture
    // this.renderer.setSize(
    //   this.rendererSizeTemp.x,
    //   this.rendererSizeTemp.y,
    //   false
    // )
  }
}
