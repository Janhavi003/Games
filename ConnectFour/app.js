
let board = [];
let currentPlayer = 'red';
let scores = { red: 0, yellow: 0 };
let soundEnabled = true;
const ROWS = 6;
const COLS = 7;

function initGame() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.col = col;
            boardElement.appendChild(cell);
        }
    }
}

function playSound(soundId) {
    if (soundEnabled) {
        const sound = document.getElementById(soundId);
        sound.currentTime = 0;
        sound.play();
    }
}

function getLowestEmptyRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) return row;
    }
    return null;
}

function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = cells[row * COLS + col];
            cell.className = 'cell';
            if (board[row][col]) {
                cell.classList.add(board[row][col]);
            }
        }
    }
}

function checkWin(row, col) {
    const directions = [
        [0, 1],  
        [1, 0],  
        [1, 1],  
        [1, -1]  
    ];

    return directions.some(([dx, dy]) => {
        let count = 1;
        count += countDirection(row, col, dx, dy);
        count += countDirection(row, col, -dx, -dy);
        return count >= 4;
    });
}

function countDirection(row, col, dx, dy) {
    let count = 0;
    let currentRow = row + dx;
    let currentCol = col + dy;

    while (
        currentRow >= 0 && 
        currentRow < ROWS && 
        currentCol >= 0 && 
        currentCol < COLS && 
        board[currentRow][currentCol] === currentPlayer
    ) {
        count++;
        currentRow += dx;
        currentCol += dy;
    }

    return count;
}

function highlightWinningCells() {
    const cells = document.getElementsByClassName('cell');
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === currentPlayer) {
                if (isPartOfWinningLine(row, col)) {
                    cells[row * COLS + col].classList.add('winner');
                }
            }
        }
    }
}

function isPartOfWinningLine(row, col) {
    const directions = [
        [0, 1],  
        [1, 0],  
        [1, 1],  
        [1, -1]  
    ];

    return directions.some(([dx, dy]) => {
        let count = 1;
        count += countDirection(row, col, dx, dy);
        count += countDirection(row, col, -dx, -dy);
        return count >= 4;
    });
}

function checkDraw() {
    return board[0].every(cell => cell !== null);
}

function updateScores() {
    document.getElementById('score1').textContent = scores.red;
    document.getElementById('score2').textContent = scores.yellow;
}

function makeMove(col) {
    const row = getLowestEmptyRow(col);
    if (row === null) return;

    board[row][col] = currentPlayer;
    const cells = document.getElementsByClassName('cell');
    const currentCell = cells[row * COLS + col];
    currentCell.classList.add('dropping');
    playSound('dropSound');

    updateBoard();

    if (checkWin(row, col)) {
        playSound('winSound');
        scores[currentPlayer]++;
        updateScores();
        highlightWinningCells();
        setTimeout(() => {
            alert(`${currentPlayer.toUpperCase()} wins!`);
            initGame();
        }, 500);
        return;
    }

    if (checkDraw()) {
        setTimeout(() => {
            alert("It's a draw!");
            initGame();
        }, 100);
        return;
    }

    currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
}

document.addEventListener('click', (e) => {
    if (!e.target.matches('.cell')) return;
    const col = parseInt(e.target.dataset.col);
    makeMove(col);
});

document.getElementById('themeSelect').addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

document.getElementById('soundToggle').addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
});

document.getElementById('resetScores').addEventListener('click', () => {
    scores = { red: 0, yellow: 0 };
    updateScores();
});

document.getElementById('resetBtn').addEventListener('click', initGame);

window.addEventListener('DOMContentLoaded', () => {
    initGame();
    document.body.className = 'classic'; 
});