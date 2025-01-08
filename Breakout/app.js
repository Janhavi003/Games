const grid = document.querySelector('.grid');
const scoreDisplay = document.querySelector('#score');
const blockWidth = 100;
const blockHeight = 20;
const boardWidth = 560;
const boardHeight = 300;
const ballDiameter = 20;
let timerId;
let xDirection = -2;
let yDirection = 2;
const userStart = [230, 10];
let currentPosition = [...userStart];

const ballStart = [230, 40];
let ballCurrentPosition = [...ballStart];
let score = 0;

// Create Block class
class Block {
    constructor(xAxis, yAxis) {
        this.bottomLeft = [xAxis, yAxis];
        this.bottomRight = [xAxis + blockWidth, yAxis];
        this.topLeft = [xAxis, yAxis + blockHeight];
        this.topRight = [xAxis + blockWidth, yAxis + blockHeight];
    }
}

// All blocks
const blocks = [
    new Block(10, 270),
    new Block(120, 270),
    new Block(230, 270),
    new Block(340, 270),
    new Block(450, 270),
    new Block(10, 240),
    new Block(120, 240),
    new Block(230, 240),
    new Block(340, 240),
    new Block(450, 240),
    new Block(10, 210),
    new Block(120, 210),
    new Block(230, 210),
    new Block(340, 210),
    new Block(450, 210),
];

// Draw blocks
function addBlocks() {
    blocks.forEach(block => {
        const blockElement = document.createElement('div');
        blockElement.classList.add('block');
        blockElement.style.left = `${block.bottomLeft[0]}px`;
        blockElement.style.bottom = `${block.bottomLeft[1]}px`;
        grid.appendChild(blockElement);
    });
}
addBlocks();

// Add user
const user = document.createElement('div');
user.classList.add('user');
grid.appendChild(user);

// Draw user
function drawUser() {
    user.style.left = `${currentPosition[0]}px`;
    user.style.bottom = `${currentPosition[1]}px`;
}
drawUser();

// Add ball
const ball = document.createElement('div');
ball.classList.add('ball');
grid.appendChild(ball);

// Draw ball
function drawBall() {
    ball.style.left = `${ballCurrentPosition[0]}px`;
    ball.style.bottom = `${ballCurrentPosition[1]}px`;
}
drawBall();

// Move user
function moveUser(e) {
    switch (e.key) {
        case 'ArrowLeft':
            if (currentPosition[0] > 0) {
                currentPosition[0] -= 10;
                drawUser();
            }
            break;
        case 'ArrowRight':
            if (currentPosition[0] < boardWidth - blockWidth) {
                currentPosition[0] += 10;
                drawUser();
            }
            break;
    }
}
document.addEventListener('keydown', moveUser);

// Move ball
function moveBall() {
    ballCurrentPosition[0] += xDirection;
    ballCurrentPosition[1] += yDirection;
    drawBall();
    checkForCollisions();
}
timerId = setInterval(moveBall, 30);

// Check for collisions
function checkForCollisions() {
    // Block collisions
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (
            ballCurrentPosition[0] > block.bottomLeft[0] &&
            ballCurrentPosition[0] < block.bottomRight[0] &&
            ballCurrentPosition[1] + ballDiameter > block.bottomLeft[1] &&
            ballCurrentPosition[1] < block.topLeft[1]
        ) {
            const allBlocks = Array.from(document.querySelectorAll('.block'));
            allBlocks[i].remove();
            blocks.splice(i, 1);
            changeDirection();
            score++;
            scoreDisplay.textContent = score;
            
            if (blocks.length === 0){
                scoreDisplay.textContent = 'You Win!🥳';
                clearInterval(timerId);
                document.removeEventListener('keydown', moveUser);
            }
        }
    }

    // Wall collisions
    if (ballCurrentPosition[0] >= boardWidth - ballDiameter || ballCurrentPosition[0] <= 0) {
        xDirection *= -1;
    }
    if (ballCurrentPosition[1] >= boardHeight - ballDiameter) {
        yDirection *= -1;
    }

    // Paddle collision
    if (
        ballCurrentPosition[0] > currentPosition[0] &&
        ballCurrentPosition[0] < currentPosition[0] + blockWidth &&
        ballCurrentPosition[1] <= currentPosition[1] + blockHeight &&
        ballCurrentPosition[1] > currentPosition[1]
    ) {
        yDirection *= -1;
    }

    // Game over
    if (ballCurrentPosition[1] <= 0) {
        clearInterval(timerId);
        scoreDisplay.textContent = 'You Lose! 😢';
        document.removeEventListener('keydown', moveUser);
    }
}

// Change ball direction
function changeDirection() {
    if (xDirection === 2 && yDirection === 2) {
        xDirection = -2;
        return;
    }
    if (xDirection === -2 && yDirection === 2) {
        yDirection = -2;
        return;
    }
    if (xDirection === -2 && yDirection === -2) {
        xDirection = 2;
        return;
    }
    if (xDirection === 2 && yDirection === -2) {
        yDirection = 2;
        return;
    }
}
