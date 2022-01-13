// Shuffle the suggestions given
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

// Run when the popup is clicked 
document.addEventListener('DOMContentLoaded', async () => {
  const numWords = document.getElementById('numWords');
  const possibleHTML = document.getElementById('possible');

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.sendMessage(tab.id, {}, ({ possible }) => {
    shuffleArray(possible);
    numWords.innerHTML = `${possible.length} possible word${possible.length > 1 ? 's' : ''}`;
    const suggestions = possible.map(word => `${word.toUpperCase()}`).join(', ');
    possibleHTML.innerHTML = suggestions;
    chrome.action.setBadgeText({ text: `${possible.length || 1}`, tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#538d4e' });
  });
})