const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scale = 32;

ctx.scale(scale, scale);

const tetrominoes = [
  [[1, 1, 1],
   [0, 1, 0]],
  
  [[0, 2, 2],
   [2, 2, 0]],
  
  [[3, 3, 0],
   [0, 3, 3]],
  
  [[1, 1],
   [1, 1]],
  
  [[4, 0, 0],
   [4, 4, 4]],
  
  [[0, 0, 5],
   [5, 5, 5]],
  
  [[6, 6, 6, 6]]
];

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;

function updateScore() {
  document.getElementById('score').innerText = `Score: ${score}`;
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    // Increase score
    score += 10;
    updateScore();
  }
}


function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.05;
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    resetPlayer();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate() {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -1);
      player.pos.x = pos;
      return;
    }
  }
}

function resetPlayer() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
}

function rotate(matrix, dir = 1) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  lastTime = time;
  draw();
  requestAnimationFrame(update);
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0]
    ];
  } else if (type === 'Z') {
    return [
      [2, 2, 0],
      [0, 2, 2],
      [0, 0, 0]
    ];
  } else if (type === 'S') {
    return [
      [0, 3, 3],
      [3, 3, 0],
      [0, 0, 0]
    ];
  } else if (type === 'O') {
    return [
      [4, 4],
      [4, 4]
    ];
  } else if (type === 'I') {
    return [
      [0, 0, 0, 0],
      [5, 5, 5, 5],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
  } else if (type === 'L') {
    return [
      [0, 6, 0],
      [0, 6, 0],
      [0, 6, 6]
    ];
  } else if (type === 'J') {
    return [
      [0, 7, 0],
      [0, 7, 0],
      [7, 7, 0]
    ];
  }
}


const arena = createMatrix(10, 20);
const player = {
  pos: {x: 0, y: 0},
  matrix: null
};

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp') {
    playerRotate();
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
 
  } else if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  }
});

resetPlayer();
update();
