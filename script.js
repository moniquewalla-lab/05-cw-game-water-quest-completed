// Level unlocking and achievement functions

function markLevelCompleted(level) {
    let levelsCompleted = JSON.parse(localStorage.getItem('levelsCompleted') || '[]');
    if (!levelsCompleted.includes(level)) {
        levelsCompleted.push(level);
        localStorage.setItem('levelsCompleted', JSON.stringify(levelsCompleted));
    }
    
    // Check for First Win achievement
    if (levelsCompleted.length === 1) {
        unlockAchievement('first-win');
    }
}

function unlockAchievement(achievementId) {
    let achievements = JSON.parse(localStorage.getItem('achievements') || '{}');
    if (!achievements[achievementId]) {
        achievements[achievementId] = {
            unlocked: true,
            date: new Date().toISOString()
        };
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
}

function checkSpeedDemonAchievement(timeInSeconds) {
    if (timeInSeconds <= 30) {
        unlockAchievement('speed-demon');
    }
}

function checkWaterMasterAchievement() {
    const levelsCompleted = JSON.parse(localStorage.getItem('levelsCompleted') || '[]');
    if (levelsCompleted.length >= 5) {
        unlockAchievement('water-master');
    }
}

// Add this function to call when a level is actually completed in your game
function completeLevelWithStats(level, timeInSeconds, score) {
    // Mark level completed
    markLevelCompleted(level);
    
    // Unlock next level
    const currentUnlocked = parseInt(localStorage.getItem('unlockedLevel') || '1');
    if (level >= currentUnlocked) {
        localStorage.setItem('unlockedLevel', level + 1);
    }
    
    // Update fastest time (if better)
    const currentFastest = parseInt(localStorage.getItem('fastestTime') || '999999');
    if (timeInSeconds < currentFastest) {
        localStorage.setItem('fastestTime', timeInSeconds.toString());
    }
    
    // Update high score (if better)
    const currentHighScore = parseInt(localStorage.getItem('highScore') || '0');
    if (score > currentHighScore) {
        localStorage.setItem('highScore', score.toString());
    }
    
    // Check achievements
    checkSpeedDemonAchievement(timeInSeconds);
    checkWaterMasterAchievement();
}

// Add click handler for level 1 container
document.addEventListener('DOMContentLoaded', function() {
    const level1Container = document.querySelector('#level1-container');
    
    if (level1Container) {
        level1Container.onclick = function() {
            window.location.href = 'level-start.html?level=1';
        };
        
        // Add pointer cursor to indicate it's clickable
        level1Container.style.cursor = 'pointer';
    }
});

// Reset function for testing - call from browser console
function resetGameProgress() {
    localStorage.clear();
    console.log('Game progress reset!');
    location.reload();
}

// Make it globally accessible
window.resetGameProgress = resetGameProgress;

// Keyboard shortcut for reset (Ctrl+Shift+R)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        if (confirm('Reset all game progress?')) {
            resetGameProgress();
        }
    }
});
