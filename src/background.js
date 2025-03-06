const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Set badge text and icon whenever we update
browserAPI.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (sender.tab) {
      browserAPI.action.setBadgeText({ text: `${request.possible.length}`, tabId: sender.tab.id });
      const hc = request.settings.HighContrast;
      browserAPI.action.setBadgeBackgroundColor({
        color: hc ? '#f5793a' : '#538d4e'
      });
      browserAPI.action.setIcon({
        path:  {
          "16": `/images/icon-16${hc ? '-hc' : ''}.png`,
          "32": `/images/icon-32${hc ? '-hc' : ''}.png`,
          "48": `/images/icon-48${hc ? '-hc' : ''}.png`,
          "64": `/images/icon-64${hc ? '-hc' : ''}.png`,
          "128": `/images/icon-128${hc ? '-hc' : ''}.png`
        },
        tabId: sender.tab.id
      });
    }
    return true;
  }
);