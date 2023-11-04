// Util for set intersections
function intersection(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection
}

// Choose a random element from an array. Useful for testing by grabbing a random wordle
function choice(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

// Return words that contain the present letters
function getWordsWithPresentLetters(presentLetters = new Map()) {
    return new Set(ANSWER_WORDS.filter(word => {
        for (const [letter, locations] of presentLetters) {
            // Remove words that don't have the present letter
            if (!(word.includes(letter))) {
                return false;
            }
            // If they do have the present letter, remove words that have a present letter
            // in a location that has been guessed, e.g. if the word is AROMA, the guess is 
            // TRAIN, do not include words that have A in the 3rd slot like GRASS
            for (const index of locations) {
                if (word[index] === letter) {
                    return false;
                }
            }
        }
        return true;
    }));
}

// Return words that contain the correct letters in the right places
function getWordsWithCorrectLetters(guesses = []) {
    return new Set(ANSWER_WORDS.filter(word => {
        for (const [index, letter] of guesses.entries()) {
            if (letter !== ' ' && !(word[index] === letter)) {
                return false;
            }
        }
        return true;
    }));
}

// Return words that don't contain incorrectly guessed letters
function getWordsWithoutAbsentLetters(absentLetters = []) {
    return new Set(ANSWER_WORDS.filter(word => {
        for (const absent of absentLetters) {
            if (word.includes(absent)) {
                return false;
            }
        }
        return true;
    }));
}

// Simulate one turn of Wordle, useful for testing
function gameResult(answer, guess, gameState = {
    absentLetters: new Set(),
    presentLetters: new Map(),
    correctLetters: [' ', ' ', ' ', ' ', ' '] // default to empty
}) {
    for (let [index, letter] of guess.split('').entries()) {
        if (!(answer.includes(letter))) {
            gameState.absentLetters.add(letter);
        } else if (answer[index] === letter) {
            gameState.correctLetters[index] = letter;
        } else {
            let presentLocations = gameState.presentLetters.get(letter) ?? [];
            presentLocations.push(index);
            gameState.presentLetters.set(letter, presentLocations);
        }
    }
    return gameState;
}

// Get possible guess words given the current state
function getPossibleWords({
    absentLetters = new Set(),
    presentLetters = new Map(),
    correctLetters = [' ', ' ', ' ', ' ', ' '], // default to empty
    priorGuesses = new Set()
} = {}) {
    const absent = getWordsWithoutAbsentLetters(absentLetters);
    const present = getWordsWithPresentLetters(presentLetters);
    const correct = getWordsWithCorrectLetters(correctLetters);
    const possible = intersection(present, intersection(correct, absent));
    // Remove already guessed words if necessary
    if (possible.size > 1) {
        priorGuesses.forEach(word => possible.delete(word));
    }
    return possible;
}

// Get whether the user has dark mode and high contrast mode enabled
function getColorSettings() {
    // Settings for dark mode and high contrast are undefined until explicitly toggled
    const settings = JSON.parse(window.localStorage[WordleSettingsKey]).settings ?? {};
    return {
        DarkMode: settings.darkMode ?? false,
        HighContrast: settings.colorblindMode ?? false
    };
}

// Given the game state, compute the list of possible words
function solve() {
    // NYT no longer stores the game state in local storage, so we must determine
    // the game state based on the HTML classes
    let guesses = Array.from(document.querySelectorAll('[data-state]')).slice(0,30).map(item => item.ariaLabel);

    // Change 1x30 array into 6x5 array
    let boardState = guesses.reduce((rows, key, index) => (index % 5 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []);

    let state = {
        absentLetters: new Set(),
        presentLetters: new Map(),
        correctLetters: [' ', ' ', ' ', ' ', ' '],
        priorGuesses: new Set()
    };

    for (let row of boardState) {
        if (row[0] === States.EMPTY) break; // We can stop as soon as we see one empty box
        // Evaluate correct letters first
        let wordBuilder = []
        for (let [index, guess] of row.entries()) {
            let [, letter, evaluation] = guess.toLowerCase().split(', ');
            wordBuilder.push(letter)
            if (evaluation !== States.CORRECT) continue;
            state.correctLetters[index] = letter;
        }

        // Build word and keep track of it so as to not recommend again
        state.priorGuesses.add(wordBuilder.join(''))

        // Then evaluate present letters
        for (let [index, guess] of row.entries()) {
            let [, letter, evaluation] = guess.toLowerCase().split(', ');
            if (evaluation !== States.PRESENT) continue;
            let presentLocations = state.presentLetters.get(letter) ?? [];
            presentLocations.push(index);
            state.presentLetters.set(letter, presentLocations);
        }
        // Finally evaluate absent letters
        for (let guess of row) {
            let [, letter, evaluation] = guess.toLowerCase().split(', ');
            if (evaluation !== States.ABSENT) continue;
            // edge case with multiple letters
            if (!state.correctLetters.includes(letter) && !state.presentLetters.has(letter)) {
                state.absentLetters.add(letter);
            }
        }
    }
    return Array.from(getPossibleWords(state));
}

// Listen to keyboard enters to update
document.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
        // Wait 2 seconds for the animation to finish before updating state
        await new Promise(r => setTimeout(r, 1800));

        chrome.runtime.sendMessage({
            possible: solve(), 
            settings: getColorSettings()
        });
    }
})

// Listen to message from popup.js and respond
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        let possible = solve();
        let settings = getColorSettings();
        sendResponse({ possible, settings });
    } catch (e) {
        console.error("encountered JSON parse error", e);
    }
});

// Run when wordle page first opens
chrome.runtime.sendMessage({
    possible: solve(), 
    settings: getColorSettings()
});
