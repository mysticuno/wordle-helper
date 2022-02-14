// Set badge text and icon whenever we update
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (sender.tab) {
      chrome.action.setBadgeText({ text: `${request.possible.length}`, tabId: sender.tab.id });
      const hc = request.settings.HighContrast;
      chrome.action.setBadgeBackgroundColor({
        color: hc ? '#f5793a' : '#538d4e'
      });
      chrome.action.setIcon({
        path:  {
          "16": `/images/icon-16${hc ? '-hc' : ''}.png`,
          "32": `/images/icon-32${hc ? '-hc' : ''}.png`,
          "48": `/images/icon-48${hc ? '-hc' : ''}.png`,
          "128": `/images/icon-128${hc ? '-hc' : ''}.png`
        },
        tabId: sender.tab.id
      });
    }
    return true;
  }
);