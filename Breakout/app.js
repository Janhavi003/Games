const grid = document.querySelector('.grid');
const scoreDisplay = document.querySelector('#score');
const blockWidth = 100;
const blockHeight = 20;
const boardWidth = 560;
const boardHeight = 300;
const ballDiameter = 20;
let timerId;
let score = 0;
let level = 1;
let lives = 3;

// Sound effects
const hitSound = new Audio('hit.mp3');
const powerUpSound = new Audio('powerup.mp3');
const winSound = new Audio('win.mp3');

// Ball class
class Ball {
    constructor(startPosition) {
        this.position = [...startPosition];
        this.xDirection = -2;
        this.yDirection = 2;
        this.element = document.createElement('div');
        this.element.classList.add('ball');
        grid.appendChild(this.element);
    }

    draw() {
        this.element.style.left = `${this.position[0]}px`;
        this.element.style.bottom = `${this.position[1]}px`;
    }

    move() {
        this.position[0] += this.xDirection;
        this.position[1] += this.yDirection;
        this.draw();
    }

    remove() {
        this.element.remove();
    }
}

// PowerUp class
class PowerUp {
    constructor(position, type) {
        this.position = [...position];
        this.type = type;
        this.element = document.createElement('div');
        this.element.classList.add('power-up', type);
        this.element.style.left = `${position[0]}px`;
        this.element.style.bottom = `${position[1]}px`;
        grid.appendChild(this.element);
    }

    move() {
        this.position[1] -= 2;
        this.element.style.bottom = `${this.position[1]}px`;
    }

    remove() {
        this.element.remove();
    }
}

// Block class
class Block {
    constructor(xAxis, yAxis) {
        this.bottomLeft = [xAxis, yAxis];
        this.bottomRight = [xAxis + blockWidth, yAxis];
        this.topLeft = [xAxis, yAxis + blockHeight];
        this.topRight = [xAxis + blockWidth, yAxis + blockHeight];
        this.hasPowerUp = Math.random() < 0.3; // 30% chance of power-up
    }
}

// Game state
let balls = [];
let powerUps = [];
const userStart = [230, 10];
let currentPosition = [...userStart];
const ballStart = [270, 40];
let blocks = [];
let powerUpActive = false;

// Initialize blocks for current level
function initializeBlocks() {
    const rows = 3 + Math.min(level - 1, 2); 
    blocks = [];
    
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < 5; i++) {
            blocks.push(new Block(10 + i * 110, 270 - j * 30));
        }
    }
}

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

// Add user paddle
const user = document.createElement('div');
user.classList.add('user');
grid.appendChild(user);

// Draw user
function drawUser() {
    user.style.left = `${currentPosition[0]}px`;
    user.style.bottom = `${currentPosition[1]}px`;
}

// Power-up effects
function activatePowerUp(type) {
    powerUpSound.play();
    switch(type) {
        case 'wide':
            user.style.width = '150px';
            setTimeout(() => user.style.width = '100px', 10000);
            break;
        case 'multiball':
            const newBall = new Ball([
                balls[0].position[0],
                balls[0].position[1]
            ]);
            newBall.xDirection = -balls[0].xDirection;
            balls.push(newBall);
            break;
        case 'slow':
            clearInterval(timerId);
            timerId = setInterval(moveGame, 40);
            setTimeout(() => {
                clearInterval(timerId);
                timerId = setInterval(moveGame, 30);
            }, 10000);
            break;
    }
}

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

// Check for collisions
function checkCollisions(ball) {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (
            ball.position[0] > block.bottomLeft[0] &&
            ball.position[0] < block.bottomRight[0] &&
            ball.position[1] + ballDiameter > block.bottomLeft[1] &&
            ball.position[1] < block.topLeft[1]
        ) {
            const allBlocks = Array.from(document.querySelectorAll('.block'));
            allBlocks[i].remove();
            
            if (block.hasPowerUp) {
                const powerUpTypes = ['wide', 'multiball', 'slow'];
                const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                powerUps.push(new PowerUp(block.bottomLeft, type));
            }
            
            blocks.splice(i, 1);
            ball.yDirection *= -1;
            hitSound.play();
            score++;
            scoreDisplay.textContent = score;
            
            if (blocks.length === 0) {
                winSound.play();
                level++;
                initializeBlocks();
                addBlocks();
                balls.forEach(ball => {
                    ball.xDirection *= 1.1;
                    ball.yDirection *= 1.1;
                });
            }
        }
    }

    // Wall collisions
    if (ball.position[0] >= boardWidth - ballDiameter || ball.position[0] <= 0) {
        ball.xDirection *= -1;
        hitSound.play();
    }
    if (ball.position[1] >= boardHeight - ballDiameter) {
        ball.yDirection *= -1;
        hitSound.play();
    }

    // Paddle collision
    if (
        ball.position[0] > currentPosition[0] &&
        ball.position[0] < currentPosition[0] + blockWidth &&
        ball.position[1] <= currentPosition[1] + blockHeight &&
        ball.position[1] > currentPosition[1]
    ) {
        ball.yDirection *= -1;
        hitSound.play();
    }

    // Ball lost
    if (ball.position[1] <= 0) {
        return true;
    }
    return false;
}

// Move game elements
function moveGame() {
    for (let i = balls.length - 1; i >= 0; i--) {
        balls[i].move();
        if (checkCollisions(balls[i])) {
            balls[i].remove();
            balls.splice(i, 1);
            
            if (balls.length === 0) {
                lives--;
                if (lives <= 0) {
                    endGame(false);
                } else {
                    balls.push(new Ball(ballStart));
                }
            }
        }
    }
    
    // Move and check power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].move();
        if (
            powerUps[i].position[0] > currentPosition[0] &&
            powerUps[i].position[0] < currentPosition[0] + blockWidth &&
            powerUps[i].position[1] <= currentPosition[1] + blockHeight &&
            powerUps[i].position[1] > currentPosition[1]
        ) {
            activatePowerUp(powerUps[i].type);
            powerUps[i].remove();
            powerUps.splice(i, 1);
        } else if (powerUps[i].position[1] < 0) {
            powerUps[i].remove();
            powerUps.splice(i, 1);
        }
    }
}

function endGame(won) {
    clearInterval(timerId);
    scoreDisplay.textContent = won ? `You Win! Level ${level} 🥳` : 'Game Over! 😢';
    document.removeEventListener('keydown', moveUser);
}

// Initialize game
function startGame() {
    initializeBlocks();
    addBlocks();
    drawUser();
    balls = [new Ball(ballStart)];
    document.addEventListener('keydown', moveUser);
    timerId = setInterval(moveGame, 30);
}

startGame();