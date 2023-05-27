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

  const document = window.top.document;

  function getTrackName() {
    return document.querySelector(".track__name-innerwrap")?.innerText;
  }

  function getArtists() {
    return document.querySelector(".track__artists")?.innerText;
  }

  function getCover() {
    return document
      .querySelector(".track_type_player .entity-cover__image.deco-pane")
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
      `Report state to server: ${
        isPaused ? "pause" : "play"
      } ${track} - ${artist}`
    );
    if (isPaused) {
      GM_xmlhttpRequest({
        method: "POST",
        url: `${server}/update`,
        data: JSON.stringify({ type: "clear" }),
        headers: { "Content-Type": "application/json" },
        overrideMimeType: "application/json",
      });
    } else {
      GM_xmlhttpRequest({
        method: "POST",
        url: `${server}/update`,
        data: JSON.stringify({
          type: "update",
          track,
          artist,
          cover,
        }),
        headers: { "Content-Type": "application/json" },
        overrideMimeType: "application/json",
      });
    }
  }

  setInterval(update, 5000);
})();
