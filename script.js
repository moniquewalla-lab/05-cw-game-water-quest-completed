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
