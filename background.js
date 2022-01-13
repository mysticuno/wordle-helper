// Set badge text whenever we update
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (sender.tab) {
      chrome.action.setBadgeText({ text: `${request.length}`, tabId: sender.tab.id })
    }
    return true;
  }
);