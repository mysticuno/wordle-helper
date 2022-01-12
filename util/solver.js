// Wordle Solver
// import { ANSWER_WORDS } from "./wordlist";

// Util for set intersections
function intersection(setA, setB) {
    let _intersection = new Set()
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem)
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
function getWordsWithPresentLetters(presentLetters = []) {
    return new Set(ANSWER_WORDS.filter(word => {
        for (const letter of presentLetters) {
            if (!(word.includes(letter))) {
                return false;
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

function gameResult(answer, guess, gameState = {
    absentLetters: new Set(),
    presentLetters: new Set(),
    correctLetters: [' ', ' ', ' ', ' ', ' '] // default to empty
}) {
    for (let [index, letter] of guess.split('').entries()) {
        if (!(answer.includes(letter))){
            gameState.absentLetters.add(letter);
        } else if (answer[index] === letter) {
            gameState.correctLetters[index] = letter;
        } else {
            gameState.presentLetters.add(letter);
        }
    }
    return gameState;
}

// Get possible guess words given the current state
function getPossibleWords({
    absentLetters = new Set(),
    presentLetters = new Set(),
    correctLetters = [' ', ' ', ' ', ' ', ' '] // default to empty
} = {}) {
    absent = getWordsWithoutAbsentLetters(absentLetters);
    present = getWordsWithPresentLetters(presentLetters);
    correct = getWordsWithCorrectLetters(correctLetters);
    return intersection(present, intersection(correct, absent));
}

// console.log('content? doc', document)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('req', request, 'word', ANSWER_WORDS[0], sender, sendResponse)
    console.log(localStorage.gameState)
    sendResponse({word: ANSWER_WORDS[0]})
    return true;
});