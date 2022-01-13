// Run when the popup is clicked 
document.addEventListener('DOMContentLoaded', async () => {
  const numWords = document.getElementById('numWords');
  const possibleHTML = document.getElementById('possible');

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.sendMessage(tab.id, {}, ({ possible }) => {
    numWords.innerHTML = `<b>${possible.length}</b>`;
    possibleHTML.innerHTML = possible.join(', ').toUpperCase();
    chrome.action.setBadgeText({ text: `${possible.length || 1}`, tabId: tab.id })
  });
})