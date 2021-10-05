import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import MainScene from './MainScene'
import * as THREE from 'three'
import observableState, { ObservableState } from '../../Utils/observableState'
import Visualizer from '../Visualizer'
import Audio from '../Audio'
import remap from '../../Utils/remap'

export type AppState = ObservableState<{ anim: Anims }>

export type Anims = 'rotate' | 'snapX' | 'start' | 'reset'

export default class Experiment {
  private renderer: THREE.WebGLRenderer

  private mainScene: MainScene
  private state: AppState = observableState({ anim: 'start' })

  private clock: THREE.Clock
  private visualizer: Visualizer
  private audio: Audio
  private popin: HTMLElement

  constructor(renderer: THREE.WebGLRenderer, gltf: GLTF) {
    const startOnAudio = false
    const volume = 0.4

    this.renderer = renderer
    this.mainScene = new MainScene(renderer, gltf, this.state)
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
    this.renderer.render(this.mainScene.scene, this.mainScene.camera)
  }
}
