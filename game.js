// Get level from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const currentLevel = urlParams.get('level') || '1';

// Update level display
document.getElementById('current-level').textContent = currentLevel;

// Game state
let gameState = {
    score: 0,
    timeElapsed: 0, // Changed from timeRemaining to timeElapsed
    timerInterval: null,
    gameRoundInterval: null, // Add this to track automatic rounds
    blueSquareTimeout: null, // Add this to track blue square timeout
    blueSquareStartTime: null, // Add this to track when blue square appears
    targetSquare: null,
    targetColor: null, // Add this to track the color
    squares: [],
    colorHistory: [], // Add this to track color history
    hasWon: false // Add this to prevent actions after winning
};

// Level configurations
const levelConfig = {
    '1': { goal: 20, tapRate: 4000 },
    '2': { goal: 30, tapRate: 3500 },
    '3': { goal: 40, tapRate: 3000 },
    '4': { goal: 50, tapRate: 2500 },
    '5': { goal: 60, tapRate: 2000 }
};

// Initialize game
function initGame() {
    console.log('initGame called');
    createGameBoard();
    
    // Start timer immediately without delay
    startTimer();
    
    // Delay the first game round by 1 second
    setTimeout(() => {
        startGame();
    }, 1000);
    console.log('Game initialized for level:', currentLevel);
}

// Create 3x3 game board
function createGameBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Clear placeholder
    
    // Create 9 squares
    for (let i = 0; i < 9; i++) {
        const square = document.createElement('div');
        square.className = 'game-square';
        square.dataset.index = i;
        square.onclick = () => handleSquareClick(i);
        gameBoard.appendChild(square);
        gameState.squares.push(square);
    }
}

// Timer functions
function startTimer() {
    console.log('startTimer called');
    
    if (gameState.timerInterval) {
        console.log('Clearing existing interval:', gameState.timerInterval);
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timeElapsed = 0;
    
    const timerElement = document.getElementById('time-elapsed');
    console.log('Timer element:', timerElement);
    if (!timerElement) {
        console.error('Timer element not found in DOM!');
        return;
    }
    
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeElapsed++;
        console.log('Timer tick:', gameState.timeElapsed);
        updateTimerDisplay();
    }, 1000);
    
    console.log('Timer started with interval ID:', gameState.timerInterval);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('time-elapsed');
    if (!timerElement) {
        console.error('Timer element not found during update!');
        console.trace('Call stack:'); // Show where this was called from
        return;
    }
    
    const minutes = Math.floor(gameState.timeElapsed / 60);
    const seconds = gameState.timeElapsed % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    console.log('Updating timer display:', timeString);
    timerElement.textContent = timeString;
}

// Game control functions
function restartLevel() {
    window.location.reload();
}

function quitGame() {
    window.location.href = 'index.html';
}

function useHint() {
    // TODO: Implement hint logic
    console.log('Hint requested');
    alert('Hint system coming soon!');
}

function nextLevel() {
    const next = parseInt(currentLevel) + 1;
    if (next <= 5) {
        window.location.href = `level-start.html?level=${next}`;
    } else {
        window.location.href = 'index.html';
    }
}

// Start game round
function startGame() {
    // Don't start a new round if the game has been won
    if (gameState.hasWon) {
        return;
    }
    
    if (gameState.gameRoundInterval) {
        clearInterval(gameState.gameRoundInterval);
    }
    
    if (gameState.blueSquareTimeout) {
        clearTimeout(gameState.blueSquareTimeout);
    }
    
    // Clear all squares
    gameState.squares.forEach(sq => {
        sq.className = 'game-square';
    });
    
    // Randomly select ONE square to change color
    const randomIndex = Math.floor(Math.random() * 9);
    gameState.targetSquare = randomIndex;
    
    // Improved color selection for more even distribution
    let isBlue;
    
    // Keep track of last 4 colors to ensure balance
    if (gameState.colorHistory.length >= 4) {
        const recentBlues = gameState.colorHistory.slice(-4).filter(c => c === 'blue').length;
        
        // If too many greens recently, force blue
        if (recentBlues === 0) {
            isBlue = true;
        }
        // If too many blues recently, force green
        else if (recentBlues === 4) {
            isBlue = false;
        }
        // Otherwise random
        else {
            isBlue = Math.random() < 0.5;
        }
    } else {
        isBlue = Math.random() < 0.5;
    }
    
    const config = levelConfig[currentLevel] || levelConfig['1'];
    
    if (isBlue) {
        gameState.squares[randomIndex].classList.add('blue');
        gameState.targetColor = 'blue';
        gameState.colorHistory.push('blue');
        gameState.blueSquareStartTime = Date.now();
        
        gameState.blueSquareTimeout = setTimeout(() => {
            if (gameState.hasWon) return; // Guard against game over after winning
            gameOver();
        }, config.tapRate);
    } else {
        gameState.squares[randomIndex].classList.add('green');
        gameState.targetColor = 'green'; // Track the color
        gameState.colorHistory.push('green');
        gameState.blueSquareStartTime = null; // Reset for non-blue squares
    }
    
    // Keep only last 10 colors in history to prevent memory issues
    if (gameState.colorHistory.length > 10) {
        gameState.colorHistory.shift();
    }
    
    // Set up automatic round cycling based on level's tapRate
    gameState.gameRoundInterval = setInterval(() => {
        if (gameState.hasWon) return; // Guard against new rounds after winning
        startGame();
    }, config.tapRate);
}

// Show motivation text
function showMotivation(message, points) {
    const motivationDisplay = document.querySelector('.motivation-display');
    if (!motivationDisplay) {
        // Create motivation display if it doesn't exist
        const newDisplay = document.createElement('div');
        newDisplay.className = 'motivation-display';
        newDisplay.innerHTML = `
            <div class="motivation-text"></div>
            <div class="motivation-points"></div>
        `;
        document.getElementById('game-board').appendChild(newDisplay);
    }
    
    const messageEl = document.querySelector('.motivation-text');
    const pointsEl = document.querySelector('.motivation-points');
    
    messageEl.textContent = message;
    pointsEl.textContent = points;
    
    // Remove any existing animation class
    messageEl.style.animation = 'none';
    pointsEl.style.animation = 'none';
    
    // Trigger reflow to restart animation
    void messageEl.offsetWidth;
    
    // Add animation class
    messageEl.style.animation = 'fadeInOut 0.5s ease-in-out';
    pointsEl.style.animation = 'fadeInOut 0.5s ease-in-out';
    
    // Clear the text after animation completes
    setTimeout(() => {
        messageEl.textContent = '';
        pointsEl.textContent = '';
    }, 500); // Match the animation duration (0.5s = 500ms)
}

// Handle square click
function handleSquareClick(index) {
    // Ignore clicks if the game has been won
    if (gameState.hasWon) {
        return;
    }
    
    if (index === gameState.targetSquare) {
        // Check if it's the blue square (correct) or green square (wrong)
        if (gameState.targetColor === 'blue') {
            // Clear the blue square timeout since it was clicked in time
            if (gameState.blueSquareTimeout) {
                clearTimeout(gameState.blueSquareTimeout);
            }
            
            // Check reaction time for bonus points
            const clickTime = Date.now();
            const reactionTime = clickTime - gameState.blueSquareStartTime;
            let pointsEarned = 1;
            
            if (reactionTime <= 1000) {
                // Perfect timing! Award 3 bonus points
                pointsEarned = 3;
                showMotivation('Perfect!', '+3');
            } else if (reactionTime <= 2000) {
                // Fantastic timing! Award 2 bonus points
                pointsEarned = 2;
                showMotivation('Fantastic!', '+2');
            } else {
                // Good timing! Award 1 point
                pointsEarned = 1;
                showMotivation('Great!', '+1');
            }
            
            // Correct tap - blue square
            gameState.score += pointsEarned;
            document.getElementById('score').textContent = gameState.score;
            
            console.log('Score updated:', gameState.score); // Debug log
            
            const config = levelConfig[currentLevel] || levelConfig['1'];
            console.log('Checking win condition:', gameState.score, 'vs goal:', config.goal); // Debug log
            
            if (gameState.score >= config.goal) {
                console.log('Win condition met!'); // Debug log
                // Set hasWon flag immediately to prevent any further game actions
                gameState.hasWon = true;
                // Clear intervals BEFORE calling winLevel to prevent new rounds
                if (gameState.gameRoundInterval) {
                    clearInterval(gameState.gameRoundInterval);
                }
                if (gameState.blueSquareTimeout) {
                    clearTimeout(gameState.blueSquareTimeout);
                }
                winLevel();
                return; // Exit the function to prevent startGame from being called
            }
            
            // Only start a new game if we haven't won
            if (!gameState.hasWon) {
                startGame();
            }
        } else {
            // Wrong tap - green square
            gameOver();
        }
    } else {
        // Wrong tap - missed the target square entirely
        gameOver();
    }
}

// Win condition
function winLevel() {
    console.log('winLevel() called'); // DEBUG
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.gameRoundInterval);
    clearTimeout(gameState.blueSquareTimeout);
    document.getElementById('final-score').textContent = gameState.score;
    const minutes = Math.floor(gameState.timeElapsed / 60);
    const seconds = gameState.timeElapsed % 60;
    document.getElementById('final-time').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // TODO: Implement these functions later
    // markLevelCompleted(parseInt(currentLevel));
    
    // Save progress - unlock next level
    const nextLevel = parseInt(currentLevel) + 1;
    const currentUnlockedLevel = parseInt(localStorage.getItem('unlockedLevel') || '1');
    if (nextLevel > currentUnlockedLevel && nextLevel <= 5) {
        localStorage.setItem('unlockedLevel', nextLevel.toString());
    }
    
    // TODO: Implement achievement checking later
    // checkSpeedDemonAchievement(gameState.timeElapsed);
    // checkWaterMasterAchievement();
    
    // Hide "Next Level" button if this is level 5
    const nextButton = document.querySelector('.next-button');
    if (currentLevel === '5') {
        nextButton.style.display = 'none';
    } else {
        nextButton.style.display = 'block';
    }
    
    const overlay = document.getElementById('win-overlay');
    console.log('Overlay element:', overlay); // DEBUG
    console.log('Setting display to flex'); // DEBUG
    overlay.style.display = 'flex';
    console.log('Overlay display after setting:', overlay.style.display); // DEBUG
}

// Game over condition
function gameOver() {
    // Don't trigger game over if the game has been won
    if (gameState.hasWon) {
        return;
    }
    
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.gameRoundInterval); // Clear round interval
    clearTimeout(gameState.blueSquareTimeout); // Clear blue square timeout
    document.getElementById('gameover-overlay').style.display = 'flex';
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game');
    
    // Verify critical elements exist
    const timerElement = document.getElementById('time-elapsed');
    const scoreElement = document.getElementById('score');
    const gameBoard = document.getElementById('game-board');
    
    console.log('Timer element check:', timerElement);
    console.log('Score element check:', scoreElement);
    console.log('Game board check:', gameBoard);
    
    if (!timerElement || !scoreElement || !gameBoard) {
        console.error('Critical DOM elements missing!');
        return;
    }
    
    // Initialize timer display
    timerElement.textContent = '0:00';
    
    initGame();
});
