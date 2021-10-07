/**
 * I inspired myself of these 2 githubs:
 * https://github.com/kekkorider/threejs-audio-reactive-visual
 * https://github.com/a-axton/threejs-web-audio-api
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { Pane } from 'tweakpane'

import _ from 'lodash'
import './style.scss'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'


let beatCutOff = 0
let beatTime = 0
let msecsAvg = 640
let bpmTime = 0
let ratedBPMTime = 550
let bpmStart = Date.now()
let sphereColors = [{r:156,g:0,b:253},{r:0,g:255,b:249},{r:0,g:253,b:40},{r:245,g:253,b:0},{r:252,g:15,b:145}];
let activeColor = 0;

class Base {
  constructor(opts) {
    this.container = document.querySelector('#app')

    this.config = {
      backgroundColor: new THREE.Color('#0d021f'),
      cameraDistance: 14.5,
      bloomStrength: 0.68,
      bloomThreshold: 0.29,
      bloomRadius: 0.47
    }

    this.audio = document.querySelector('audio')
    this.popin = document.querySelector('#intro')

    this.audioOptions = {
      beatHoldTime: opts?.beatHoldTime || 45,
      beatDecayRate: opts?.beatDecayRate || .9,
      beatMin: opts?.beatMin || .2,
      volSens: opts?.volSens || 1,
      levelsCount: opts?.levelsCount || 16
    }

    this._resizeCb = () => this.onResize()

    this.initAudio(this.audio)
    this.createScene()
    this.createPostprocess()
    this.createMesh()
    this.createLine()
    this.createCore()
    this.createSphere()
    this.createClock()
    this.addListeners()
    this.createControls()
    this.createDebugPanel()

    this.listener()

    requestAnimationFrame(this.update.bind(this))
  }

  initAudio(audioEvent) {
    // Avoid Cross origin issue
    audioEvent.crossOrigin = 'anonymous'

    // Create an audio source node based on an audio HTML element
    this.context = new AudioContext()
    this.analyser = this.context.createAnalyser()

    this.source = this.context.createMediaElementSource(audioEvent)

    // Create and link an audio analyser
    this.source.connect(this.analyser)
    this.analyser.connect(this.context.destination)

    // FFT (Fast Fourier Transform) => Representation of the amplitude sound frequencies
    // "fftSize" Must be a power of 2 between 2^5 and 2^15, defaults to 2048.
    this.analyser.fftSize = Math.pow(2, 5)

    // TODO : Let it ?
    this.analyser.smoothingTimeConstant = 0.3;

    this.bufferLength = this.analyser.frequencyBinCount;
    this.timeByteData = new Uint8Array(this.bufferLength);
    this.freqByteData = new Uint8Array(this.bufferLength);
    this.dataArray = new Float32Array(this.analyser.fftSize);
    // frequencyBinCount : number of data values you will have to play with for the visualization (half of FFT)
    // this.bufferLength = this.analyser.frequencyBinCount

    // Initialization of an array containing all our amplitudes
    // this.dataArray = new Uint8Array(this.bufferLength)
  }

  createScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 100)
    this.camera.position.set(0, 0, this.config.cameraDistance)
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })

    this.container.appendChild(this.renderer.domElement)

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(1, window.devicePixelRatio))
    this.renderer.setClearColor(this.config.backgroundColor)
  }

  createPostprocess() {
    this.renderPass = new RenderPass(this.scene, this.camera)

    const resolution = new THREE.Vector2(this.container.clientWidth, this.container.clientHeight)

    this.bloomPass = new UnrealBloomPass(resolution, 0, 0, 0)
    this.bloomPass.threshold = this.config.bloomThreshold
    this.bloomPass.strength = this.config.bloomStrength
    this.bloomPass.radius = this.config.bloomRadius

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(this.renderPass)
    this.composer.addPass(this.bloomPass)
  }

  createMesh() {
    // const geometry = new THREE.SphereGeometry(2, 32, 16)
    const geometry = new THREE.PlaneGeometry(4, 4, 15, 15);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      // wireframe: true,
      opacity: 0.9,
      // transparent: true
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.geometry.verticesNeedUpdate = true
    this.mesh.geometry.dynamic = true

    // this.scene.add(this.mesh)
  }

  createCore() {
    const geometry = new THREE.SphereGeometry(3, 16, 32)

    const material = new THREE.ShaderMaterial( {
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.2 },
        uNoiseDensity: { value: 1.5 },
        uNoiseStrength: { value: 0.2 },
      },
    })

    this.core = new THREE.Mesh(geometry, material)
    this.scene.add(this.core)
  }

  createSphere() {
    const geometry = new THREE.OctahedronGeometry(5, 4)

    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      opacity: 0.6,
      // transparent: true
    })

    this.sphere = new THREE.Mesh(geometry, mat)
    this.scene.add(this.sphere)
  }

  createLine() {
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
    });

    const points = [];
    const length = 32;
    for (let i = 0; i < length; i++) {
      points.push( new THREE.Vector3( i - (length / 2), 0, 0 ) );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    this.line = new THREE.Line(geometry, material);
    this.scene.add(this.line);
  }

  listener() {
    document.querySelector('#click-me').addEventListener('click', (event) => {
      event.preventDefault()
      this.popin.classList.add('hide')
      setTimeout(() => {
        this.context.resume()
        this.audio.play()
      }, 1000)
    })
  }

  getNormalizedWaveForm() {
    return _.times(this.bufferLength, (i) => {
      return ((this.timeByteData[i] - 128) / 128) * this.audioOptions.volSens;
    })
  }

  getNormalizedLevels() {
    let bufferLength = this.bufferLength;
    let levelBins = Math.floor(bufferLength / this.audioOptions.levelsCount);

    return _.times(this.audioOptions.levelsCount, (i) => {
      let sum = 0;
      _.times(levelBins, (j) => {
        sum += this.freqByteData[(i * levelBins) + j];
      });

      return sum / levelBins / 256 * this.audioOptions.volSens;
    });
  }

  getAverageVolumeLevel() {
    let sum = 0
    _.times(this.audioOptions.levelsCount, (i) => {
      sum += this.levels[i]
    })

    return sum / this.audioOptions.levelsCount
  }

  getBeatTime() {
    if (this.volume > beatCutOff && this.volume > this.audioOptions.beatMin) {
      beatCutOff = this.volume * 1.1
      beatTime = 0
    } else {
      if (beatTime <= this.audioOptions.beatHoldTime) {
        beatTime++
      } else {
        beatCutOff *= this.audioOptions.beatDecayRate
        beatCutOff = Math.max(beatCutOff, this.audioOptions.beatMin)
      }
    }

    bpmTime = (Date.now() - bpmStart) / msecsAvg

    return {
      isBeat: beatTime < 6,
      beatCutOff: beatCutOff
    }
  }

  createClock() {
    this.clock = new THREE.Clock()
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
  }

  createDebugPanel() {
    this.pane = new Pane()

    /**
     * Core
     */
    const coreFolder = this.pane.addFolder({ title: 'Core options', expanded: false })

    coreFolder.addInput(this.core.material.uniforms.uSpeed, 'value', { label: 'uSpeed', min: 0, max: 3 })
    coreFolder.addInput(this.core.material.uniforms.uNoiseDensity, 'value', { label: 'uNoiseDensity', min: 0, max: 10 })
    coreFolder.addInput(this.core.material.uniforms.uNoiseStrength, 'value', { label: 'uNoiseStrength', min: 0, max: 10 })

    /**
     * PostProcessing
     */
    const bloomFolder = this.pane.addFolder({ title: 'Bloom options', expanded: false})
    bloomFolder.addInput(this.bloomPass, 'enabled', { label: 'Enabled' })
    bloomFolder.addInput(this.bloomPass, 'strength', { label: 'Strength', min: 0, max: 3 })
    bloomFolder.addInput(this.bloomPass, 'threshold', { label: 'Threshold', min: 0, max: 1 })
    bloomFolder.addInput(this.bloomPass, 'radius', { label: 'Radius', min: 0, max: 1 })
  }

  /**
   * Events
   */
  addListeners() {
    window.addEventListener('resize', this._resizeCb, { passive: true })
  }

  onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.composer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  /**
   * Update
   */
  update() {
    const elapsed = this.clock.getElapsedTime()

    this.sphere.rotation.y = elapsed * 0.1
    this.sphere.rotation.x = elapsed * 0.1

    // populates raw sound data arrays
    this.analyser.getByteFrequencyData(this.freqByteData);
    this.analyser.getByteTimeDomainData(this.timeByteData);
    this.analyser.getFloatTimeDomainData(this.dataArray);

    this.waveform = this.getNormalizedWaveForm();
    this.levels = this.getNormalizedLevels();
    this.volume = this.getAverageVolumeLevel();
    this.beat = this.getBeatTime();

    this.controls.update()

    // change sphere color every beat
    if (this.beat.isBeat) {
      let color = sphereColors[activeColor];
      this.line.material.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`);
      activeColor = activeColor < sphereColors.length - 1 ? activeColor + 1 : 0;
    }

    // change sphere size based on volume
    const amplitude = 1 + (this.volume * 0.4)
    this.sphere.scale.set(amplitude, amplitude, amplitude)

    const verticesLength = this.mesh.geometry.attributes.position.array.length / 3
    this.waveform?.forEach((value, i) => {
      const lineAmplitude = value * 10
      this.line.geometry.attributes.position.setY(i * 2 + 1, lineAmplitude)
    })

    this.line.geometry.attributes.position.needsUpdate = true;

    this.core.material.uniforms.uTime.value = elapsed
    this.core.material.uniforms.uNoiseDensity.value = 1 + this.volume * 3
    this.core.material.uniforms.uNoiseStrength.value = this.volume * 3
    this.core.material.uniforms.needsUpdate = true

    this.composer.render(this.scene, this.camera)
    requestAnimationFrame(this.update.bind(this))
  }
}

new Base()
