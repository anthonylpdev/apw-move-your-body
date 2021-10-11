import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import MainScene from './MainScene'
import * as THREE from 'three'
import observableState, { ObservableState } from '../../Utils/observableState'
import Visualizer from '../Visualizer'
import Audio from '../Audio'
import remap from '../../Utils/remap'
import ScreenScene from './ScreenScene'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import MyDat from '../../Utils/MyDat'
import Analyser from '../Analyser'
import HeadScene from './HeadScene'

export default class Experiment {
  private renderer: THREE.WebGLRenderer

  private mainScene: MainScene
  private screenScene: ScreenScene

  private clock: THREE.Clock
  private visualizer: Visualizer
  private audio: Audio
  private popin: HTMLElement
  private renderTarget: THREE.WebGLMultisampleRenderTarget
  private renderTarget2: THREE.WebGLMultisampleRenderTarget
  private composer: EffectComposer
  private analyser: Analyser
  private headScene: HeadScene

  constructor(renderer: THREE.WebGLRenderer, gltf: GLTF) {
    const p = {
      enableKeys: false,
    }
    MyDat.getGUI().add(p, 'enableKeys')

    this.clock = new THREE.Clock(true)
    this.audio = new Audio(0.4)
    this.analyser = new Analyser(this.audio)
    this.visualizer = new Visualizer(this.audio, false, this.analyser.state)

    this.composer = new EffectComposer(renderer)
    this.renderTarget = new THREE.WebGLMultisampleRenderTarget(256, 256)
    this.renderTarget2 = new THREE.WebGLMultisampleRenderTarget(128, 128)
    this.renderer = renderer
    this.mainScene = new MainScene(
      renderer,
      gltf,
      this.renderTarget,
      this.renderTarget2,
      this.analyser.state
    )
    this.headScene = new HeadScene(
      gltf,
      this.mainScene.camera,
      this.analyser.state
    )
    this.screenScene = new ScreenScene(gltf, this.mainScene.camera)

    const renderPass = new RenderPass(
      this.mainScene.scene,
      this.mainScene.camera
    )
    this.composer.addPass(renderPass)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      // 0,
      1.2,
      0,
      0
    )
    const bloomPassGui = MyDat.getGUI().addFolder('Bloom')
    bloomPassGui.add(bloomPass, 'radius', 0, 1, 0.01)
    bloomPassGui.add(bloomPass, 'threshold', 0, 1, 0.01)
    bloomPassGui.add(bloomPass, 'strength', 0, 3, 0.01)
    this.composer.addPass(bloomPass)

    this.popin = document.querySelector('#intro')

    document.querySelector('#click-me').addEventListener('click', (event) => {
      event.preventDefault()
      this.popin.classList.add('hide')
      setTimeout(() => {
        this.audio.play()
      }, 1000)
    })

    document.addEventListener('keypress', (e) => {
      if (!p.enableKeys) return
      if (e.key === ' ') this.audio.toggle()
      if (/^\d$/.test(e.key))
        this.audio.setAtProg(remap(Number(e.key), [0, 10], [0, 1]))
      if (e.key === '+') this.audio.forward()
      if (e.key === '-') this.audio.back()
    })
  }

  public tick() {
    const deltaTime = this.clock.getElapsedTime()
    const elapsedTime = this.clock.elapsedTime
    this.audio.update()
    this.visualizer.renderFrame()
    this.analyser.analyse()
    this.mainScene.tick(elapsedTime, deltaTime)
    this.screenScene.tick(elapsedTime, deltaTime)
    this.headScene.tick(elapsedTime, deltaTime)

    this.renderer.setRenderTarget(this.renderTarget)
    // this.renderer.setSize(
    //   this.renderTarget.width,
    //   this.renderTarget.height,
    //   false
    // )
    this.renderer.render(this.screenScene.scene, this.screenScene.camera)

    this.renderer.setRenderTarget(this.renderTarget2)
    // this.renderer.setRenderTarget(null)
    // this.renderer.setSize(
    //   this.renderTarget2.width,
    //   this.renderTarget2.height,
    //   false
    // )
    this.renderer.render(this.headScene.scene, this.headScene.camera)

    this.renderer.setRenderTarget(null)
    // this.renderer.setSize(window.innerWidth, window.innerHeight, false)
    this.composer.render()
  }
}
