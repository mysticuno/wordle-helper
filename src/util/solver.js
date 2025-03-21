const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Initialize cache with a reasonable size limit
const wordCache = new CacheManager(1000);

/**
 * Computes the intersection of two Sets
 * @param {Set} setA - First set
 * @param {Set} setB - Second set
 * @returns {Set} Intersection of the two sets
 */
function intersection(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

/**
 * Returns a random element from an array
 * @param {Array} arr - Array to choose from
 * @returns {*} Random element from the array
 */
function choice(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

/**
 * Returns words that contain the present letters in incorrect positions
 * @param {Map<string, number[]>} presentLetters - Map of letters to their incorrect positions
 * @returns {Set<string>} Set of words that match the criteria
 */
function getWordsWithPresentLetters(presentLetters = new Map()) {
    const cacheKey = `present_${JSON.stringify(Array.from(presentLetters.entries()))}`;
    const cached = wordCache.get(cacheKey);
    if (cached) return cached;

    const result = new Set(ANSWER_WORDS.filter(word => {
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

    wordCache.set(cacheKey, result);
    return result;
}

/**
 * Returns words that contain the correct letters in the right places
 * @param {Array<string>} guesses - Array of correct letters in their positions
 * @returns {Set<string>} Set of words that match the criteria
 */
function getWordsWithCorrectLetters(guesses = []) {
    const cacheKey = `correct_${guesses.join('')}`;
    const cached = wordCache.get(cacheKey);
    if (cached) return cached;

    const result = new Set(ANSWER_WORDS.filter(word => {
        for (const [index, letter] of guesses.entries()) {
            if (letter !== ' ' && !(word[index] === letter)) {
                return false;
            }
        }
        return true;
    }));

    wordCache.set(cacheKey, result);
    return result;
}

/**
 * Returns words that don't contain incorrectly guessed letters
 * @param {Set<string>} absentLetters - Set of letters that are not in the word
 * @returns {Set<string>} Set of words that match the criteria
 */
function getWordsWithoutAbsentLetters(absentLetters = []) {
    const cacheKey = `absent_${Array.from(absentLetters).sort().join('')}`;
    const cached = wordCache.get(cacheKey);
    if (cached) return cached;

    const result = new Set(ANSWER_WORDS.filter(word => {
        for (const absent of absentLetters) {
            if (word.includes(absent)) {
                return false;
            }
        }
        return true;
    }));

    wordCache.set(cacheKey, result);
    return result;
}

/**
 * Simulates one turn of Wordle for testing purposes
 * @param {string} answer - The correct word
 * @param {string} guess - The guessed word
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state
 */
function gameResult(answer, guess, gameState = {
    absentLetters: new Set(),
    presentLetters: new Map(),
    correctLetters: [...GAME_CONFIG.DEFAULT_CORRECT_LETTERS]
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

/**
 * Gets possible guess words given the current game state
 * @param {Object} state - Current game state
 * @returns {Set<string>} Set of possible words
 */
function getPossibleWords({
    absentLetters = new Set(),
    presentLetters = new Map(),
    correctLetters = [...GAME_CONFIG.DEFAULT_CORRECT_LETTERS],
    priorGuesses = new Set()
} = {}) {
    const cacheKey = `possible_${JSON.stringify({
        absent: Array.from(absentLetters),
        present: Array.from(presentLetters.entries()),
        correct: correctLetters,
        prior: Array.from(priorGuesses)
    })}`;

    const cached = wordCache.get(cacheKey);
    if (cached) return cached;

    const absent = getWordsWithoutAbsentLetters(absentLetters);
    const present = getWordsWithPresentLetters(presentLetters);
    const correct = getWordsWithCorrectLetters(correctLetters);
    const possible = intersection(present, intersection(correct, absent));

    // Remove already guessed words if necessary
    if (possible.size > 1) {
        priorGuesses.forEach(word => possible.delete(word));
    }

    wordCache.set(cacheKey, possible);
    return possible;
}

// Get whether the user has dark mode and high contrast mode enabled
function getColorSettings() {
    // Settings for dark mode and high contrast are undefined until explicitly toggled
    const WordleSettingsKey = Object.keys(window.localStorage).filter(s => s.startsWith(GAME_CONFIG.WORDLE_SETTINGS_PREFIX))[0]
    const settingsString = window.localStorage[WordleSettingsKey] ?? "{}";
    const settings = JSON.parse(settingsString) ?? {};
    // The settings object is now an object of the form {states: [{data: {darkMode: true}}]}
    const DarkMode = settings?.states?.[0]?.data?.darkMode ?? false;
    const HighContrast = settings?.states?.[0]?.data?.colorblindMode ?? false;
    return {
        DarkMode,
        HighContrast
    };
}

// Validate game state object
function validateGameState(state) {
    if (!state || typeof state !== 'object') {
        throw new Error('Invalid game state: state must be an object');
    }

    if (!(state.absentLetters instanceof Set)) {
        throw new Error('Invalid game state: absentLetters must be a Set');
    }

    if (!(state.presentLetters instanceof Map)) {
        throw new Error('Invalid game state: presentLetters must be a Map');
    }

    if (!Array.isArray(state.correctLetters) || state.correctLetters.length !== GAME_CONFIG.WORD_LENGTH) {
        throw new Error('Invalid game state: correctLetters must be an array of length 5');
    }

    if (!(state.priorGuesses instanceof Set)) {
        throw new Error('Invalid game state: priorGuesses must be a Set');
    }

    return state;
}

// Safely get guesses from DOM
function getGuessesFromDOM() {
    try {
        // NYT no longer stores the game state in local storage, so we must determine
        // the game state based on the HTML classes
        const elements = document.querySelectorAll('[aria-roledescription="tile"]');

        return Array.from(elements)
            .slice(0, GAME_CONFIG.MAX_DOM_ELEMENTS)
            .map(item => item.ariaLabel)
            .filter(Boolean);
    } catch (error) {
        console.error('Error getting guesses from DOM:', error);
        return [];
    }
}

// Safely parse guess state
function parseGuessState(guess) {
    try {
        const [, letter, evaluation] = guess.toLowerCase().split(', ');
        if (!letter || !evaluation) {
            throw new Error(`Invalid guess format: ${guess}`);
        }
        return { letter, evaluation };
    } catch (error) {
        console.error('Error parsing guess state:', error);
        return null;
    }
}

// Given the game state, compute the list of possible words
function solve() {
    try {
        const guesses = getGuessesFromDOM();
        if (!guesses.length) {
            return [];
        }

        // Change 1x30 array into 6x5 array
        const boardState = guesses.reduce((rows, key, index) => {
            if (index % GAME_CONFIG.WORD_LENGTH === 0) {
                rows.push([key]);
            } else {
                rows[rows.length - 1].push(key);
            }
            return rows;
        }, []);

        let state = {
            absentLetters: new Set(),
            presentLetters: new Map(),
            correctLetters: [...GAME_CONFIG.DEFAULT_CORRECT_LETTERS],
            priorGuesses: new Set()
        };

        for (const row of boardState) {
            if (row[0] === States.EMPTY) break; // We can stop as soon as we see one empty box

            // Evaluate correct letters first
            const wordBuilder = [];
            for (const [index, guess] of row.entries()) {
                const parsed = parseGuessState(guess);
                if (!parsed) continue;

                const { letter, evaluation } = parsed;
                wordBuilder.push(letter);

                if (evaluation === States.CORRECT) {
                    state.correctLetters[index] = letter;
                }
            }

            // Build word and keep track of it
            const word = wordBuilder.join('');
            if (word.length === GAME_CONFIG.WORD_LENGTH) {
                state.priorGuesses.add(word);
            }

            // Evaluate present letters
            for (const [index, guess] of row.entries()) {
                const parsed = parseGuessState(guess);
                if (!parsed || parsed.evaluation !== States.PRESENT) continue;

                const presentLocations = state.presentLetters.get(parsed.letter) ?? [];
                presentLocations.push(index);
                state.presentLetters.set(parsed.letter, presentLocations);
            }

            // Evaluate absent letters
            for (const guess of row) {
                const parsed = parseGuessState(guess);
                if (!parsed || parsed.evaluation !== States.ABSENT) continue;

                // Handle edge case with multiple letters
                if (!state.correctLetters.includes(parsed.letter) && 
                    !state.presentLetters.has(parsed.letter)) {
                    state.absentLetters.add(parsed.letter);
                }
            }
        }

        // Validate state before getting possible words
        validateGameState(state);
        return Array.from(getPossibleWords(state));
    } catch (error) {
        console.error('Error in solver:', error);
        return [];
    }
}

// Listen to keyboard enters to update
document.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
        try {
            // Wait 2 seconds for the animation to finish before updating state
            await new Promise(r => setTimeout(r, GAME_CONFIG.ANIMATION_DELAY));

            const possible = solve();
            const settings = getColorSettings();

            if (possible.length > 0) {
                browserAPI.runtime.sendMessage({
                    possible,
                    settings
                });
            }
        } catch (error) {
            console.error('Error handling Enter key:', error);
        }
    }
});

// Listen to message from popup.js and respond
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        const possible = solve();
        const settings = getColorSettings();
        sendResponse({ possible, settings });
    } catch (error) {
        console.error("Error handling message:", error);
        sendResponse({ possible: [], settings: { DarkMode: false, HighContrast: false } });
    }
    return true; // Keep the message channel open for async response
});

// Run when wordle page first opens
try {
    const possible = solve();
    const settings = getColorSettings();

    if (possible.length > 0) {
        browserAPI.runtime.sendMessage({
            possible,
            settings
        });
    }
} catch (error) {
    console.error("Error on initial load:", error);
}
