// When the popup is clicked, run 
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Popup DOM loaded")
  const numWords = document.getElementById('numWords');
  const possibleHTML = document.getElementById('possible');

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('sending message from popup.js')
  await chrome.tabs.sendMessage(tab.id, {
    tabTitle: tab.title
  }, ({suggestion, possible}) => {
    console.log('res from background.js', possible, suggestion);
    numWords.innerHTML = `<b>${possible.length}</b>`;
    possibleHTML.innerHTML = possible.join(', ');
    chrome.action.setBadgeText({text: `${possible.length || 1}`, tabId: tab.id})

  });
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.test === "hello")
      sendResponse({farewell: "goodbye"});
  }
);