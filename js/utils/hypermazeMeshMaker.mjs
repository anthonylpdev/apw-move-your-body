import * as THREE from '../lib/three/build/three.module.js';
import { generate3d as generateMaze3d, transformWallsIntoBlocks3dPathDoubled } from './maze.mjs';

export default function ({nRows = 5, nCols = 5, nDepths = 5, cellSize = 5, color = '#C32580', material = null, visible = true} = {}) {
  const maze = generateMaze3d(nRows, nCols, nDepths);
  const pathAndWalls = transformWallsIntoBlocks3dPathDoubled(maze);
  const materialOptions = {
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 1.0,
    reflectivity: 1.0
  }

  const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
  const theMaterial = material ?? new THREE.MeshPhysicalMaterial(materialOptions);
  const mesh = new THREE.Mesh(geometry, theMaterial);

  const group = new THREE.Group();

  for (const [row, cols] of pathAndWalls.entries()) {
    for (const [col, depths] of cols.entries()) {
      for (const [depth, cell] of depths.entries()) {
        if (cell.wall) continue;
        // if it is a path, draw it
        const x = col * cellSize;
        const y = row * cellSize;
        const z = depth * cellSize;
        let path = mesh.clone();
        path.visible = visible;
        const position =  new THREE.Vector3(x, y, z);
        path.position.copy(position);
        path.userData = cell.id;
        group.add(path);
      }
    }
  }
  const halfSize = (cellSize * (pathAndWalls.length - 3)) / 2;
  group.position.set(-halfSize , -halfSize , -halfSize);
  return group;
}