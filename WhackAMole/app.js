const squares = document.querySelectorAll('.square');
const timeLeft = document.querySelector('#timeleft');
const scoreDisplay = document.querySelector('#score');

let result = 0;
let hitPosition;
let currentTime = 60;
let timerId = null;
let moleInterval = 700; // Initial mole appearance interval

function randomSquare() {
    squares.forEach(square => {
        square.classList.remove('mole', 'bonus');
    });

    let randomPosition = squares[Math.floor(Math.random() * squares.length)];
    randomPosition.classList.add(Math.random() < 0.1 ? 'bonus' : 'mole'); // 10% chance for bonus mole

    hitPosition = randomPosition.id;
}

squares.forEach(square => {
    square.addEventListener('mousedown', () => {
        if (square.id === hitPosition) {
            result++;
            scoreDisplay.textContent = 'Score: ' + result;
            hitPosition = null;

            // Increase difficulty
            if (result % 5 === 0) {
                moleInterval = Math.max(200, moleInterval - 100); // Decrease interval, minimum 200ms
                clearInterval(timerId);
                moveMole();
            }
        }
    });
});

function moveMole() {
    timerId = setInterval(randomSquare, moleInterval);
}

moveMole();

function countDown() {
    currentTime--;
    timeLeft.textContent = 'Time Left: ' + currentTime;

    if (currentTime === 0) {
        clearInterval(countDownTimerId);
        clearInterval(timerId);
        alert('Game Over! Your final score is ' + result);
    }
}

let countDownTimerId = setInterval(countDown, 1000);