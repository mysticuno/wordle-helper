// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");
let gameState = {}
// import { getPossibleWords } from './util/solver'

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let res =  chrome.tabs.sendMessage(tab.id, {
      tabTitle: tab.title
    }, res => {
      console.log(res)
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: setPageBackgroundColor,
    });
  });
  
  // The body of this function will be executed as a content script inside the
  // current page
  async function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
      document.body.style.backgroundColor = color;
      console.log('color changed')
    });
  }


function solve() {
  // this line, when in popup.js, results in gameState being undefined, so we end up with a json parse error
  let {boardState, evaluations, hardMode, solution} = JSON.parse(window.localStorage.gameState);
  let state = {absentLetters: new Set(), presentLetters: new Set(), correctLetters: [' ', ' ', ' ', ' ', ' ']}
  for (let [guessNum, guess] of boardState.entries()) {
    console.log('guess', guess,'guessnum', guessNum)
    if (guess === '') continue;
    for (let [index, evaluation] of evaluations[guessNum].entries()) {
      console.log('index', index,'evaluation', evaluation, 'evals[guessnum]', evaluations[guessNum])
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
    console.log(state);
  }

  // console.log(getPossibleWords(state))
  chrome.storage.sync.get("gameState", (data) => {
    console.log('getting gamestate');
    // console.log("gameState data", JSON.parse(window.localStorage.gameState))
  })
}

changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   files: ['./util/solver.js']
  //   })
  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   function: solve
  //   })
  console.log('calling solve');
  // solve();
})

