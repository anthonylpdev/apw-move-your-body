import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import AbstractSquares from '../../AbstractSquares'
import Analyser from '../../Analyser'
import Easing from 'easing-functions'
import cremap from '../../../Utils/cremap'

export default class HeadScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  private mainCamera: THREE.PerspectiveCamera
  private correctionQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    (5 * Math.PI) / 4
  )
  private identityQuat = new THREE.Quaternion()
  private shapes: Record<string, THREE.Mesh>
  private state: Analyser['state']

  private tickingObjects: { tick: (time: number, delta: number) => void }[] = []

  constructor(
    gltf: GLTF,
    camera: THREE.PerspectiveCamera,
    state: Analyser['state']
  ) {
    this.state = state
    this.mainCamera = camera
    this.setCamera()
    this.setObjects(gltf)
  }

  private setCamera() {
    this.camera = new THREE.PerspectiveCamera(55, 1)
  }

  private setObjects(gltf: GLTF) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('black')

    // const head = gltf.scene.getObjectByName('Head') as THREE.Mesh
    // head.material = new THREE.MeshNormalMaterial({ wireframe: true })
    // head.position.set(0, 0.3, -10)

    this.shapes = {
      ['melody1']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0xff56c9 })
      ),
      ['melody2']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0xff4747 })
      ),
      ['melody3']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0xcd4ff7 })
      ),
      ['melody4']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0x6766ff })
      ),
      ['melody5']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0x66ecff })
      ),
      ['melody6']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0xbec475 })
      ),
      ['melody7']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0xd560ff })
      ),
      ['melody8']: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(5, 2),
        new THREE.MeshBasicMaterial({ color: 0xffef60 })
      ),
    }

    const shapeArray = (Object as any).values(this.shapes)

    for (let index = 0; index < shapeArray.length; index++) {
      const shape = shapeArray[index] as THREE.Mesh
      const span = 8
      const prog = (index + 0.5) / shapeArray.length
      const x = Math.cos(prog * Math.PI * 2) * 3
      const y = Math.sin(prog * Math.PI * 2) * 3
      shape.position.set(x, y, -10)
    }

    this.scene.add(this.camera, ...shapeArray)
    // this.camera.quaternion.multiply(this.correctionQuat)
  }

  public tick(time: number, delta: number) {
    // this.mainCamera.getWorldQuaternion(this.camera.quaternion)
    // this.camera.quaternion.slerp(this.identityQuat, 0)

    const keys = Object.keys(this.shapes)
    for (const key of keys) {
      const norm = cremap(this.state[key].easeVal, [0.1, 1], [0, 1])
      const bass = cremap(
        this.state.bass.current / this.state.bass.max,
        [0.6, 1],
        [0, 1]
      )
      let v = Math.max(Easing.Quintic.Out(norm), bass)
      if (bass > norm) v = v * this.state[key].easeVal * 10 + 0.5
      this.shapes[key].scale.setScalar(v * 0.2)

      // this.shapes[key].scale.setScalar(0.2)
    }

    for (const obj of this.tickingObjects) obj.tick(time, delta)
  }
}
