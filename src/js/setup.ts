import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Experiment from './Components/Experiment'

function debugBase64(base64URL) {
  const win = window.open()
  win.document.write(
    '<iframe src="' +
      base64URL +
      '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
  )
}

function initWebglRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#three-canvas'),
    antialias: true,
  })
  // renderer.autoClear = false
  // renderer.setClearColor(0x000000, 0.0)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.debug.checkShaderErrors = true
  return renderer
}

export default function Load() {
  return new GLTFLoader()
    .loadAsync(require('@models/chess.glb').default)
    .then(Setup)
}

function Setup(gltf: GLTF): { raf: Function; cb: Function } {
  const webGLrenderer = initWebglRenderer()
  // webGLrenderer.outputEncoding = THREE.sRGBEncoding
  // webGLrenderer.toneMapping = THREE.ACESFilmicToneMapping

  // document.body.append(webGLrenderer.domElement)

  window.addEventListener('resize', () => {
    webGLrenderer.setSize(window.innerWidth, window.innerHeight)
  })
  const expe = new Experiment(webGLrenderer, gltf)

  return {
    raf: () => {
      expe.tick()
      // debugBase64((<HTMLCanvasElement>webGLrenderer.domElement).toDataURL('image/png'))
    },
    cb: () => {},
  }
}
