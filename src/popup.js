const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Shuffle the suggestions given
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

// Update the icon image and badge based on settings
function updateIcon(settings, numWords, tabId) {
  const hc = settings.HighContrast;
  browserAPI.action.setIcon({
    path:  {
      "16": `/images/icon-16${hc ? '-hc' : ''}.png`,
      "32": `/images/icon-32${hc ? '-hc' : ''}.png`,
      "48": `/images/icon-48${hc ? '-hc' : ''}.png`,
      "64": `/images/icon-64${hc ? '-hc' : ''}.png`,
      "128": `/images/icon-128${hc ? '-hc' : ''}.png`
    },
    tabId
  });
  browserAPI.action.setBadgeText({ text: `${numWords || 1}`, tabId });
  browserAPI.action.setBadgeBackgroundColor({ color: hc ? '#f5793a' : '#538d4e' });
}

// Update the popup colors based on dark mode and contrast settings
function updateColors(settings) {
  const bodyClasses = document.body.classList;
  if (settings.DarkMode) {
    bodyClasses.remove('lightmode');
    bodyClasses.add('darkmode');
  } else {
    bodyClasses.remove('darkmode');
    bodyClasses.add('lightmode');
  }

  if (settings.HighContrast) {
    bodyClasses.remove('nocontrast');
    bodyClasses.add('highcontrast');
  } else {
    bodyClasses.remove('highcontrast');
    bodyClasses.add('nocontrast');
  }
}

// Run when the popup is clicked and elements are loaded
document.addEventListener('DOMContentLoaded', async () => {
  const numWords = document.getElementById('numWords');
  const possibleHTML = document.getElementById('possible');

  let [tab] = await browserAPI.tabs.query({
    active: true,
    currentWindow: true,
    url: "https://www.nytimes.com/games/wordle/index.html*"
  });

  // Try to get results only if on NYT page
  if (tab) {
    // Send empty message to solver.js to get state and update
    await browserAPI.tabs.sendMessage(tab.id, {}, ({ possible={}, settings={} }) => {
      shuffleArray(possible);
      numWords.textContent = `${possible.length} possible word${possible.length === 1 ? '' : 's'}`;
      const suggestions = possible.map(word => `${word.toUpperCase()}`).join(', ');
      possibleHTML.textContent = suggestions;

      updateIcon(settings, possible.length, tab.id);
      updateColors(settings);
    });
  }
})

