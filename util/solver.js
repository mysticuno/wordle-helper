// Wordle Solver
import { VALID_WORDS, ANSWER_WORDS, NONANSWER_WORDS } from "./wordlist";
// Wordle hint? Take a word that is in answer words?
// keep track of solved state to see how to get words?
// absent, correct, present



// Return words that contain the present letters
function getWordsWithPresentLetters(presentLetters = []) {
    return ANSWER_WORDS.filter(word => {
        for (const letter of presentLetters) {
            if (!(word.includes(letter))) {
                return false;
            }
        }
        return true;
    });
}

// Return words that contain the correct letters in the right places
function getWordsWithCorrectLetters(guesses = [{letter, position}]= [{}]) {
    return ANSWER_WORDS.filter(word => {
        for (const {letter, position} of guesses) {
            if (!(word[position] === letter)) {
                return false;
            }
            return true;
        }
    });
}

// Return words that don't contain incorrectly guessed letters
function getWordsWithoutAbsentLetters(absentLetters = []) {
    return ANSWER_WORDS.filter(word => {
        for (const absent of absentLetters) {
            if (word.includes(absent)) {
                return false;
            }
        }
        return true;
    });
}

function choice(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

word = choice(ANSWER_WORDS);
function gameResult(answer, guess, gameState = {
    absentLetters = [],
    presentLetters = [],
    correctLetters = [{letter, position} = {}]
}) {
    for (let [index, letter] of guess.split('').entries()) {
        if (!(answer.includes(letter))){
            gameState.absentLetters.push(letter);
        } else {
            if (answer[index] === letter) {
                gameState.correctLetters
            }
        }
    }
    return gameState;
}

// wordle plus plus
// Play future/past wordles? just iterate through the array
// See possible word bank?
// Get test word?