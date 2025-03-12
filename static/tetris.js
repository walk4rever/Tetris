// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF0D72', // I piece - Red
    '#0DC2FF', // J piece - Light Blue
    '#0DFF72', // L piece - Green
    '#F538FF', // O piece - Pink
    '#FF8E0D', // S piece - Orange
    '#FFE138', // T piece - Yellow
    '#3877FF'  // Z piece - Blue
];

// Tetromino shapes
const SHAPES = [
    null,
    // I piece
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J piece
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    // L piece
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // O piece
    [
        [4, 4],
        [4, 4]
    ],
    // S piece
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    // T piece
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // Z piece
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

// Game variables
const canvas = document.getElementById('game-board');
const nextPieceCanvas = document.getElementById('next-piece-canvas');
const ctx = canvas.getContext('2d');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');

let gameBoard = createMatrix(ROWS, COLS);
let score = 0;
let level = 1;
let lines = 0;
let dropCounter = 0;
let dropInterval = 1000; // Initial drop speed (ms)
let lastTime = 0;
let gameOver = true;
let paused = false;
let player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0
};
let nextPiece = null;

// Initialize game
function init() {
    gameBoard = createMatrix(ROWS, COLS);
    player.pos = { x: Math.floor(COLS / 2) - 1, y: 0 };
    score = 0;
    level = 1;
    lines = 0;
    dropCounter = 0;
    dropInterval = 1000;
    gameOver = false;
    paused = false;
    updateScore();
    
    // Create the first piece
    if (!player.matrix) {
        player.matrix = createPiece(Math.floor(Math.random() * 7) + 1);
    }
    
    // Create the next piece
    nextPiece = createPiece(Math.floor(Math.random() * 7) + 1);
    drawNextPiece();
    
    update();
}

// Create a matrix for the game board or tetromino
function createMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix.push(new Array(cols).fill(0));
    }
    return matrix;
}

// Create a tetromino piece
function createPiece(type) {
    if (type === 0) {
        return null;
    }
    return SHAPES[type];
}

// Draw a block on the canvas
function drawBlock(x, y, color, context = ctx) {
    context.fillStyle = color;
    context.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    context.strokeStyle = '#000';
    context.strokeRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    
    // Add a shine effect
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(x + 2, y + 2, 10, 10);
}

// Draw the game board
function drawBoard() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
        ctx.stroke();
    }
    
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // Draw placed blocks
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (gameBoard[y][x] !== 0) {
                drawBlock(
                    x * BLOCK_SIZE,
                    y * BLOCK_SIZE,
                    COLORS[gameBoard[y][x]]
                );
            }
        }
    }
    
    // Draw current piece
    if (player.matrix) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(
                        (player.pos.x + x) * BLOCK_SIZE,
                        (player.pos.y + y) * BLOCK_SIZE,
                        COLORS[value]
                    );
                }
            });
        });
    }
    
    // Draw game over overlay
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
    
    // Draw paused overlay
    if (paused && !gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Draw the next piece preview
function drawNextPiece() {
    nextPieceCtx.fillStyle = '#111';
    nextPieceCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    if (nextPiece) {
        // Center the piece in the preview canvas
        const xOffset = (nextPieceCanvas.width - nextPiece[0].length * BLOCK_SIZE) / 2;
        const yOffset = (nextPieceCanvas.height - nextPiece.length * BLOCK_SIZE) / 2;
        
        nextPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(
                        xOffset + x * BLOCK_SIZE,
                        yOffset + y * BLOCK_SIZE,
                        COLORS[value],
                        nextPieceCtx
                    );
                }
            });
        });
    }
}

// Collision detection
function collide() {
    if (!player.matrix) return false;
    
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            // Check if the block exists and is not out of bounds
            if (m[y][x] !== 0 &&
               (gameBoard[y + o.y] === undefined ||
                gameBoard[y + o.y][x + o.x] === undefined ||
                gameBoard[y + o.y][x + o.x] !== 0)) {
                return true;
            }
        }
    }
    return false;
}

// Merge the player's tetromino with the game board
function merge() {
    if (!player.matrix) return;
    
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                gameBoard[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Move the player's tetromino
function playerMove(dir) {
    if (gameOver || paused) return;
    
    player.pos.x += dir;
    if (collide()) {
        player.pos.x -= dir;
    }
}

// Rotate the player's tetromino
function playerRotate() {
    if (gameOver || paused) return;
    if (!player.matrix) return;
    
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix);
    
    // Handle collision during rotation
    while (collide()) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -1);
            player.pos.x = pos;
            return;
        }
    }
}

// Rotate a matrix (tetromino)
function rotate(matrix, dir = 1) {
    const N = matrix.length;
    const result = createMatrix(N, N);
    
    if (dir > 0) { // Clockwise
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                result[x][N - 1 - y] = matrix[y][x];
            }
        }
    } else { // Counter-clockwise
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                result[N - 1 - x][y] = matrix[y][x];
            }
        }
    }
    
    // Copy the rotated matrix back to the original
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            matrix[y][x] = result[y][x];
        }
    }
}

// Drop the player's tetromino
function playerDrop() {
    if (gameOver || paused) return;
    
    player.pos.y++;
    if (collide()) {
        player.pos.y--;
        merge();
        playerReset();
        clearLines();
        updateScore();
    }
    dropCounter = 0;
}

// Hard drop - drop the tetromino all the way down
function playerHardDrop() {
    if (gameOver || paused) return;
    
    while (!collide()) {
        player.pos.y++;
        score += 1; // Small score bonus for hard drop
    }
    player.pos.y--;
    merge();
    playerReset();
    clearLines();
    updateScore();
    dropCounter = 0;
}

// Reset player position and get a new tetromino
function playerReset() {
    // Use the next piece and generate a new next piece
    player.matrix = nextPiece;
    nextPiece = createPiece(Math.floor(Math.random() * 7) + 1);
    drawNextPiece();
    
    // Reset position to the top middle
    player.pos.y = 0;
    player.pos.x = Math.floor((gameBoard[0].length - player.matrix[0].length) / 2);
    
    // Check for game over
    if (collide()) {
        gameOver = true;
        startButton.textContent = 'Play Again';
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    outer: for (let y = gameBoard.length - 1; y >= 0; y--) {
        for (let x = 0; x < gameBoard[y].length; x++) {
            if (gameBoard[y][x] === 0) {
                continue outer;
            }
        }
        
        // Remove the line and add a new empty line at the top
        const row = gameBoard.splice(y, 1)[0].fill(0);
        gameBoard.unshift(row);
        y++; // Check the same line again since we just replaced it
        linesCleared++;
    }
    
    // Update score based on lines cleared
    if (linesCleared > 0) {
        lines += linesCleared;
        
        // Calculate score based on number of lines cleared at once
        // Uses the original Nintendo scoring system
        const lineScores = [40, 100, 300, 1200]; // 1, 2, 3, 4 lines
        score += lineScores[linesCleared - 1] * level;
        
        // Level up every 10 lines
        level = Math.floor(lines / 10) + 1;
        
        // Increase drop speed with level
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    }
}

// Update score, level, and lines display
function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// Toggle pause state
function togglePause() {
    if (gameOver) return;
    paused = !paused;
    if (!paused) {
        lastTime = performance.now();
    }
}

// Game loop
function update(time = 0) {
    if (gameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    if (!paused) {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
    }
    
    drawBoard();
    requestAnimationFrame(update);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (gameOver && e.key !== ' ') return;
    
    switch (e.key) {
        case 'ArrowLeft':
            playerMove(-1);
            break;
        case 'ArrowRight':
            playerMove(1);
            break;
        case 'ArrowDown':
            playerDrop();
            break;
        case 'ArrowUp':
            playerRotate();
            break;
        case ' ': // Space
            if (gameOver) {
                init();
            } else {
                playerHardDrop();
            }
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

startButton.addEventListener('click', () => {
    if (gameOver) {
        startButton.textContent = 'Start Game';
        init();
    } else {
        togglePause();
    }
});

resetButton.addEventListener('click', () => {
    startButton.textContent = 'Start Game';
    gameOver = true;
    drawBoard();
});

// Initial draw
drawBoard();
drawNextPiece();