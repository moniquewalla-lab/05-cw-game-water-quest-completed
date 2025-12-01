/* -----------------------------------------------------
   LEVEL & ACHIEVEMENT SYSTEM
----------------------------------------------------- */

function unlockAchievement(id) {
    const achievements = JSON.parse(localStorage.getItem("achievements") || "{}");

    if (!achievements[id]) {
        achievements[id] = {
            unlocked: true,
            date: new Date().toISOString()
        };
        localStorage.setItem("achievements", JSON.stringify(achievements));
    }
}

function saveLevelStats(level, timeInSeconds, score) {
    // Unlock next level
    const unlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
    if (level >= unlocked) {
        localStorage.setItem("unlockedLevel", (level + 1).toString());
    }

    // Per-level stats
    let levelStats = JSON.parse(localStorage.getItem("levelStats") || "{}");
    if (!levelStats[level] || timeInSeconds < levelStats[level].time || score > levelStats[level].score) {
        levelStats[level] = {
            time: timeInSeconds,
            score: score,
            date: new Date().toISOString()
        };
        localStorage.setItem("levelStats", JSON.stringify(levelStats));
    }

    // Fastest time
    const fastest = parseInt(localStorage.getItem("fastestTime") || "999999");
    if (timeInSeconds < fastest) {
        localStorage.setItem("fastestTime", timeInSeconds.toString());
    }

    // High score
    const high = parseInt(localStorage.getItem("highScore") || "0");
    if (score > high) {
        localStorage.setItem("highScore", score.toString());
    }

    // Achievements
    if (timeInSeconds <= 30) unlockAchievement("speed-demon");

    const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel") || "1");
    const levelsCompleted = unlockedLevel - 1;

    if (levelsCompleted >= 1) unlockAchievement("first-win");
    if (levelsCompleted >= 5) unlockAchievement("water-master");
}

/* -----------------------------------------------------
   🔥 INSERT THIS INTO winLevel() IN YOUR game.js
----------------------------------------------------- */
/*
function winLevel() {
    const level = currentLevelNumber;   // your game's level variable
    const time = totalTime;            // your timer variable
    const score = currentScore;        // your score variable

    saveLevelStats(level, time, score);

    window.location.href = "profile.html";
}
*/


/* -----------------------------------------------------
   RESET SYSTEM (kept as-is)
----------------------------------------------------- */

function resetGameProgress() {
    localStorage.clear();
    console.log("Game progress reset!");
    location.reload();
}

window.resetGameProgress = resetGameProgress;

document.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === "R") {
        if (confirm("Reset all game progress?")) {
            resetGameProgress();
        }
    }
});


/* -----------------------------------------------------
   PROFILE PAGE UPDATE
----------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const isProfile = window.location.pathname.includes("profile.html");
    if (!isProfile) return;

    const unlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
    const levelsCompleted = Math.max(0, unlocked - 1);

    const fastest = parseInt(localStorage.getItem("fastestTime") || "0");
    const highScore = parseInt(localStorage.getItem("highScore") || "0");
    const achievements = JSON.parse(localStorage.getItem("achievements") || "{}");

    /* --- Update Rank --- */
    const rankValue = document.querySelector(".rank-value");
    if (rankValue) rankValue.textContent = levelsCompleted;

    /* --- Update Fastest Time --- */
    const fastestCard = [...document.querySelectorAll(".stat-card")]
        .find(c => c.querySelector(".stat-label")?.textContent === "Fastest Time");

    if (fastestCard) {
        const el = fastestCard.querySelector(".stat-value");
        if (fastest > 0) {
            const m = Math.floor(fastest / 60);
            const s = fastest % 60;
            el.textContent = `${m}:${s.toString().padStart(2, "0")}`;
        } else {
            el.textContent = "0:00";
        }
    }

    /* --- Update High Score --- */
    const highScoreCard = [...document.querySelectorAll(".stat-card")]
        .find(c => c.querySelector(".stat-label")?.textContent === "High Score");

    if (highScoreCard) {
        highScoreCard.querySelector(".stat-value").textContent = highScore;
    }

    /* --- Update Levels Completed --- */
    const levelsCard = [...document.querySelectorAll(".stat-card")]
        .find(c => c.querySelector(".stat-label")?.textContent === "Levels Completed");

    if (levelsCard) {
        levelsCard.querySelector(".stat-value").textContent = `${levelsCompleted}/5`;
    }

    /* --- Update Progress Bars --- */
    const progressItems = document.querySelectorAll(".progress-item");
    progressItems.forEach((item, index) => {
        const levelNum = index + 1;
        const completed = levelNum <= levelsCompleted;
        const pct = completed ? 100 : 0;

        const pctLabel = item.querySelector(".progress-percentage");
        const fill = item.querySelector(".progress-fill");

        if (pctLabel) pctLabel.textContent = pct + "%";
        if (fill) fill.style.width = pct + "%";
    });

    /* --- Update Achievements --- */
    const badgeMap = {
        "first-win": document.getElementById("first-win-badge"),
        "speed-demon": document.getElementById("speed-demon-badge"),
        "perfect-score": document.getElementById("perfect-score-badge"),
        "water-master": document.getElementById("water-master-badge")
    };

    Object.keys(badgeMap).forEach(key => {
        const badge = badgeMap[key];
        if (badge) {
            if (achievements[key]?.unlocked) {
                badge.classList.remove("locked");
            } else {
                badge.classList.add("locked");
            }
        }
    });
});
