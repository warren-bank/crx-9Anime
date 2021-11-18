### [9Anime.vc](https://github.com/warren-bank/crx-9Anime-vc/tree/webmonkey-userscript/es5)

[Userscript](https://github.com/warren-bank/crx-9Anime-vc/raw/webmonkey-userscript/es5/webmonkey-userscript/9Anime-vc.user.js) to run in both:
* the [WebMonkey](https://github.com/warren-bank/Android-WebMonkey) application for Android
* the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) web browser extension for Chrome/Chromium

Its purpose is to:
* simplify [_9anime.vc_](https://9anime.vc/) website for speed and usability
  - when a page for an anime series is loaded, display a list of all available episodes
  - when an episode is selected, display a list of all available servers
  - when a server is selected:
    * in _WebMonkey_:
      - open a video player hosted by the chosen server in the top-most window
    * in other userscript execution environments:
      - open a video player hosted by the chosen server in an iframe

#### Website Domain Disambiguation:

* [9anime.me](https://9anime.me/) lists the domains that mirror the official _9Anime_ website
  - currently:
    * [9anime.to](https://9anime.to/)
    * [9anime.id](https://9anime.id/)
* [_9anime.vc_](https://9anime.vc/) is a [fake mirror](https://www.reddit.com/r/9anime/comments/q5hk84/whats_the_difference_between_9animevc_and_9animeto/)
  - pros:
    * it has a higher Google search rank
      - which is why I ended up spending time on this userscript in the first place.. by mistake
    * it has excellent content
      - though significantly less than the official _9Anime_ website
    * it has a backend API that is easy to use
      - which is not identical to the official _9Anime_ website

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
