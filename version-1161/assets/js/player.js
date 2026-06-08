(function () {
    function initMoviePlayer(videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hasStarted = false;
        var hlsInstance = null;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function bindStream() {
            if (hasStarted) {
                return;
            }
            hasStarted = true;
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            overlay.classList.add("is-hidden");
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    overlay.classList.remove("is-hidden");
                    hasStarted = false;
                });
            }
        }

        overlay.addEventListener("click", bindStream);
        video.addEventListener("click", function () {
            if (!hasStarted) {
                bindStream();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
