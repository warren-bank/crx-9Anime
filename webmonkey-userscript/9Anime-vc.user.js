// ==UserScript==
// @name         9Anime.vc
// @description  Simplify website for speed and usability.
// @version      1.0.3
// @match        *://9anime.vc/*
// @match        *://*.9anime.vc/*
// @icon         https://9anime.vc/images/favicon.png
// @run-at       document-end
// @grant        unsafeWindow
// @homepage     https://github.com/warren-bank/crx-9Anime-vc/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-9Anime-vc/issues
// @downloadURL  https://github.com/warren-bank/crx-9Anime-vc/raw/webmonkey-userscript/es5/webmonkey-userscript/9Anime-vc.user.js
// @updateURL    https://github.com/warren-bank/crx-9Anime-vc/raw/webmonkey-userscript/es5/webmonkey-userscript/9Anime-vc.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- constants

var constants = {
  "dom_ids": {
    "div_root":      "app_9anime_container",
    "div_episodes":  "episodes_list_container",
    "div_servers":   "servers_list_container",
    "div_iframe":    "iframe_container"
  }
}

// ----------------------------------------------------------------------------- global state

var state = {
  "series_id":       null,
  "episode_id":      null,
  "token": {
    "recaptcha_key": null
  },
  "did": {
    "init":          false,
    "process": {
      "episodes":    false,
      "servers":     false
    }
  }
}

// ----------------------------------------------------------------------------- helpers

// make GET request, pass plaintext response to callback
var download_text = function(url, headers, callback) {
  var xhr = new unsafeWindow.XMLHttpRequest()
  xhr.open("GET", url, true, null, null)

  if (headers && (typeof headers === 'object')) {
    var keys = Object.keys(headers)
    var key, val
    for (var i=0; i < keys.length; i++) {
      key = keys[i]
      val = headers[key]
      xhr.setRequestHeader(key, val)
    }
  }

  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(xhr.responseText)
      }
    }
  }

  xhr.send()
}

var download_json = function(url, headers, callback) {
  download_text(url, headers, function(text){
    try {
      callback(JSON.parse(text))
    }
    catch(e) {}
  })
}

// -----------------------------------------------------------------------------

var make_element = function(elementName, html) {
  var el = unsafeWindow.document.createElement(elementName)

  if (html)
    el.innerHTML = html

  return el
}

var make_div  = function(html) {return make_element('div',  html)}
var make_span = function(text) {return make_element('span', text)}

// -----------------------------------------------------------------------------

var cancel_event = function(event){
  event.stopPropagation();event.stopImmediatePropagation();event.preventDefault();event.returnValue=false;
}

// ----------------------------------------------------------------------------- URL redirect

var redirect_to_url = function(url) {
  if (!url) return

  if (typeof GM_loadUrl === 'function') {
    if (typeof GM_resolveUrl === 'function')
      url = GM_resolveUrl(url, unsafeWindow.location.href) || url

    GM_loadUrl(url, 'Referer', unsafeWindow.location.href)
  }
  else {
    try {
      unsafeWindow.top.location = url
    }
    catch(e) {
      unsafeWindow.window.location = url
    }
  }
}

// ----------------------------------------------------------------------------- determine static XHR parameters

var determine_series_id = function() {
  var match, div

  if (!state.series_id) {
    match = (/-(\d+)$/).exec(window.location.pathname)

    if (match)
      state.series_id = match[1]
  }

  if (!state.series_id) {
    div = unsafeWindow.document.querySelector('div[data-page="watch"][data-id]')

    state.series_id = div ? div.getAttribute('data-id') : null
  }
}

var determine_episode_id = function() {
  var match

  if (!state.episode_id) {
    match = (/(?:^|[\?&])ep=(\d+)/i).exec(window.location.search)

    if (match)
      state.episode_id = match[1]
  }
}

var determine_static_xhr_parameters = function() {
  determine_series_id()
  if (!state.series_id) return

  determine_episode_id()
}

// ----------------------------------------------------------------------------- reinitialize dom

var reset_dom = function() {
  var $recaptcha_script, recaptcha_src

  state.token.recaptcha_key = unsafeWindow.recaptchaSiteKey
  $recaptcha_script = unsafeWindow.document.querySelector('script[src*="google.com/recaptcha/api.js"]')
  if ($recaptcha_script) {
    recaptcha_src     = $recaptcha_script.getAttribute('src')
    $recaptcha_script = null
  }

  delete unsafeWindow.window.grecaptcha

  unsafeWindow.document.close()
  unsafeWindow.document.write('')
  unsafeWindow.document.close()

  if (recaptcha_src) {
    $recaptcha_script = make_element('script')
    $recaptcha_script.setAttribute('src', recaptcha_src)
    unsafeWindow.document.body.appendChild($recaptcha_script)
  }
}

var reinitialize_dom = function() {
  reset_dom()

  var head = unsafeWindow.document.getElementsByTagName('head')[0]
  var body = unsafeWindow.document.body
  var html, $style, $div_root

  html = {
    "head": {
      "css": [
        // --------------------------------------------------- CSS: global

        'body {',
        '  background-color: #fff;',
        '}',

        'body > * {',
        '  display: none !important;',
        '}',

        'body > #' + constants.dom_ids.div_root + ' {',
        '  display: block !important;',
        '}',

        // --------------------------------------------------- CSS: list of episodes

        'body > #' + constants.dom_ids.div_root + ' #' + constants.dom_ids.div_episodes + ' > ul > li > a {',
        '  text-decoration: none;',
        '}',

        // --------------------------------------------------- CSS: list of servers

        'body > #' + constants.dom_ids.div_root + ' #' + constants.dom_ids.div_servers + ' > ul,',
        'body > #' + constants.dom_ids.div_root + ' #' + constants.dom_ids.div_servers + ' > ul > li {',
        '  list-style: none;',
        '}',

        'body > #' + constants.dom_ids.div_root + ' #' + constants.dom_ids.div_servers + ' > ul > li,',
        'body > #' + constants.dom_ids.div_root + ' #' + constants.dom_ids.div_servers + ' > ul > li > button {',
        '  display: inline-block;',
        '}',

        'body > #' + constants.dom_ids.div_root + ' #' + constants.dom_ids.div_servers + ' > ul > li > button {',
        '  margin-right: 0.5em;',
        '}',

        // --------------------------------------------------- CSS: iframe

        'body > #' + constants.dom_ids.div_root + ' #' + constants.dom_ids.div_iframe + ' > iframe {',
        '}'
      ]
    },
    "body": {
      "div_root": [
        '  <div id="' + constants.dom_ids.div_episodes + '"><ul></ul></div>',
        '  <div id="' + constants.dom_ids.div_servers  + '"><ul></ul></div>',
        '  <div id="' + constants.dom_ids.div_iframe   + '">',
        '    <iframe src="about:blank" width="100%" height="600" scrolling="no" frameborder="0" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>',
        '  </div>'
      ]
    }
  }

  $style    = make_element('style', html.head.css.join("\n"))
  $div_root = make_element('div',   html.body.div_root.join("\n"))

  $div_root.setAttribute('id', constants.dom_ids.div_root)

  head.appendChild($style)
  body.appendChild($div_root)
}

// ----------------------------------------------------------------------------- determine dynamic XHR parameters

var determine_xhr_token = function(callback) {
  try {
    unsafeWindow.window.grecaptcha.execute(state.token.recaptcha_key, {action: 'get_sources'}).then(function(token) {
      if (token) {
        callback(token)
      }
    })
  }
  catch(e) {}
}

// ----------------------------------------------------------------------------- trigger XHR requests

var trigger_xhr_episodes_list = function() {
  var url = unsafeWindow.location.protocol + '//' + unsafeWindow.location.hostname + '/ajax/episode/list/' + state.series_id

  download_json(url, null, process_xhr_episodes_list)
}

var trigger_xhr_episode_servers = function() {
  if (!state.episode_id) return

  var url = unsafeWindow.location.protocol + '//' + unsafeWindow.location.hostname + '/ajax/episode/servers?episodeId=' + state.episode_id

  download_json(url, null, process_xhr_episode_servers)
}

var trigger_xhr_episode_server_source = function(server_id) {
  if (!server_id) return

  var callback = function(token) {
    var url = unsafeWindow.location.protocol + '//' + unsafeWindow.location.hostname + '/ajax/episode/sources?id=' + server_id + '&_token=' + token

    download_json(url, null, process_xhr_episode_server_source)
  }

  determine_xhr_token(callback)
}

// ----------------------------------------------------------------------------- process XHR responses

var process_xhr_episodes_list = function(data) {
  if (state.did.process.episodes) return
  state.did.process.episodes = true

  try {
    var $container, $a, $li

    // sanitize html
    data.html = data.html.replace(/history\.pushState/g, 'void')

    $container = make_div(data.html)
    $a = $container.querySelectorAll('a[data-id][href]')
    if (!$a.length) return

    $container = unsafeWindow.document.querySelector('#' + constants.dom_ids.div_episodes + ' > ul')
    if (!$container) return

    for (var i=0; i < $a.length; i++) {
      $a[i].innerHTML = [
        $a[i].getAttribute('data-number'),
        $a[i].getAttribute('title')
      ].join(': ')

      $li = make_element('li')

      $li.appendChild($a[i])
      $container.appendChild($li)
    }
  }
  catch(e) {}
}

var process_xhr_episode_servers = function(data) {
  if (state.did.process.servers) return
  state.did.process.servers = true

  try {
    var $container, $div, label, server_id, $button, $li

    // sanitize html
    data.html = data.html.replace(/(\<\/?)(script\>)/g, '$1x-$2')

    $container = make_div(data.html)
    $div = $container.querySelectorAll('div[data-id][data-type][data-server-id]')

    if (!$div.length) return

    $container = unsafeWindow.document.querySelector('#' + constants.dom_ids.div_servers + ' > ul')
    if (!$container) return

    for (var i=0; i < $div.length; i++) {
      label = [
        $div[i].getAttribute('data-type'),
        $div[i].innerText.trim()
      ].join(': ')

      server_id = $div[i].getAttribute('data-id')

      $button = make_element('button', label)
      $button.setAttribute('x-server-id', server_id)
      $button.addEventListener('click', process_episode_server_button_onclick)

      $li = make_element('li')

      $li.appendChild($button)
      $container.appendChild($li)
    }
  }
  catch(e) {}
}

var process_episode_server_button_onclick = function(event) {
  cancel_event(event)

  var $button   = event.target
  var server_id = $button.getAttribute('x-server-id')

  if (server_id)
    trigger_xhr_episode_server_source(server_id)
}

var process_xhr_episode_server_source = function(data) {
  try {
    if ((data.type === 'iframe') && data.link) {
      var video_host_url = data.link

      if (typeof GM_loadUrl === 'function') {
        redirect_to_url(video_host_url)
      }
      else {
        var $iframe = unsafeWindow.document.querySelector('#' + constants.dom_ids.div_iframe + ' > iframe')

        if ($iframe)
          $iframe.setAttribute('src', video_host_url)
      }
    }
  }
  catch(e) {}
}

// ----------------------------------------------------------------------------- bootstrap

var intercept_history_redirects = function() {
  var interceptor = function(state, title, url) {
    if (url !== unsafeWindow.location.href) {
      redirect_to_url(url)
      unsafeWindow.console.log('window.history state has changed')
    }
  }

  if (unsafeWindow.history) {
    unsafeWindow.history.pushState    = interceptor
    unsafeWindow.history.replaceState = interceptor
  }
}

var clear_all_timeouts = function() {
  var maxId = unsafeWindow.setTimeout(function(){}, 1000)

  for (var i=0; i <= maxId; i++) {
    unsafeWindow.clearTimeout(i)
  }
}

var clear_all_intervals = function() {
  var maxId = unsafeWindow.setInterval(function(){}, 1000)

  for (var i=0; i <= maxId; i++) {
    unsafeWindow.clearInterval(i)
  }
}

var init = function() {
  if (('function' === (typeof GM_getUrl)) && (GM_getUrl() !== unsafeWindow.location.href)) {
    redirect_to_url(unsafeWindow.location.href)
    return
  }

  intercept_history_redirects()

  if (unsafeWindow.location.pathname.indexOf('/watch/') !== 0) return

  if (state.did.init) return
  state.did.init = true

  clear_all_timeouts()
  clear_all_intervals()

  determine_static_xhr_parameters()
  if (!state.series_id) return

  reinitialize_dom()
  trigger_xhr_episodes_list()

  if (state.episode_id)
    trigger_xhr_episode_servers()
}

init()

// -----------------------------------------------------------------------------
