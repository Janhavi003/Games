const computerChoiceDisplay = document.getElementById('computer-choice');
const userChoiceDisplay = document.getElementById('user-choice');
const resultDisplay = document.getElementById('result');
const messageDisplay = document.getElementById('message');
const userScoreDisplay = document.getElementById('user-score');
const computerScoreDisplay = document.getElementById('computer-score');
const resetButton = document.getElementById('reset');
const possibleChoices = document.querySelectorAll('.choice-button');

let userChoice;
let computerChoice;
let userScore = 0;
let computerScore = 0;
let ties = 0;

const validChoices = ['rock', 'paper', 'scissors'];

const outcomes = {
    rock: { rock: 'draw', paper: 'lose', scissors: 'win' },
    paper: { rock: 'win', paper: 'draw', scissors: 'lose' },
    scissors: { rock: 'lose', paper: 'win', scissors: 'draw' },
};

// Audio files
const winSound = new Audio('win.mp3');
const loseSound = new Audio('lose.mp3');
const drawSound = new Audio('draw.wav');

// Event listener for user choice
possibleChoices.forEach(choice => choice.addEventListener('click', (e) => {
    userChoice = e.target.id;

    // Validate input
    if (!validChoices.includes(userChoice)) {
        handleInvalidInput();
        return;
    }

    resetHighlights();
    userChoiceDisplay.innerHTML = userChoice;
    generateComputerChoice();
    determineResult();
    updateScores();
}));

// Generate a random choice for the computer
function generateComputerChoice() {
    const randomIndex = Math.floor(Math.random() * validChoices.length);
    computerChoice = validChoices[randomIndex];
    computerChoiceDisplay.innerHTML = computerChoice;
}

// Determine the result of the round
function determineResult() {
    const result = outcomes[userChoice][computerChoice];
    const resultText = {
        win: 'You Win!🥳',
        lose: 'Computer Wins!😢',
        draw: 'It\'s a Draw!😐',
    };

    messageDisplay.innerHTML = resultText[result];
    resultDisplay.className = result;

    // Play the corresponding sound effect
    if (result === 'win') {
        winSound.play();
        userScore++;
    } else if (result === 'lose') {
        loseSound.play();
        computerScore++;
    } else {
        drawSound.play();
        ties++; // Increment ties for a draw
    }

    // Highlight the winner
    highlightChoice(userChoice, computerChoice, result);
}

// Highlight winning choice
function highlightChoice(user, computer, result) {
    const userButton = document.getElementById(user);
    const computerButton = document.querySelector(`[id='${computer}']`);

    if (result === 'win') {
        userButton.classList.add('winner');
    } else if (result === 'lose') {
        computerButton.classList.add('winner');
    }
}

// Reset all highlights
function resetHighlights() {
    possibleChoices.forEach(button => button.classList.remove('winner'));
}

// Update the displayed scores
function updateScores() {
    userScoreDisplay.innerHTML = userScore;
    computerScoreDisplay.innerHTML = computerScore;
    document.getElementById('ties-score').innerHTML = ties;
}

// Handle invalid input
function handleInvalidInput() {
    messageDisplay.innerHTML = 'Invalid input! Please select Rock, Paper, or Scissors.';
    resultDisplay.className = 'error';
}

// Reset the game
resetButton.addEventListener('click', () => {
    userScore = 0;
    computerScore = 0;
    ties = 0;
    userChoice = '';
    computerChoice = '';
    userChoiceDisplay.innerHTML = '';
    computerChoiceDisplay.innerHTML = '';
    messageDisplay.innerHTML = '';
    resultDisplay.innerHTML = '';
    resultDisplay.className = '';
    userScoreDisplay.innerHTML = userScore;
    computerScoreDisplay.innerHTML = computerScore;
    document.getElementById('ties-score').innerHTML = ties;
    resetHighlights();
});
