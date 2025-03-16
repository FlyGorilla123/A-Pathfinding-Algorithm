// Declare initial constants

const cols = 30, rows = 30; // Coloumns and Rows
const grid = [];            // Grid is empty array
const canvas = document.getElementById('canvas'); // Get the HTML id 'canvas'
const ctx = canvas.getContext('2d');
const cellW = canvas.width / cols;  // width of single cell =  width of canvas / coloumns ==> 600 / 30 = 20px 
const cellH = canvas.height / rows; // height of single cell = height of canvas / rows    ==> 600 / 30 = 20px

// Constructor cell for grid based pathfinding
function Cell(i, j) {       // assigns grid-coordinates to (i, j), initialises properties (f, g, h)
    this.i = i;     
    this.j = j;     
    this.f = 0;             // f = g + h
    this.g = 0;             // g is the movement cost from the start
    this.h = 0;             // h is heuristic estimate to the goal
    this.neighbours = [];    // Array to store adjacent cells
    this.previous = undefined;  // A pointer to previous cell for backtracking 
    this.wall = Math.random() < 0.3; // < 30% obstacle probability
}

// New cell instances are linked to .prototype allowing them to access methods likes .show
Cell.prototype.show = function(color) {        // .show is the function(color) // all new cell instances have access to this method
    ctx.fillStyle = color; 
    ctx.fillRect(this.i * cellW, this.j * cellH, cellW - 1, cellH - 1); 
};

// removeFromArray function -- two parameters (array, element)
function removeFromArray(arr, elt) {
    for (let i = arr.length - 1; i >= 0; i--) {     // Iterates backward through the array checking every element.
        if (arr[i] === elt) arr.splice(i, 1);        // If array element strictly matches the target element splice removes exactly 1 element (i, 1) from array
    }
}

// Calculates the manhattan distance by summing the absolute differences of grid coordinates i, j and points a, b
function heuristic(a, b) {
    return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}

// Creation of grids and cells
for (let i = 0; i < cols; i++) {           // Iterates through each coloumn i & row j
    grid[i] = [];                          // Creates a grid and initalizes every [i] with an empty sub-array
      for (let j = 0; j < rows; j++) {     // For each j, grid[i][j] is assigned a new Cell(i, j) which contain the coordinates i, j
          grid[i][j] = new Cell(i, j); // 
      }
}

// Add neighbour cells.                     // .push(grid[i + 1][j]) appends 1 new neighbour to the array 
for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
        let cell = grid[i][j];              // cell variable assigned the grid[i][j]

        // Adds neighbours if they exit ()
        if (i < cols - 1) cell.neighbours.push(grid[i + 1][j]);     // right neighbour // i + 1 IF i is NOT at the last column
        if (i > 0) cell.neighbours.push(grid[i - 1][j]);            // left neighbour //  i - 1 IF i is NOT as the first column
        if (j < rows - 1) cell.neighbours.push(grid[i][j + 1]);     // down neighbour //  j + 1 IF j is NOT at the last row
        if (j > 0) cell.neighbours.push(grid[i][j - 1]);            // up neighbour //    j - 1 IF j is NOT at the first row
    }
}

// Define start and end cells
let start = grid[0][0];
let end = grid[cols - 1][rows - 1];
start.wall = false;
end.wall = false;

let openSet = [start];
let closedSet = [];
let current;
let path = [];

function draw() {
  if (openSet.length > 0) { 
    // selects the cells with the lowest f value
    let lowestIndex = 0;    // start by assuming the first element is the lowest
    for(let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) lowestIndex = i; // checks openSet[i].f is < openSet[lowestIndex].f if true then lowestIndex is updated with new smallest value i 
    }
    current = openSet[lowestIndex];     // current is end cell

    // If the is reached, path is built and halted
    if (current === end) {
        path = [];
        let temp = current;     // temp variable is to trace back the path
        while (temp) {              // loop responsible for iterating a backtrack from end to start
            path.push(temp);        // append the temp cell to the empty path array
            temp = temp.previous;   // temp moves to the previous cell
        }
        clearInterval(interval);
        console.log("Path Found");
    }

    removeFromArray(openSet, current); // function removes current from openSet
    closedSet.push(current);           // current is moved into closedSet. cells won't be checked again once in closedSet

    // Check all neighbours adjacent to current 
    current.neighbours.forEach(neighbour => {
      if (!closedSet.includes(neighbour) && !neighbour.wall) {    // if neighbour is NOT included in closedSet AND neighbour is NOT a wall then process
          let tempG = current.g + 1;          // assumes each step costs 1                    
          let newPath = false;
          if (openSet.includes(neighbour)) {   // check if neighbour is included in openSet   
              if (tempG < neighbour.g) {       // if new path neighbour.g is better than tempG
                  neighbour.g = tempG;         // if yes, update the neighbour.g
                  newPath = true;              // And mark newPath = true
              }
          } else {
              neighbour.g = tempG;
              newPath = true;
              openSet.push(neighbour);         // if neighbour is NOT in openSet then add to array
          }
          if ( newPath) {                      // recalculate f = g + h (heuristic)
              neighbour.h = heuristic(neighbour, end);    // estimation distance to end goal
              neighbour.f = neighbour.g + neighbour.h;
              neighbour.previous = current;
          }
      }
    });
  } else {
    clearInterval(interval);
    console.log("No solution");
    return;
  }

  // Grid Drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < cols; i++){
    for (let j = 0; j < rows; j++) {
        grid[i][j].show(grid[i][j].wall ? "#000" : "#fff");
    }
  }

  // Draw open set in green, closed set in red
  openSet.forEach(n => n.show("#0f0"));
  closedSet.forEach(n => n.show("#f00"));

  // Path is built and drawn in blue
  path = [];
  let temp = current;
  while (temp) {
    path.push(temp);
    temp = temp.previous;
  }
  path.forEach(n => n.show("#00f"));
}

let interval = setInterval(draw, 50);
