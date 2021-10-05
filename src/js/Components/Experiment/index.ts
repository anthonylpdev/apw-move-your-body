import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import MainScene from './MainScene'
import * as THREE from 'three'
import observableState, { ObservableState } from '../../Utils/observableState'
import Visualizer from '../Visualizer'
import Audio from '../Audio'
import remap from '../../Utils/remap'
import ScreenScene from './ScreenScene'
import { WebGLMultisampleRenderTarget } from 'three'

export type AppState = ObservableState<{ anim: Anims }>

export type Anims = 'rotate' | 'snapX' | 'start' | 'reset'

export default class Experiment {
  private renderer: THREE.WebGLRenderer

  private mainScene: MainScene
  private screenScene: ScreenScene
  private state: AppState = observableState({ anim: 'start' })

  private clock: THREE.Clock
  private visualizer: Visualizer
  private audio: Audio
  private popin: HTMLElement
  private renderTarget: WebGLMultisampleRenderTarget

  constructor(renderer: THREE.WebGLRenderer, gltf: GLTF) {
    const startOnAudio = false
    const volume = 0.4

    this.renderTarget = new THREE.WebGLMultisampleRenderTarget(500, 500)
    this.renderer = renderer
    this.screenScene = new ScreenScene(gltf)
    this.mainScene = new MainScene(
      renderer,
      gltf,
      this.renderTarget,
      this.state
    )
    this.clock = new THREE.Clock(true)
    this.audio = new Audio(volume)
    this.visualizer = new Visualizer(this.audio.dataArray, startOnAudio)
    if (startOnAudio) this.audio.play()
    this.popin = document.querySelector('#intro')

    document.querySelector('#click-me').addEventListener('click', (event) => {
      event.preventDefault()
      this.popin.classList.add('hide')
      // setTimeout(() => {
      //   this.audio.play()
      // }, 1000)
    })

    document.addEventListener('keypress', (e) => {
      if (e.key === ' ') this.audio.toggle()
      if (/^\d$/.test(e.key))
        this.audio.setAtProg(remap(Number(e.key), [0, 10], [0, 1]))
    })
  }

  public tick() {
    const deltaTime = this.clock.getElapsedTime()
    const elapsedTime = this.clock.elapsedTime
    this.audio.update()
    this.visualizer.renderFrame()
    this.mainScene.tick(elapsedTime, deltaTime)
    this.screenScene.tick(elapsedTime, deltaTime)

    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.setSize(this.renderTarget.width, this.renderTarget.height)
    this.renderer.render(this.screenScene.scene, this.screenScene.camera)

    this.renderer.setRenderTarget(null)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.render(this.mainScene.scene, this.mainScene.camera)
  }
}
