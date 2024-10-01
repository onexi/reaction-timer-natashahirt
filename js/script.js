let button = document.getElementById("reaction-button");
let startTime = null; // Store the time when the button turns red
let timerId = null; // To store the current timer ID for canceling
let strikes = 0; // Current strike count is zero
let isButtonRed = false; // Flag to track if the button is red
let records = []; // Global list to store average reaction times at the end of each game
let playerGameCount = {}; // Dictionary to store how many games each player has played

function changeButtonColorRed() {
    button.style.backgroundColor = 'red';
    button.innerHTML = 'CLICK';
    isButtonRed = true;
    startTime = Date.now(); // Record the time at which the button turns red
}

function changeButtonColorBlack() {
    if (isButtonRed) {
        let reactionTime = (Date.now() - startTime) / 1000; // Get the reaction time in seconds
        sendReactionTimeToServer(reactionTime); // Send reaction time to the server

        // Check the number of attempts by looking at the length of the reaction times list
        const attemptCount = document.querySelectorAll('#reaction-times-list li').length;

        // Automatically reset the game after 10 attempts
        if (attemptCount >= 9) {
            alert(`10 attempts completed! Game over!`);
            
            const playerName = document.getElementById('playerName').value.trim();
            saveAverageReactionTime(playerName);

            button.removeEventListener("click", changeButtonColorBlack);
            button.addEventListener("click", resetGame(true));

            resetGame(true)

            return; // Exit to prevent further changes
        }
    
        button.style.backgroundColor = 'black';
        button.style.color = 'white';
        button.innerHTML = 'wait';
    
        startTime = null; // Reset startTime
        isButtonRed = false; // Reset the flag since the button is no longer red

        // Start a new random timer
        startRandomTimer();

        return;

    } else {
        // Increment strikes if clicked when the button is not red
        strikes++;
        updateStrikeCounter(); 

        // Check if the user has reached 3 strikes
        if (strikes === 3) {
            alert(`Strike ${strikes}! Game over!`);
            clearTimeout(timerId); // Stop the timer to prevent the button from changing to red again

            const playerName = document.getElementById('playerName').value.trim();
            saveAverageReactionTime(playerName);

            button.removeEventListener("click", changeButtonColorBlack);
            button.addEventListener("click", resetGame(true));

            return; // Exit to prevent further changes
        } else if (strikes > 3) {
            resetGame(true);
        }
    }

}

function startRandomTimer() {
    // Clear any existing timer before setting a new one
    clearTimeout(timerId);
    timerId = setTimeout(() => {
        changeButtonColorRed();
    }, Math.random() * 3000 + 1000); // Random interval between 1-4 seconds
}

function sendReactionTimeToServer(reactionTime) {
    fetch('/save-reaction-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: reactionTime })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Reaction time saved:', data);
        getReactionTimesFromServer(); // Refresh the list
    })
    .catch(error => {
        console.error('Error saving reaction time:', error);
    });
}

function getReactionTimesFromServer() {
    fetch('/retrieve-reaction-times')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Retrieved reaction times:', data.times); // Log the retrieved times
        displayReactionTimes(data.times); // Display the times on the UI
    })
    .catch(error => {
        console.error('Error fetching reaction times:', error);
    });
}

function displayReactionTimes(times) {
    const list = document.getElementById('reaction-times-list');
    list.innerHTML = ''; // Clear the list before updating

    // Calculate the average reaction time
    const averageTime = times.reduce((acc, time) => acc + time, 0) / times.length;

    // Create a new element to show the average time
    const averageElement = document.createElement('p');
    averageElement.innerHTML = `<strong>Average Reaction Time: ${averageTime.toFixed(2)} s</strong>`;
    list.appendChild(averageElement);

    // Reverse the times array to show the most recent results first
    times.slice().reverse().forEach(time => {
        const listItem = document.createElement('li');
        listItem.textContent = `${time.toFixed(2)} s`; // Round the time before displaying
        listItem.style.listStyleType = 'none'; // Remove bullet points
        list.appendChild(listItem);
    });
}

function clearReactionTimesOnServer() {
    fetch('/clear-reaction-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Cleared reaction times:', data);
        getReactionTimesFromServer(); // Fetch the (now empty) list from the server
    })
    .catch(error => {
        console.error('Error clearing reaction times:', error);
    });
}

function updateStrikeCounter() {
    const strikeDisplay = document.getElementById('strike-display');
    strikeDisplay.innerHTML = '*'.repeat(strikes); // Display stars based on the number of strikes
}

function saveAverageReactionTime(playerName) {
    // Get all recorded times from the list
    const times = Array.from(document.querySelectorAll('#reaction-times-list li')).map(li => parseFloat(li.textContent));
    
    if (times.length > 0) {
        // Calculate the average time
        const averageTime = times.reduce((acc, time) => acc + time, 0) / times.length;
        
        // Update the player's game count
        if (!playerGameCount[playerName]) {
            playerGameCount[playerName] = 1; // First game for this player
        } else {
            playerGameCount[playerName] += 1; // Increment the game count for the player
        }

        // Save the player's name, their average time, and their game count
        records.push({ 
            player: playerName, 
            averageTime: averageTime,
            gameNumber: playerGameCount[playerName],
            strikes: strikes,
        });
        
        updateRecords(); // Update the display for the records
    }
}

function updateRecords() {
    const recordsList = document.getElementById('records-list');
    recordsList.innerHTML = ''; // Clear the list before updating

    // Sort records by average time (fastest first)
    records.sort((a, b) => a.averageTime - b.averageTime);

    // Create a list item for each record
    records.forEach((record) => {
        // Generate the strike indicator (e.g., "**" for 2 strikes)
        const strikeIndicator = '*'.repeat(record.strikes);

        // Create the list item text
        const listItem = document.createElement('li');
        listItem.textContent = `${record.player} #${record.gameNumber}: ${record.averageTime.toFixed(2)} s (${strikeIndicator})`;
        recordsList.appendChild(listItem);
    });
}

function resetGame(reset) {
    // Reset game variables
    strikes = 0;
    updateStrikeCounter(); // Clear the strike counter display
    startTime = null;
    clearTimeout(timerId);

    button.innerHTML = 'wait'; // Change button text back to its original state
    button.style.backgroundColor = 'black';
    button.style.color = 'white';
    isButtonRed = false; // Reset the flag to indicate the button is not red

    button.removeEventListener("click", resetGame);
    button.addEventListener("click", changeButtonColorBlack);

    clearReactionTimesOnServer();

    if (reset == true) {
        // Show reset options for the player to choose
        document.getElementById('game-content').style.display = 'none';
        document.getElementById('reset-options').style.display = 'block';
    } else if (reset === 'newPlayer') {
        // Clear the player name display
        const playerDisplay = document.querySelector('.small-player-name');
        if (playerDisplay) {
            playerDisplay.textContent = '';
        }

        // Clear the player name input
        document.getElementById('playerName').value = '';

        // Hide the game content and show the name form container
        document.getElementById('game-content').style.display = 'none';
        document.getElementById('name-form-container').style.display = 'flex'; // Use flex to center the form
    }

}

// Fetch and clear the reaction times when the page loads
window.onload = function() {
    clearReactionTimesOnServer();
    startRandomTimer(); // Start the first random timer
};

// Handle form submission to start the game
document.addEventListener('DOMContentLoaded', () => {
    // Get references to elements
    const nameFormContainer = document.getElementById('name-form-container');
    const gameContent = document.getElementById('game-content');
    const resetOptions = document.getElementById('reset-options')
    const playerNameInput = document.getElementById('playerName');
    const playerDisplay = document.createElement('p'); // Create player name display element

    // Handle form submission to start the game
    document.getElementById('name-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from refreshing the page
        const playerName = playerNameInput.value.trim(); // Get the player's name
        
        // Check if the player name input is not empty
        if (playerName === '') {
            alert('Please enter a name!');
            return;
        }

        console.log(`Player name entered: ${playerName}`); // Debug log

        // Display player's name
        playerDisplay.classList.add('small-player-name'); // Adds the 'small-player-name' class to the element
        playerDisplay.textContent = `Player: ${playerName}`;
        nameFormContainer.insertAdjacentElement('beforebegin', playerDisplay); // Add player display above the form

        // Hide the name form and show the game content
        nameFormContainer.style.display = 'none';
        gameContent.style.display = 'block';
        resetOptions.style.display = 'none';

        resetGame(false);

        // Start the game
        console.log('Starting the game...'); // Debug log to confirm the game is starting
        startRandomTimer();
    });

});

// Handle "Same Player" button click
document.getElementById('same-player').addEventListener('click', () => {
    console.log('Restarting game with the same player...');

    // Hide reset options
    document.getElementById('reset-options').style.display = 'none';
    document.getElementById('game-content').style.display = 'block';

    // Start the game with the current player
    setTimeout(() => {
        startRandomTimer(); // Start the game after a short delay
    }, 2000);
});

// Handle "New Player" button click
document.getElementById('new-player').addEventListener('click', () => {
    console.log('Starting a new game with a new player...');

    // Clear the player name display
    const playerDisplay = document.querySelector('.small-player-name');
    if (playerDisplay) {
        playerDisplay.textContent = '';
    }

    // Clear the player name input
    document.getElementById('playerName').value = '';

    // Hide the game content and show the name form container
    document.getElementById('game-content').style.display = 'none';
    document.getElementById('name-form-container').style.display = 'block'; 
    document.getElementById('reset-options').style.display = 'none';
});


button.addEventListener("click", changeButtonColorBlack); // Turn the button color to black on click
