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

// Simulate one turn of Wordle
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

function solve(gameState = {}) {
    let {boardState=[], evaluations=[], solution=''} = JSON.parse(window.localStorage.gameState);
    let state = {absentLetters: new Set(), presentLetters: new Set(), correctLetters: [' ', ' ', ' ', ' ', ' ']}
    for (let [guessNum, guess] of boardState.entries()) {
      if (guess === '') continue;
      for (let [index, evaluation] of evaluations[guessNum].entries()) {
        let letter = guess[index];
        switch (evaluation) {
          case "correct":
            state.correctLetters[index] = letter;
            break;
          case "present":
            state.presentLetters.add(letter);
            break;
          case "absent":
            state.absentLetters.add(letter)
            break;
        }
      }
    }
    console.log('solution state', state);
    let possible = getPossibleWords(state);
    console.log(possible);
    return Array.from(possible);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let gameState;
    try {
        gameState = JSON.parse(localStorage.gameState);
        console.log('Game State', gameState);
        let [suggestion, ...possible] = solve(gameState);
        possible = possible || [suggestion];
        console.log(`sug ${suggestion} poss ${possible}`)
        console.log('req', request, 'word', ANSWER_WORDS[0], sender, sendResponse)
        console.log(localStorage.gameState)
        sendResponse({suggestion, possible})
    } catch (e) {
        console.error("encountered JSON parse error", e);
    }
});