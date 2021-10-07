import * as THREE from '../lib/three/build/three.module.js';

export default function ({nRows = 30, nCols = 30, cellSize = 5, color = '#C32580', material} = {}) {
  const theMaterial = material ?? new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 1.0,
    reflectivity: 1.0,
  });
  const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
  const mesh = new THREE.Mesh(geometry, theMaterial);

  const group = new THREE.Group();
  for (let row = 0; row < nRows; row++) {
    for (let col = 0; col < nCols; col++) {
      let x = col * cellSize;
      let y = row * cellSize;
      let cube = mesh.clone()
      cube.position.set(x,0,y);
      group.add(cube);
    }
  }
  const halfSize = (cellSize*nRows) / 2;
  group.position.set(-halfSize , -100 , -halfSize);
  return group;
}