let cardArray = [
    { name: 'fries', img: 'images/fries.png' },
    { name: 'cheeseburger', img: 'images/cheeseburger.png' },
    { name: 'ice-cream', img: 'images/ice-cream.png' },
    { name: 'pizza', img: 'images/pizza.png' },
    { name: 'milkshake', img: 'images/milkshake.png' },
    { name: 'hotdog', img: 'images/hotdog.png' }
];

// Double the cards for pairs
cardArray = [...cardArray, ...cardArray];

const gridDisplay = document.querySelector('#grid');
const resultDisplay = document.querySelector('#result');
let cardsChosen = [];
let cardsChosenId = [];
const cardsWon = [];

// Game state
let timer;
let seconds = 0;
let isGameStarted = false;
let difficulty = 'medium'; // default difficulty

// Create UI elements
const gameControls = document.createElement('div');
gameControls.className = 'game-controls';

const difficultySelect = document.createElement('select');
difficultySelect.className = 'difficulty-select';
['easy', 'medium', 'hard'].forEach(level => {
    const option = document.createElement('option');
    option.value = level;
    option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
    difficultySelect.appendChild(option);
});

const timerDisplay = document.createElement('div');
timerDisplay.className = 'timer';
timerDisplay.textContent = 'Time: 0s';

const bestTimeDisplay = document.createElement('div');
bestTimeDisplay.className = 'best-time';
bestTimeDisplay.textContent = `Best Time: ${localStorage.getItem('bestTime') || 'No record'}`;

gameControls.appendChild(difficultySelect);
gameControls.appendChild(timerDisplay);
gameControls.appendChild(bestTimeDisplay);
document.body.insertBefore(gameControls, gridDisplay);

// Timer functions
function startTimer() {
    if (!isGameStarted) {
        isGameStarted = true;
        seconds = 0;
        timer = setInterval(() => {
            seconds++;
            timerDisplay.textContent = `Time: ${seconds}s`;
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timer);
    isGameStarted = false;
    
    // Update best time
    const currentBestTime = localStorage.getItem('bestTime');
    if (!currentBestTime || seconds < parseInt(currentBestTime)) {
        localStorage.setItem('bestTime', seconds);
        bestTimeDisplay.textContent = `Best Time: ${seconds}s`;
    }
}

// Difficulty settings
function setDifficulty(level) {
    const settings = {
        easy: { pairs: 4, timeLimit: 60 },
        medium: { pairs: 6, timeLimit: 90 },
        hard: { pairs: 8, timeLimit: 120 }
    };
    
    // Reset the game
    gridDisplay.innerHTML = '';
    cardsWon.length = 0;
    cardArray = cardArray.slice(0, settings[level].pairs * 2);
    createBoard();
}

difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
    setDifficulty(difficulty);
    resultDisplay.textContent = '0';
    clearInterval(timer);
    isGameStarted = false;
    seconds = 0;
    timerDisplay.textContent = 'Time: 0s';
});

function createBoard() {
    cardArray.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < cardArray.length; i++) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card';
        
        const cardFront = document.createElement('img');
        cardFront.className = 'card-front';
        cardFront.src = cardArray[i].img;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        cardContainer.appendChild(cardFront);
        cardContainer.appendChild(cardBack);
        cardContainer.setAttribute('data-id', i);
        cardContainer.addEventListener('click', flipCard);
        
        gridDisplay.appendChild(cardContainer);
    }
}

function checkForMatch() {
    const cards = document.querySelectorAll('.card');
    const optionOneId = cardsChosenId[0];
    const optionTwoId = cardsChosenId[1];
    
    if (optionOneId === optionTwoId) {
        cards[optionOneId].classList.remove('flipped');
        alert('You clicked the same card!');
    } else if (cardsChosen[0] === cardsChosen[1]) {
        cards[optionOneId].style.visibility = 'hidden';
        cards[optionTwoId].style.visibility = 'hidden';
        cards[optionOneId].removeEventListener('click', flipCard);
        cards[optionTwoId].removeEventListener('click', flipCard);
        cardsWon.push(cardsChosen);
    } else {
        setTimeout(() => {
            cards[optionOneId].classList.remove('flipped');
            cards[optionTwoId].classList.remove('flipped');
        }, 500);
    }
    
    resultDisplay.textContent = cardsWon.length;
    cardsChosen = [];
    cardsChosenId = [];
    
    if (cardsWon.length === cardArray.length/2) {
        stopTimer();
        resultDisplay.textContent = 'Congratulations! You found them all!🥳';
    }
}

function flipCard() {
    if (!isGameStarted) startTimer();
    
    const cardId = this.getAttribute('data-id');
    if (!this.classList.contains('flipped')) {
        this.classList.add('flipped');
        cardsChosen.push(cardArray[cardId].name);
        cardsChosenId.push(cardId);
        
        if (cardsChosen.length === 2) {
            setTimeout(checkForMatch, 500);
        }
    }
}

// Initialize the game
createBoard();