let board = [];
let currentPlayer = 'red';
let scores = { red: 0, yellow: 0 };
let soundEnabled = true;
let turnTimer;
let winningCells = []; 
const ROWS = 6;
const COLS = 7;
const TURN_TIME = 10000; 

function initGame() {
    clearTimeout(turnTimer);
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    winningCells = []; 

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.col = col;
            boardElement.appendChild(cell);
        }
    }

    resetTurnTimer();
}

function resetTurnTimer() {
    clearTimeout(turnTimer);
    const timerElement = document.getElementById('turnTimer');
    timerElement.style.width = '100%';

    turnTimer = setInterval(() => {
        const width = parseFloat(timerElement.style.width);
        if (width <= 0) {
            clearTimeout(turnTimer);
            switchTurn();
        } else {
            timerElement.style.width = `${width - 10}%`;
        }
    }, TURN_TIME / 10);
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

function makeMove(col) {
    const row = getLowestEmptyRow(col);
    if (row === null) return;

    board[row][col] = currentPlayer;
    updateBoard();
    playSound('dropSound');

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

    switchTurn();
}

function switchTurn() {
    currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
    if (currentPlayer === 'yellow' && document.getElementById('aiToggle').checked) {
        setTimeout(aiMove, 500); 
    } else {
        resetTurnTimer();
    }
}

function aiMove() {
    let move = null;

    for (let col = 0; col < COLS; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== null) {
            board[row][col] = 'yellow';
            if (checkWin(row, col)) {
                move = col;
            }
            board[row][col] = null; 
            if (move !== null) break;
        }
    }

    if (move === null) {
        for (let col = 0; col < COLS; col++) {
            const row = getLowestEmptyRow(col);
            if (row !== null) {
                board[row][col] = 'red'; 
                if (checkWin(row, col)) {
                    move = col; 
                }
                board[row][col] = null; 
                if (move !== null) break;
            }
        }
    }


    if (move === null) {
        const availableCols = [...Array(COLS).keys()].filter(
            col => getLowestEmptyRow(col) !== null
        );
        move = availableCols[Math.floor(Math.random() * availableCols.length)];
    }

    makeMove(move);
}

function checkWin(row, col) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    return directions.some(([dx, dy]) => {
        let count = 1;
        winningCells = [[row, col]]; 

        count += countDirection(row, col, dx, dy, true);

        count += countDirection(row, col, -dx, -dy, true);
        
        if (count >= 4) {
            return true;
        }
        winningCells = []; 
        return false;
    });
}

function countDirection(row, col, dx, dy, trackCells = false) {
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
        if (trackCells) {
            winningCells.push([currentRow, currentCol]);
        }
        currentRow += dx;
        currentCol += dy;
    }

    return count;
}

function highlightWinningCells() {
    const cells = document.getElementsByClassName('cell');
    winningCells.forEach(([row, col]) => {
        const cell = cells[row * COLS + col];
        cell.classList.add('winner');
    });
}

function checkDraw() {
    return board[0].every(cell => cell !== null);
}

function updateScores() {
    document.getElementById('score1').textContent = scores.red;
    document.getElementById('score2').textContent = scores.yellow;
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

document.addEventListener('click', (e) => {
    if (!e.target.matches('.cell')) return;
    const col = parseInt(e.target.dataset.col);
    if (currentPlayer === 'red' || !document.getElementById('aiToggle').checked) {
        makeMove(col);
    }
});

document.getElementById('themeSelect').addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

document.getElementById('resetScores').addEventListener('click', () => {
    scores = { red: 0, yellow: 0 };
    updateScores();
});

document.getElementById('resetBtn').addEventListener('click', initGame);

document.getElementById('soundToggle').addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
});

window.addEventListener('DOMContentLoaded', () => {
    initGame();
    document.body.className = 'classic';
});