// ==UserScript==
// @name         Yandex Music watcher
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Watch yandex music track changes and report it to localhost server
// @author       iliser
// @match        https://music.yandex.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=music.yandex.ru
// @connect      localhost
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";
  const server = "http://localhost:3333";

  const document = window.top?.document;

  function getTrackName() {
    return document?.querySelector(".track__name-innerwrap")?.innerText;
  }

  function getArtists() {
    return document?.querySelector(".track__artists")?.innerText;
  }

  function getCover() {
    return document
      ?.querySelector(".track_type_player .entity-cover__image.deco-pane")
      ?.src?.replace("50x50", "400x400");
  }

  function getIsPaused() {
    return !(document.querySelector(".player-controls__btn_pause") != null);
  }

  let trackName = null;
  let artistName = null;
  let isPaused = true;

  function update() {
    const track = getTrackName();
    const artist = getArtists();
    const cover = getCover();
    const _isPaused = getIsPaused();

    const isChanged =
      trackName != track || artistName != artist || _isPaused != isPaused;

    if (!isChanged) return;
    trackName = track;
    artistName = artist;
    isPaused = _isPaused;

    console.log(
      `http: report state to server: ${
        isPaused ? "pause" : "play"
      } ${track} - ${artist}`
    );

    GM_xmlhttpRequest({
      method: "POST",
      url: `${server}/update`,
      data: JSON.stringify(
        isPaused
          ? { type: "clear" }
          : {
              type: "update",
              track,
              artist,
              cover,
            }
      ),
      headers: { "Content-Type": "application/json" },
      overrideMimeType: "application/json",
    });
  }

  const observeDOM = (function () {
    const MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver;

    return function (obj, callback) {
      if (!obj || obj.nodeType !== 1) return;

      if (MutationObserver) {
        // define a new observer
        var mutationObserver = new MutationObserver(callback);

        // have the observer observe for changes in children
        mutationObserver.observe(obj, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        return mutationObserver;
      }

      // browser support fallback
      else if (window.addEventListener) {
        obj.addEventListener("DOMNodeInserted", callback, false);
        obj.addEventListener("DOMNodeRemoved", callback, false);
      }
    };
  })();

  observeDOM(
    document.querySelector("div.player-controls__btn_play"),
    function (_) {
      console.log("event: play/pause");
      setTimeout(update,30);
    }
  );

  observeDOM(
    document.querySelector("div.player-controls__track-container"),
    function (_) {
      console.log("event: track changed");
      setTimeout(update,30);
    }
  );

  // setInterval(update, 5000);
})();
