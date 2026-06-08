document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var stream = player.getAttribute("data-stream");
    var ready = false;
    var hlsInstance = null;

    function bindStream() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function startVideo() {
      bindStream();
      player.classList.add("is-playing");

      if (video) {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", startVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
});
