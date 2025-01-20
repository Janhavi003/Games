// DOM elements
const timeLeftDisplay = document.querySelector('#time-left')
const resultDisplay = document.querySelector('#result')
const scoreDisplay = document.querySelector('#score')
const livesDisplay = document.querySelector('#lives')
const startPauseButton = document.querySelector('#start-pause-button')
const squares = document.querySelectorAll('.grid div')
const logsLeft = document.querySelectorAll('.log-left')
const logsRight = document.querySelectorAll('.log-right')
const carsLeft = document.querySelectorAll('.car-left')
const carsRight = document.querySelectorAll('.car-right')

// Sound effects
const sounds = {
    jump: new Audio('jump.mp3'),
    splash: new Audio('splash.mp3'),
    crash: new Audio('crash.mp3'),
    powerUp: new Audio('powerup.mp3'),
    win: new Audio('win.mp3'),
    background: new Audio('background.mp3')
}

sounds.background.loop = true
let isSoundEnabled = true

// Game state
let currentIndex = 76
const width = 9
let timerId
let outcomeTimerId
let currentTime = 20
let score = 0
let lives = 3
let level = 1
let isInvincible = false
let hasSpeedBoost = false
let gameSpeed = 1000 // Base speed in milliseconds

// Power-up system
const powerUpTypes = ['invincibility', 'speedBoost', 'extraTime', 'extraLife']
let activePowerUps = []

function playSound(soundName) {
    if (isSoundEnabled && sounds[soundName]) {
        sounds[soundName].currentTime = 0
        sounds[soundName].play()
    }
}

function moveFrog(e) {
    squares[currentIndex].classList.remove('frog')
    
    let moveAmount = hasSpeedBoost ? 2 : 1
    
    switch(e.key) {
        case 'ArrowLeft':
            if (currentIndex % width !== 0) currentIndex -= moveAmount
            break
        case 'ArrowRight':
            if (currentIndex % width < width - moveAmount) currentIndex += moveAmount
            break
        case 'ArrowUp':
            if (currentIndex - width * moveAmount >= 0) {
                currentIndex -= width * moveAmount
                score += 10 // Points for moving forward
            }
            break
        case 'ArrowDown':
            if (currentIndex + width * moveAmount < width * width) currentIndex += width * moveAmount
            break
    }
    
    squares[currentIndex].classList.add('frog')
    playSound('jump')
    checkForPowerUp()
    scoreDisplay.textContent = score
}

function spawnPowerUp() {
    const spawnChance = 0.1 + (level * 0.02) // Increased chance with level
    if (Math.random() < spawnChance) {
        const emptySquares = Array.from(squares).filter(square => 
            !square.classList.contains('frog') && 
            !square.classList.contains('car-left') && 
            !square.classList.contains('car-right') &&
            !square.classList.contains('power-up')
        )
        
        if (emptySquares.length) {
            const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)]
            const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
            randomSquare.classList.add('power-up', powerUpType)
        }
    }
}

function checkForPowerUp() {
    const currentSquare = squares[currentIndex]
    if (currentSquare.classList.contains('power-up')) {
        const powerUpType = powerUpTypes.find(type => currentSquare.classList.contains(type))
        activatePowerUp(powerUpType)
        currentSquare.classList.remove('power-up', powerUpType)
        playSound('powerUp')
    }
}

function activatePowerUp(type) {
    const duration = 5000 // 5 seconds for temporary power-ups
    
    switch(type) {
        case 'invincibility':
            isInvincible = true
            squares[currentIndex].classList.add('invincible')
            setTimeout(() => {
                isInvincible = false
                squares[currentIndex].classList.remove('invincible')
            }, duration)
            break
            
        case 'speedBoost':
            hasSpeedBoost = true
            squares[currentIndex].classList.add('speed-boost')
            setTimeout(() => {
                hasSpeedBoost = false
                squares[currentIndex].classList.remove('speed-boost')
            }, duration)
            break
            
        case 'extraTime':
            currentTime += 10
            timeLeftDisplay.textContent = currentTime
            break
            
        case 'extraLife':
            lives++
            livesDisplay.textContent = lives
            break
    }
    
    score += 50 // Bonus points for collecting power-ups
    scoreDisplay.textContent = score
}

function autoMoveElements() {
    currentTime--
    timeLeftDisplay.textContent = currentTime
    
    // Speed increases with level
    const speedMultiplier = 1 + (level * 0.1)
    
    moveElements(logsLeft, 'left', speedMultiplier)
    moveElements(logsRight, 'right', speedMultiplier)
    moveElements(carsLeft, 'left', speedMultiplier)
    moveElements(carsRight, 'right', speedMultiplier)
    
    spawnPowerUp()
}

function moveElements(elements, direction, speedMultiplier) {
    elements.forEach(element => {
        const currentClass = Array.from(element.classList).find(className => /[lc][1-5]/.test(className))
        const currentNumber = parseInt(currentClass.charAt(1))
        let newNumber
        
        if (direction === 'left') {
            newNumber = currentNumber === 5 ? 1 : currentNumber + 1
        } else {
            newNumber = currentNumber === 1 ? 5 : currentNumber - 1
        }
        
        element.classList.remove(currentClass)
        element.classList.add(`${currentClass.charAt(0)}${newNumber}`)
    })
}

function checkOutComes() {
    if (checkLose()) {
        handleLose()
    }
    if (checkWin()) {        
        handleWin()
    }
}

function checkLose() {
    const currentSquare = squares[currentIndex]
    // Check if the frog is on a car or off the grid
    return currentSquare.classList.contains('car-left') || 
           currentSquare.classList.contains('car-right') ||
           currentSquare.classList.contains('water') ||
           currentTime <= 0
}

function handleLose() {
    if (isInvincible) return // Frog is invincible, no lose
    
    lives--
    livesDisplay.textContent = lives
    
    if (lives <= 0) {
        playSound('crash')
        resultDisplay.textContent = 'Game Over'
        clearInterval(timerId)
        clearInterval(outcomeTimerId)
    } else {
        playSound('crash')
        resetFrogPosition()
    }
}

function resetFrogPosition() {
    currentIndex = 76 // Start position
    squares[currentIndex].classList.add('frog')
}

function checkWin() {
    const currentSquare = squares[currentIndex]
    // Check if the frog reached the top
    return currentIndex < width
}

function handleWin() {
    playSound('win')
    level++
    levelDisplay.textContent = level
    resetFrogPosition()
    currentTime = 20 // Reset time
    timeLeftDisplay.textContent = currentTime
    score += 100 // Points for winning the level
    scoreDisplay.textContent = score
}

function startPauseGame() {
    if (timerId) {
        clearInterval(timerId)
        clearInterval(outcomeTimerId)
        timerId = null
        outcomeTimerId = null
        startPauseButton.textContent = 'Start'
    } else {
        timerId = setInterval(autoMoveElements, gameSpeed)
        outcomeTimerId = setInterval(checkOutComes, 50)
        startPauseButton.textContent = 'Pause'
    }
}

function initGame() {
    startPauseButton.addEventListener('click', startPauseGame)
    document.addEventListener('keydown', moveFrog)
    resetFrogPosition()
    timeLeftDisplay.textContent = currentTime
    scoreDisplay.textContent = score
    livesDisplay.textContent = lives
}

initGame()
