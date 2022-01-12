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
  let res = chrome.tabs.sendMessage(tab.id, {
    tabTitle: tab.title
  }, res => {
    console.log(res)
  });
  // chrome.scripting.executeScript({
    // target: { tabId: tab.id },
    // function: setPageBackgroundColor,
  // });
});



// The body of this function will be executed as a content script inside the
// current page
// async function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
//     console.log('color changed')
//   });
// }

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

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM loaded")
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let res = chrome.tabs.sendMessage(tab.id, {
    tabTitle: tab.title
  }, res => {
    console.log('res from background', res)

    chrome.action.setBadgeText({text: `${res.possible.length || 1}`, tabId: tab.id})

  });
})