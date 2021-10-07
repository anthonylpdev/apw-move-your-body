import * as THREE from '../lib/three/build/three.module.js';
import {generate3d as generateMaze3d, transformWallsIntoBlocks3d} from './maze.mjs';

export default function ({nRows = 5, nCols = 5, nDepths = 5, cellSize = 5, color = '#C32580', material} = {}) {
  const maze = generateMaze3d(nRows, nCols, nDepths);
  const pathAndWalls = transformWallsIntoBlocks3d(maze);

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
  for (const [row, cols] of pathAndWalls.entries()) {
     if (row==0 || row==pathAndWalls.length-1) continue;
    for (const [col, depths] of cols.entries()) {
      if (col==0 || col==cols.length-1) continue;
      for (const [depth, cell] of depths.entries()) {
        if (depth==0 || depth==depths.length-1) continue;
        if (row!=1 && row!=pathAndWalls.length-2
            && col!=1 && col!=cols.length-2
            && depth!=1 && depth!=depths.length-2
            ) continue;
        let x = col * cellSize;
        let y = row * cellSize;
        let z = depth * cellSize;
        if (!cell.wall) continue;
        // if it is a wall, draw it
        let wall = mesh.clone();
        wall.position.set(x,y,z);
        group.add(wall);
      }
    }
  }
  const halfSize = (cellSize*pathAndWalls.length) / 2;
  group.position.set(-halfSize , -halfSize , -halfSize);
  return group;
}