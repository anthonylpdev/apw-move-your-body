export function generate(nRows = 100, nCols = 100) {
  const maze = Array.from({length: nRows}, () => {
    return Array.from({length: nCols}, () => {
      return {doors: []};
    })
  });

  const isValidPos = (row, col) => row >= 0 && row < nRows && col >= 0 && col < nCols;
  const isNotIn = (row, col) => isValidPos(row, col) && maze[row][col].doors.length == 0;

  // build the maze
  const backtrack = [];
  let row = 0;
  let col = 0;
  while (true) {
    const directions = [];
    // If destination is not allready accessible, put it to the aviable directions
    // 0 for noth, 1 for east, 2 for south and 3 for west.
    if (isNotIn(row - 1, col)) directions.push(0);
    if (isNotIn(row, col + 1)) directions.push(1);
    if (isNotIn(row + 1, col)) directions.push(2);
    if (isNotIn(row, col - 1)) directions.push(3);
    if (directions.length == 0) {
      // If nothing to backtrack, the maze is complete
      if (backtrack.length == 0) break;
      // Otherwise we backtrack
      [row, col] = backtrack.pop();
      continue;
    }
    // Save the current pos for backtracking
    backtrack.push([row, col]);
    // Randomly choose a direction
    const direction = directions[Math.floor(Math.random() * directions.length)];
    // Mark the door in this direction as open
    maze[row][col].doors[direction] = 1;
    // Go through the door and open the door from the other side ^_^
    row += (direction - 1) % 2;
    col -= (direction - 2) % 2;
    // Mark the door in the oposite direction as open (one door has two sides ^_^)
    maze[row][col].doors[(direction + 2) % 4] = 1;
  }
  return maze;
}

export function generate3d(nRows = 10, nCols = 10, nDepths = 10) {
  const maze = Array.from({length: nRows}, () => {
    return Array.from({length: nCols}, () => {
      return Array.from({length: nDepths}, () => {
        return {doors: [], id: 0};
      })
    })
  });

  const isValidPos = (row, col, depth) => row >= 0 && row < nRows && col >= 0 && col < nCols  && depth >= 0 && depth < nDepths;
  const isNotIn = (row, col, depth) => isValidPos(row, col, depth) && maze[row][col][depth].doors.length == 0;

  // build the maze
  const backtrack = [];
  let row = 0;
  let col = 0;
  let depth = 0;
  let idPath = 1;
  while (true) {
    const directions = [];
    // If destination is not allready accessible, put it to the aviable directions
    // 0 for noth, 1 for east, 2 for south and 3 for west, 4 for up, 5 for down
    if (isNotIn(row - 1, col, depth)) directions.push(0);
    if (isNotIn(row, col + 1, depth)) directions.push(1);
    if (isNotIn(row + 1, col, depth)) directions.push(2);
    if (isNotIn(row, col - 1, depth)) directions.push(3);
    if (isNotIn(row, col, depth - 1)) directions.push(4);
    if (isNotIn(row, col, depth + 1)) directions.push(5);
    if (directions.length == 0) {
      // If nothing to backtrack, the maze is complete
      if (backtrack.length == 0) break;
      // Otherwise we backtrack
      [row, col, depth] = backtrack.pop();
      continue;
    }
    // Save the current pos for backtracking
    backtrack.push([row, col, depth]);
    // Randomly choose a direction
    const direction = directions[Math.floor(Math.random() * directions.length)];
    // Mark the door in this direction as open
    maze[row][col][depth].doors[direction] = 1;
    maze[row][col][depth].id = idPath;
    idPath++;
    // Go through the door and open the door from the other side ^_^
    if (direction < 4) {
      row += (direction - 1) % 2;
      col -= (direction - 2) % 2;
      // Mark the door in the oposite direction as open (one door has two sides ^_^)
      maze[row][col][depth].doors[(direction + 2) % 4] = 1;
    } else {
      depth += direction == 4 ? -1 : 1;
      maze[row][col][depth].doors[direction == 4 ? 5 : 4] = 1;
    }
    maze[row][col][depth].id = idPath;
    idPath++;
  }
  return maze;
}


export function transformWallsIntoBlocks(maze) {
  // Construct a new matrix with walls as the same size as path cells
  // this will double the matrix size  (+ 1)
  const pathAndWalls = [];
  // Initialize the matrix with walls everywhere
  for (let row = 0; row < maze.length * 2 + 1; row++) {
    pathAndWalls[row] = []
    for (let col = 0; col < maze[0].length * 2 + 1; col++) {
      pathAndWalls[row][col] = 1; // 1 mean wall
    }
  }
  // For each cell of the maze, "break down" the wall if a path exists
  for (const [row, cols] of maze.entries()) {
    for (const [col, cell] of cols.entries()) {
      let rowGrid = row * 2 + 1;
      let colGrid = col * 2 + 1;
      // the actual cell is not a wall !
      pathAndWalls[rowGrid][colGrid] = 0;
      // Passage carvers (0 mean no wall in this direction)
      // 0 for noth, 1 for east, 2 for south and 3 for west.
      if (cell.doors[0]) pathAndWalls[rowGrid-1][colGrid] = 0;
      if (cell.doors[1]) pathAndWalls[rowGrid][colGrid+1] = 0;
      if (cell.doors[2]) pathAndWalls[rowGrid+1][colGrid] = 0;
      if (cell.doors[3]) pathAndWalls[rowGrid][colGrid-1] = 0;
    }
  }
  return pathAndWalls;
}

export function transformWallsIntoBlocks3d(maze) {
  // Construct a new matrix with walls as the same size as path cells
  // this will double the matrix size  (+ 1)
  const pathAndWalls = Array.from({length: maze.length * 2 + 1}, () => {
    return Array.from({length: maze[0].length * 2 + 1}, () => {
      return Array.from({length: maze[0][0].length * 2 + 1}, () => {
        return {wall: 1, id: 0};
      })
    })
  });

  // For each cell of the maze, "break down" the wall if a path exists
  for (const [row, cols] of maze.entries()) {
    for (const [col, depths] of cols.entries()) {
      for (const [depth, cell] of depths.entries()) {
        let rowGrid = row * 2 + 1;
        let colGrid = col * 2 + 1;
        let depthGrid = depth * 2 + 1;
        // the actual cell is not a wall !
        pathAndWalls[rowGrid][colGrid][depthGrid].wall = 0;
        pathAndWalls[rowGrid][colGrid][depthGrid].id = cell.id;
        // Passage carvers (0 mean no wall in this direction)
        // 0 for noth, 1 for east, 2 for south and 3 for west, 4 for up and 5 for down
        if (cell.doors[0]) pathAndWalls[rowGrid-1][colGrid][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[1]) pathAndWalls[rowGrid][colGrid+1][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[2]) pathAndWalls[rowGrid+1][colGrid][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[3]) pathAndWalls[rowGrid][colGrid-1][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[4]) pathAndWalls[rowGrid][colGrid][depthGrid-1] = {wall: 0, id: cell.id};
        if (cell.doors[5]) pathAndWalls[rowGrid][colGrid][depthGrid+1] = {wall: 0, id: cell.id};
      }
    }
  }
  return pathAndWalls;
}

export function transformWallsIntoBlocks3dPathDoubled(maze) {
  // Construct a new matrix with walls as the same size as path cells
  // this will double the matrix size  (+ 1)
  const pathAndWalls = Array.from({length: maze.length * 4 + 1}, () => {
    return Array.from({length: maze[0].length * 4 + 1}, () => {
      return Array.from({length: maze[0][0].length * 4 + 1}, () => {
        return {wall: 1, id: 0};
      })
    })
  });

  // For each cell of the maze, "break down" the wall if a path exists
  for (const [row, cols] of maze.entries()) {
    for (const [col, depths] of cols.entries()) {
      for (const [depth, cell] of depths.entries()) {
        let rowGrid = row * 4 + 1;
        let colGrid = col * 4 + 1;
        let depthGrid = depth * 4 + 1;
        // the actual cell is not a wall !
        pathAndWalls[rowGrid][colGrid][depthGrid].wall = 0;
        pathAndWalls[rowGrid][colGrid][depthGrid].id = cell.id;
        // Passage carvers (0 mean no wall in this direction)
        // 0 for noth, 1 for east, 2 for south and 3 for west, 4 for up and 5 for down
        if (cell.doors[0]) pathAndWalls[rowGrid-1][colGrid][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[1]) pathAndWalls[rowGrid][colGrid+1][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[2]) pathAndWalls[rowGrid+1][colGrid][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[3]) pathAndWalls[rowGrid][colGrid-1][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[4]) pathAndWalls[rowGrid][colGrid][depthGrid-1] = {wall: 0, id: cell.id};
        if (cell.doors[5]) pathAndWalls[rowGrid][colGrid][depthGrid+1] = {wall: 0, id: cell.id};
        if (cell.doors[0]) pathAndWalls[rowGrid-2][colGrid][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[1]) pathAndWalls[rowGrid][colGrid+2][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[2]) pathAndWalls[rowGrid+2][colGrid][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[3]) pathAndWalls[rowGrid][colGrid-2][depthGrid] = {wall: 0, id: cell.id};
        if (cell.doors[4]) pathAndWalls[rowGrid][colGrid][depthGrid-2] = {wall: 0, id: cell.id};
        if (cell.doors[5]) pathAndWalls[rowGrid][colGrid][depthGrid+2] = {wall: 0, id: cell.id};
      }
    }
  }
  return pathAndWalls;
}