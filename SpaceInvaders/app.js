document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreElement = document.querySelector('#score');
    const livesElement = document.querySelector('#lives');
    const levelElement = document.querySelector('#level');
    const startButton = document.querySelector('#start-button');
    const bossHealthDisplay = document.querySelector('#boss-health');
    const healthBar = document.querySelector('.health-bar');

    const GAME_CONFIG = {
        width: 15,
        cellCount: 225,
        laserSpeed: 100,
        maxActiveLasers: 3,
        levels: [
            { invaderSpeed: 500, bossHealth: 5 },
            { invaderSpeed: 400, bossHealth: 7 },
            { invaderSpeed: 300, bossHealth: 10 }
        ]
    };

    const ENEMY_TYPES = {
        basic: {
            points: 10,
            health: 1,
            className: 'invader'
        },
        zigzag: {
            points: 20,
            health: 2,
            className: 'invader-zigzag'
        },
        boss: {
            points: 100,
            className: 'boss-invader'
        }
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
    let currentLevel = 0;
    let alienInvaders = [];
    let bossHealth = 0;
    let bossActive = false;
    let cells;

    function createGrid() {
        grid.innerHTML = '';
        for (let i = 0; i < GAME_CONFIG.cellCount; i++) {
            const cell = document.createElement('div');
            grid.appendChild(cell);
        }
        cells = Array.from(grid.querySelectorAll('div'));
    }

    function setupAliens() {
        alienInvaders = [];
        if (!bossActive) {
           
            const basicAliens = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
                15, 16, 17, 18, 19, 20, 21, 22, 23, 24
            ];
            const zigzagAliens = [
                30, 31, 32, 33, 34, 35, 36, 37, 38, 39
            ];

            alienInvaders = basicAliens.map(index => ({
                index,
                type: 'basic',
                health: ENEMY_TYPES.basic.health
            }));

            if (currentLevel > 0) {
                alienInvaders.push(...zigzagAliens.map(index => ({
                    index,
                    type: 'zigzag',
                    health: ENEMY_TYPES.zigzag.health
                })));
            }
        } else {
            bossHealth = GAME_CONFIG.levels[currentLevel].bossHealth;
            alienInvaders = [{
                index: 7,
                type: 'boss',
                health: bossHealth
            }];
            updateBossHealthDisplay();
        }
    }

    function updateBossHealthDisplay() {
        if (bossActive) {
            bossHealthDisplay.classList.remove('hidden');
            const healthPercentage = (bossHealth / GAME_CONFIG.levels[currentLevel].bossHealth) * 100;
            healthBar.style.width = `${healthPercentage}%`;
        } else {
            bossHealthDisplay.classList.add('hidden');
        }
    }

    function moveShooter(e) {
        if (!gameActive) return;

        cells[currentShooterIndex].classList.remove('shooter');

        switch (e.key) {
            case 'ArrowLeft':
                if (currentShooterIndex % GAME_CONFIG.width !== 0) currentShooterIndex--;
                break;
            case 'ArrowRight':
                if (currentShooterIndex % GAME_CONFIG.width < GAME_CONFIG.width - 1) currentShooterIndex++;
                break;
        }

        cells[currentShooterIndex].classList.add('shooter');
    }

    function draw() {
        cells.forEach(cell => {
            cell.className = ''; 
        });

        alienInvaders.forEach(alien => {
            if (cells[alien.index]) {
                cells[alien.index].classList.add(ENEMY_TYPES[alien.type].className);
            }
        });

        if (cells[currentShooterIndex]) {
            cells[currentShooterIndex].classList.add('shooter');
        }

        activeLasers.forEach(laser => {
            if (cells[laser.position]) {
                cells[laser.position].classList.add(laser.type === 'boss' ? 'boss-laser' : 'laser');
            }
        });
    }

    function moveInvaders() {
        const leftEdge = alienInvaders.some(alien => alien.index % GAME_CONFIG.width === 0);
        const rightEdge = alienInvaders.some(alien => alien.index % GAME_CONFIG.width === GAME_CONFIG.width - 1);

        alienInvaders.forEach(alien => {
            if (alien.type === 'boss') {
                moveBoss(alien);
            } else {
                moveRegularAlien(alien, leftEdge, rightEdge);
            }
        });

        if (bossActive && Math.random() < 0.05) {
            shootBossLaser();
        }

        checkCollisions();
        draw();
    }

    function moveRegularAlien(alien, leftEdge, rightEdge) {
        if ((rightEdge && goingRight) || (leftEdge && !goingRight)) {
            alien.index += GAME_CONFIG.width;
            direction *= -1;
            goingRight = !goingRight;
        } else {
            alien.index += direction;
            if (alien.type === 'zigzag' && Math.random() < 0.2) {
                alien.index += Math.floor(Math.random() * 3) - 1;
            }
        }
    }

    function moveBoss(boss) {
        const currentX = boss.index % GAME_CONFIG.width;
        if (currentX === 0 || currentX === GAME_CONFIG.width - 1) {
            direction *= -1;
        }
        boss.index += direction;
    }

    function shootBossLaser() {
        const bossAlien = alienInvaders.find(alien => alien.type === 'boss');
        if (bossAlien) {
            const laser = {
                position: bossAlien.index + GAME_CONFIG.width,
                type: 'boss',
                id: null
            };

            function moveBossLaser() {
                if (cells[laser.position]) {
                    cells[laser.position].classList.remove('boss-laser');
                }
                laser.position += GAME_CONFIG.width;

                if (laser.position >= GAME_CONFIG.cellCount) {
                    clearInterval(laser.id);
                    return;
                }

                if (laser.position === currentShooterIndex) {
                    handlePlayerHit();
                    clearInterval(laser.id);
                    return;
                }

                if (cells[laser.position]) {
                    cells[laser.position].classList.add('boss-laser');
                }
            }

            laser.id = setInterval(moveBossLaser, GAME_CONFIG.laserSpeed);
        }
    }

    function handlePlayerHit() {
        lives--;
        livesElement.textContent = lives;
        if (lives <= 0) {
            gameOver('Game Over - You ran out of lives!');
        }
    }

    function shootLaser(e) {
        if (!gameActive || e.key !== 'ArrowUp' || activeLasers.length >= GAME_CONFIG.maxActiveLasers) return;

        const laser = {
            position: currentShooterIndex,
            type: 'player',
            id: null
        };

        function moveLaser() {
            if (cells[laser.position]) {
                cells[laser.position].classList.remove('laser');
            }
            laser.position -= GAME_CONFIG.width;

            if (laser.position < 0) {
                clearInterval(laser.id);
                activeLasers = activeLasers.filter(l => l.id !== laser.id);
                return;
            }

            const hitAlien = alienInvaders.find(alien => alien.index === laser.position);
            if (hitAlien) {
                handleAlienHit(hitAlien, laser);
                return;
            }

            if (cells[laser.position]) {
                cells[laser.position].classList.add('laser');
            }
        }

        laser.id = setInterval(moveLaser, GAME_CONFIG.laserSpeed);
        activeLasers.push(laser);
    }

    function handleAlienHit(alien, laser) {
        clearInterval(laser.id);
        activeLasers = activeLasers.filter(l => l.id !== laser.id);
        cells[laser.position].classList.remove('laser');
        
        alien.health--;
        if (alien.health <= 0) {
            cells[alien.index].classList.add('boom');
            setTimeout(() => cells[alien.index].classList.remove('boom'), 300);
            
            score += ENEMY_TYPES[alien.type].points;
            scoreElement.textContent = score;
            
            if (alien.type === 'boss') {
                bossHealth = 0;
                updateBossHealthDisplay();
                nextLevel();
            } else {
                alienInvaders = alienInvaders.filter(a => a !== alien);
                if (alienInvaders.length === 0) {
                    startBossFight();
                }
            }
        }
    }

    function startBossFight() {
        bossActive = true;
        clearInterval(invadersId);
        setupAliens();
        invadersId = setInterval(moveInvaders, GAME_CONFIG.levels[currentLevel].invaderSpeed * 0.8);
    }

    function nextLevel() {
        currentLevel++;
        if (currentLevel >= GAME_CONFIG.levels.length) {
            gameOver('Congratulations! You beat all levels!');
            return;
        }

        bossActive = false;
        levelElement.textContent = currentLevel + 1;
        clearInterval(invadersId);
        setupLevel();
    }

    function checkCollisions() {
        if (alienInvaders.some(alien => alien.index >= GAME_CONFIG.cellCount - GAME_CONFIG.width)) {
            gameOver('Game Over - Aliens reached Earth!');
        }

        if (alienInvaders.some(alien => alien.index === currentShooterIndex)) {
            handlePlayerHit();
        }
    }

    function setupLevel() {
        direction = 1;
        goingRight = true;
        activeLasers.forEach(laser => clearInterval(laser.id));
        activeLasers = [];
        setupAliens();
        draw();
        invadersId = setInterval(moveInvaders, GAME_CONFIG.levels[currentLevel].invaderSpeed);
    }

    function gameOver(message) {
        gameActive = false;
        clearInterval(invadersId);
        activeLasers.forEach(laser => clearInterval(laser.id));
        alert(message);
        startButton.disabled = false;
    }

    function startGame() {
        currentLevel = 0;
        score = 0;
        lives = 3;
        bossActive = false;
        gameActive = true;
        
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        levelElement.textContent = currentLevel + 1;
        
        startButton.disabled = true;
        createGrid();
        setupLevel();
    }

    startButton.addEventListener('click', startGame);
    document.addEventListener('keydown', (e) => {
        moveShooter(e);
        shootLaser(e);
    });
});