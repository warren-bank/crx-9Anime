### [9Anime](https://github.com/warren-bank/crx-9Anime/tree/webmonkey-userscript/es5)

[Userscript](https://github.com/warren-bank/crx-9Anime/raw/webmonkey-userscript/es5/webmonkey-userscript/9Anime.user.js) to run in both:
* the [WebMonkey](https://github.com/warren-bank/Android-WebMonkey) application for Android
* the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) web browser extension for Chrome/Chromium

Its purpose is to:
* simplify [_9anime.se_](https://9anime.se/) website for speed and usability
  - when a page for an anime series is loaded, display a list of all available episodes
  - when an episode is selected, display a list of all available servers
  - when a server is selected:
    * in _WebMonkey_:
      - open a video player hosted by the chosen server in the top-most window
    * in other userscript execution environments:
      - open a video player hosted by the chosen server in an iframe

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
