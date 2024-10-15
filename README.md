# Wordle Helper
<p align="center">
  <img src="./logo.png" alt="Wordle Helper logo">
</p>

[Wordle](https://www.nytimes.com/games/wordle/index.html) is taking Twitter by storm, so I decided to take this opportunity to make something fun and slightly useful and learn how to make a Chrome extension. You can download the Chrome extension **[here](https://chrome.google.com/webstore/detail/wordle-helper/lcoapaclmojlnbjipmpfibcjomncgdod)**.

## Demo
The extension will narrow down the possible words based on the game state. Click on the extension to see the count and list of possible answer words remaining. The list of possible answers will update as you enter guesses.
<p align="center">
  <img src="https://user-images.githubusercontent.com/6826622/207509813-c3d722d8-4274-4455-9bf2-47264a2639ff.gif" alt="A GIF of the Wordle extension being used and changing colors to match the user's settings">
</p>

https://user-images.githubusercontent.com/6826622/154155028-9e1221c9-7afb-4788-abfc-e8a40b6ccac7.mp4


### Setup
You can download the Chrome extension **[here](https://chrome.google.com/webstore/detail/wordle-helper/lcoapaclmojlnbjipmpfibcjomncgdod)**, or you can clone the repo and load it as an **[unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/)**. Please [leave a review](https://chromewebstore.google.com/detail/wordle-helper/lcoapaclmojlnbjipmpfibcjomncgdod/reviews) if you enjoy the extension!

Both **dark mode** and **high contrast mode** are supported based on the settings used on Wordle.

![Wordle and extension in dark mode](https://github.com/user-attachments/assets/b50cfd06-f65a-408a-928b-4572ddda4de7)

![Wordle and extension in high contrast mode](https://user-images.githubusercontent.com/6826622/155425401-90599b33-e631-4fec-82a2-35240b7fd2ea.png)

### Updating the extension (Chrome Web Store)
Once the extension is ready for publishing, you need to zip the file up for upload to the Chrome Web Store via the Developer Console, which can be done via the following command from the project root:
```
zip wordle-helper.zip -r * -x .git/* -x *.png -x LICENSE -x README.md
```

From there upload the zip file to the devconsole and begin the review process. Don't forget to bump the version number in [manifest.json](manifest.json)!
