document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreElement = document.querySelector('#score');
    const livesElement = document.querySelector('#lives');
    const startButton = document.querySelector('#start-button');

    const GAME_CONFIG = {
        width: 15,
        cellCount: 225, 
        laserSpeed: 100,
        maxActiveLasers: 3,
        invaderSpeed: 500,
        powerUpDuration: 5000,
        powerUpChance: 0.1,
    };

    let currentShooterIndex = 217;
    let direction = 1;
    let invadersId;
    let goingRight = true;
    let aliensRemoved = [];
    let activeLasers = [];
    let score = 0;
    let lives = 3;
    let gameActive = false;
    let alienInvaders = [];

    // Create grid cells
    function createGrid() {
        grid.innerHTML = ''; 
        for (let i = 0; i < GAME_CONFIG.cellCount; i++) {
            const cell = document.createElement('div');
            grid.appendChild(cell);
        }
        cells = Array.from(grid.querySelectorAll('div'));
    }

    let cells; 

    // Set up alien positions
    function setupAliens() {
        alienInvaders = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        ];
    }

    // Draw aliens and shooter
    function draw() {
        cells.forEach(cell => cell.classList.remove('invader', 'shooter', 'laser', 'boom', 'power-up'));

        alienInvaders.forEach(index => {
            if (cells[index]) {
                cells[index].classList.add('invader');
            }
        });
        if (cells[currentShooterIndex]) {
            cells[currentShooterIndex].classList.add('shooter');
        }
    }

    // Move shooter
    function moveShooter(e) {
        if (!gameActive) return;

        const currentShooter = cells[currentShooterIndex];
        if (currentShooter) {
            currentShooter.classList.remove('shooter'); 
        }

        switch (e.key) {
            case 'ArrowLeft':
                if (currentShooterIndex % GAME_CONFIG.width !== 0) currentShooterIndex--;
                break;
            case 'ArrowRight':
                if (currentShooterIndex % GAME_CONFIG.width < GAME_CONFIG.width - 1) currentShooterIndex++;
                break;
        }

        if (currentShooterIndex >= 0 && currentShooterIndex < cells.length) {
            cells[currentShooterIndex].classList.add('shooter');
        }
    }

    // Shoot lasers
    function shootLaser(e) {
        if (!gameActive || e.key !== 'ArrowUp' || activeLasers.length >= GAME_CONFIG.maxActiveLasers) return;

        const newLaser = { position: currentShooterIndex, id: null };

        function moveLaser() {
            if (newLaser.position < 0 || newLaser.position >= cells.length) {
                clearInterval(newLaser.id);
                activeLasers = activeLasers.filter(laser => laser.id !== newLaser.id);
                return;
            }

            cells[newLaser.position].classList.remove('laser'); 
            newLaser.position -= GAME_CONFIG.width; 

            if (newLaser.position < 0) {
                clearInterval(newLaser.id);
                activeLasers = activeLasers.filter(laser => laser.id !== newLaser.id);
                return;
            }

            if (handleLaserCollision(newLaser)) {
                clearInterval(newLaser.id);
                activeLasers = activeLasers.filter(laser => laser.id !== newLaser.id);
                return;
            }

            if (newLaser.position >= 0 && newLaser.position < cells.length) {
                cells[newLaser.position].classList.add('laser');
            }
        }

        newLaser.id = setInterval(moveLaser, GAME_CONFIG.laserSpeed);
        activeLasers.push(newLaser);
    }

    // Handle laser collisions
    function handleLaserCollision(laser) {
        const cell = cells[laser.position];
        if (cell.classList.contains('invader')) {
            cell.classList.remove('invader', 'laser');
            cell.classList.add('boom');
            const alienIndex = alienInvaders.indexOf(laser.position);
            if (alienIndex !== -1) {
                aliensRemoved.push(alienIndex);
                score += 10;
                scoreElement.textContent = score;
            }

            setTimeout(() => {
                cell.classList.remove('boom');
            }, 300);
            return true;
        }
        return false;
    }

    // Move invaders
    function moveInvaders() {
        const leftEdge = alienInvaders[0] % GAME_CONFIG.width === 0;
        const rightEdge = alienInvaders[alienInvaders.length - 1] % GAME_CONFIG.width === GAME_CONFIG.width - 1;

        if (rightEdge && goingRight) {
            alienInvaders = alienInvaders.map(invader => invader + GAME_CONFIG.width + 1);
            goingRight = false;
            direction = -1;
        }

        if (leftEdge && !goingRight) {
            alienInvaders = alienInvaders.map(invader => invader + GAME_CONFIG.width - 1);
            goingRight = true;
            direction = 1;
        }

        alienInvaders = alienInvaders.map(invader => invader + direction);
        draw();

        if (alienInvaders.some(index => index < cells.length && cells[index].classList.contains('shooter'))) {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) gameOver();
        }

        if (alienInvaders.some(index => index >= GAME_CONFIG.cellCount - GAME_CONFIG.width && index < cells.length)) {
            gameOver();
        }
    }

    // Game over logic
    function gameOver() {
        clearInterval(invadersId);
        gameActive = false;
        alert('Game Over!');
        startButton.disabled = false;
    }

    // Start game
    function startGame() {
        createGrid();
        setupAliens();
        draw();
        gameActive = true;
        score = 0;
        lives = 3;
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        startButton.disabled = true;
        invadersId = setInterval(moveInvaders, GAME_CONFIG.invaderSpeed);
    }
    startButton.addEventListener('click', startGame);
    document.addEventListener('keydown', (e) => {
        moveShooter(e);
        shootLaser(e);
    });
});
