(function () {
  window.setupMoviePlayer = function (movieUrl) {
    var player = document.querySelector("[data-player]");

    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var trigger = player.querySelector("[data-play-trigger]");
    var hls = null;
    var loaded = false;

    if (!video || !trigger) {
      return;
    }

    function tryPlay() {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = movieUrl;
        video.addEventListener("loadedmetadata", tryPlay, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(movieUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, tryPlay);
      } else {
        video.src = movieUrl;
        video.addEventListener("loadedmetadata", tryPlay, { once: true });
      }
    }

    function start() {
      loadVideo();
      trigger.classList.add("is-hidden");
      video.focus({ preventScroll: true });
      tryPlay();
      window.setTimeout(tryPlay, 300);
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
