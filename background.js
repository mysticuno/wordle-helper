let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
  // console.log("possible", getPossibleWords);
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension", sender);
    if (sender.tab) {
      console.log('request', request);
      chrome.action.setBadgeText({text: `${request.length}`, tabId: sender.tab.id})
    }
    return true;
  }
);