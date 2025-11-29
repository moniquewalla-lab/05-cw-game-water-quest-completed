// script.js

// Navigation click handlers
document.querySelector('.nav-item.home').onclick = function() {
    window.location.href = 'index.html';
};
document.querySelector('.nav-item.leaderboard').onclick = function() {
    window.location.href = 'leaderboard.html';
};
document.querySelector('.nav-item.profile').onclick = function() {
    window.location.href = 'profile.html';
};

// Profile page functionality
if (window.location.pathname.endsWith('profile.html')) {
    // Load user profile data (mock data for demonstration)
    const userProfile = {
        username: 'Player1',
        gamesPlayed: 10,
        gamesWon: 7,
        totalScore: 1500
    };

    // Display user profile data
    document.body.onload = function() {
        const profileContainer = document.createElement('div');
        profileContainer.innerHTML = `
            <h1>${userProfile.username}'s Profile</h1>
            <p>Games Played: ${userProfile.gamesPlayed}</p>
            <p>Games Won: ${userProfile.gamesWon}</p>
            <p>Total Score: ${userProfile.totalScore}</p>
            <button id="edit-profile">Edit Profile</button>
        `;
        document.getElementById('game-container').appendChild(profileContainer);

        // Edit profile button functionality
        document.getElementById('edit-profile').onclick = function() {
            alert('Edit profile functionality not implemented yet.');
        };
    };
}