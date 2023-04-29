// ==UserScript==
// @name         Currrent Played
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Watch yandex music track changes and report it to localhost server
// @author       iliser
// @match        https://music.yandex.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yandex.ru
// @connect      localhost
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";
  function getTrackName() {
    return window.top.document.querySelector(".track__name-innerwrap")
      ?.innerText;
  }

  function getArtists() {
    return window.top.document.querySelector(".track__artists")?.innerText;
  }

  function getCover() {
    return window.top.document.querySelector(
      ".track_type_player .entity-cover__image.deco-pane"
    )?.src;
  }

  let trackName = null;
  let artistName = null;

  function update() {
    const track = getTrackName();
    const artist = getArtists();
    const cover = getCover();

    if (trackName == track && artistName == artist) return;
    trackName = track;
    artistName = artist;

    var requestDetails = {
      method: "POST",
      url: "http://localhost:3333/update",
      data: JSON.stringify({
        track,
        artist,
        cover,
      }),
      headers: { "Content-Type": "application/json" },
      overrideMimeType: "application/json",
    };
    console.log(`Report track to server: ${track} - ${artist}`);
    GM_xmlhttpRequest(requestDetails);
  }

  setInterval(update, 5000);
})();
