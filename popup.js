// When the popup is clicked, run 
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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.test === "hello")
      sendResponse({farewell: "goodbye"});
  }
);