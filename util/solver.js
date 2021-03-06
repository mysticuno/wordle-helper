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
                if (word[index] == letter) {
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
    correctLetters = [' ', ' ', ' ', ' ', ' '] // default to empty
} = {}) {
    absent = getWordsWithoutAbsentLetters(absentLetters);
    present = getWordsWithPresentLetters(presentLetters);
    correct = getWordsWithCorrectLetters(correctLetters);
    return intersection(present, intersection(correct, absent));
}

// Get whether the user has dark mode and high contrast mode enabled
function getColorSettings() {
    // Settings for dark mode and high contrast are undefined until explicitly toggled
    return {
        DarkMode: JSON.parse(window.localStorage[DarkModeSetting] ?? false),
        HighContrast: JSON.parse(window.localStorage[HighContrastSetting] ?? false)
    };
}

// Given the game state, compute the list of possible words
function solve() {
    let { boardState = [], evaluations = [] } = JSON.parse(window.localStorage.gameState || window.localStorage[WordleState]);
    let state = {
        absentLetters: new Set(),
        presentLetters: new Map(),
        correctLetters: [' ', ' ', ' ', ' ', ' ']
    };
    for (let [guessNum, guess] of boardState.entries()) {
        if (guess === '') continue;
        for (let [index, evaluation] of evaluations[guessNum].entries()) {
            let letter = guess[index];
            switch (evaluation) {
                case States.CORRECT:
                    state.correctLetters[index] = letter;
                    break;
                case States.PRESENT:
                    let presentLocations = state.presentLetters.get(letter) ?? [];
                    presentLocations.push(index);
                    state.presentLetters.set(letter, presentLocations);
                    break;
                case States.ABSENT:
                    // edge case with multiple letters
                    if (!state.presentLetters.has(letter) && !state.correctLetters.includes(letter)) {
                        state.absentLetters.add(letter);
                    }
                    break;
            }
        }
    }
    return Array.from(getPossibleWords(state));
}

// Listen to keyboard enters to update
document.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
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
