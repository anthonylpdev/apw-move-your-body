import './style.scss'
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  LoadingManager,
  TextureLoader,
  AnimationMixer,
  Clock,
  ShaderMaterial,
  Vector2,
  Vector3,
  DoubleSide,
  PlaneBufferGeometry,
  sRGBEncoding
} from 'three'

import fbxFile from '../anim.fbx'
import baseTexture from '../texture.jpg'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'

class Base {
  constructor() {
    this.canvas = document.querySelector('#canvas')
    this.audio = document.querySelector('audio')
    this.popin = document.querySelector('#intro')

    this.loading()

    this.loadingManager.onLoad = (event) => {
      this.initAudio(this.audio)
      this.initScene()
      this.addObjects()
      this.listener()
      this.renderFrame()
    }

  }

  loading() {
    this.loadingManager = new LoadingManager()

    new FBXLoader(this.loadingManager).load(
        fbxFile,
        data => {
          this.fbx = data
        }, null,
        (err) => {
          console.log('There was an error loading ' + err)
        },
    )

    new TextureLoader(this.loadingManager).load(baseTexture, (data) => {
      this.loadedTexture = data
    })

  }

  initAudio(audioEvent) {
    // Avoid Cross origin issue
    audioEvent.crossOrigin = 'anonymous'

    // Create an audio source node based on an audio HTML element
    this.context = new AudioContext()
    this.source = this.context.createMediaElementSource(audioEvent)

    // Create and link an audio analyser
    this.analyser = this.context.createAnalyser()
    this.source.connect(this.analyser)
    this.analyser.connect(this.context.destination)

    // FFT (Fast Fourier Transform) => Representation of the amplitude sound frequencies
    // "fftSize" Must be a power of 2 between 2^5 and 2^15, defaults to 2048.
    this.analyser.fftSize = 256

    // frequencyBinCount : number of data values you will have to play with for the visualization (half of FFT)
    this.bufferLength = this.analyser.frequencyBinCount

    // Initialization of an array containing all our amplitudes
    this.dataArray = new Uint8Array(this.bufferLength)
  }

  initScene() {
    this.scene = new Scene()
    this.clock = new Clock()
    this.camera = new PerspectiveCamera(75,
        window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 5, 8)
    this.camera.rotation.reorder('YXZ')
    this.renderer = new WebGLRenderer({
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      canvas: this.canvas,
    })

    // this.renderer.physicallyCorrectLights = true
    this.renderer.outputEncoding = sRGBEncoding

    this.canvasSize()

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.minDistance = 5
    this.controls.maxDistance = 50
    this.controls.autoRotate = true
    this.controls.update()

  }

  addObjects() {
    // const geometry = new SphereGeometry(15, 32, 16)
    // const material = new MeshBasicMaterial({color: 0xffff00, wireframe: true})
    // const sphere = new Mesh(geometry, material)
    // this.scene.add(sphere)


    /*this.shaderMat = new ShaderMaterial({
      uniforms: {
        uTime: {value: 0.0},
        uApply: {value: 1.0},
        uResolution: {value: new Vector2()},
        uPosX: {value: 0.0},
        uPosY: {value: 0.0},
        uTexture: {value: this.loadedTexture},
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      side: DoubleSide,
      // blending: THREE.MultiplyBlending,
      transparent: true,
      // wireframe: true
    })*/

    let mat = new MeshBasicMaterial()
    mat.color = new Color(0, 0, 245);
    mat.wireframe = false;
    mat.color.set(0xffffff);

    mat.onBeforeCompile = ( shader ) => {
      shader.uniforms.time = {value: 0};
      shader.uniforms.size = {value: new Vector3()};
      shader.uniforms.color1 = {value: new Color(0xff0000)};
      shader.uniforms.color2 = {value: new Color(0x0000ff)};
      shader.vertexShader = 'varying vec4 vWorldPosition;\n' +
          shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          [
            '#include <worldpos_vertex>',
            'vWorldPosition = modelMatrix * vec4( transformed, 1.0 );'
          ].join('\n')
      );
      shader.fragmentShader = 'uniform float time;\nuniform vec3 size;\nuniform vec3 color1;\nuniform vec3 color2;\nvarying vec4 vWorldPosition;\n' +
          shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          [
            '#include <dithering_fragment>',
            'float gridRatio = sin( time ) * 0.1875 + 0.3125;', // 0.125 .. 0.5
            'vec3 m = abs( sin( vWorldPosition.xyz * gridRatio ) );',
            'vec3 gridColor = mix(color1, color2, vWorldPosition.y / size.y);',
            'gl_FragColor = vec4( mix( gridColor, gl_FragColor.rgb, m.x * m.y * m.z ), diffuseColor.a );',
          ].join('\n')
      );
    }

    this.fbx.traverse((child) => {
      if(child.isMesh){

        // child.castShadow = true;
        // child.receiveShadow = true;
        child.material = mat
      }
      /*if ((child as THREE.Mesh).isMesh) {
          // (child as THREE.Mesh).material = material
          if ((child as THREE.Mesh).material) {
              ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
          }
      }*/
    });
    this.fbx.scale.set(.04, .04, .04)
    this.fbx.position.set(0, -3, 0)
    this.mixer = new AnimationMixer(this.fbx);

    this.action = this.mixer.clipAction( this.fbx.animations[0] );
    this.action.play();

    this.scene.add(this.fbx);


    // const paper = new PlaneBufferGeometry(10, 10, 64, 64);
    // this.scene.add(new Mesh(paper, this.shaderMat))

  }

  canvasSize() {
    this.WIDTH = window.innerWidth
    this.HEIGHT = window.innerHeight
    this.renderer.setSize(this.WIDTH, this.HEIGHT)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.camera.aspect = this.WIDTH / this.HEIGHT
    this.camera.updateProjectionMatrix()
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
    window.addEventListener('resize', () => {
      this.canvasSize()
    })
  }

  renderFrame() {
    this.delta = this.clock.getDelta();
    // this.shaderMat.uniforms.uTime.value = this.clock.getElapsedTime()
    this.mixer.update( this.delta );
    // this.analyser.getByteFrequencyData(this.dataArray)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.renderFrame.bind(this))
  }
}

new Base()
