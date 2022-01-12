// importScripts('./util/wordlist.js', './util/solver.js')

chrome.action.onClicked.addListener((tab) => {
  console.log('ext clicked?', tab)
})

// chrome.commands.onCommand.addListener((command) => {
//   console.log("got command", command);
//   switch (command) {
//     case 'get-possible-words':
//       let words = getPossibleWords();
//       console.log("words", words);
//       break;
//     default:
//       console.log(`${command} not found`)
//   }
// });



let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
  // console.log("possible", getPossibleWords);
});