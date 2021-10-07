import * as THREE from '../lib/three/build/three.module.js';
import {generate as generateMaze, transformWallsIntoBlocks} from './maze.mjs';

export default function ({nRows = 30, nCols = 30, cellSize = 5, depth = 5, color = '#C32580', material} = {}) {
  const maze = generateMaze(nRows, nCols);
  const pathAndWalls = transformWallsIntoBlocks(maze);

  const theMaterial = material ?? new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 1.0,
    reflectivity: 1.0,
  });
  const geometry = new THREE.BoxGeometry(cellSize, cellSize, depth);
  const mesh = new THREE.Mesh(geometry, theMaterial);

  const group = new THREE.Group();
  for (const [row, cols] of pathAndWalls.entries()) {
    for (const [col, cell] of cols.entries()) {
      let x = col * cellSize;
      let y = row * cellSize;
      if (!cell) continue;
      // if it is a wall, draw it
      let wall = mesh.clone()
      wall.position.set(x,y,0);
      group.add(wall);
    }
  }
  const halfSize = (cellSize*pathAndWalls.length) / 2;
  group.position.set(-halfSize ,-halfSize , 0);

  return group;
}