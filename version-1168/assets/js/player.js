function qiqiPlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);

    if (!video) {
        return;
    }

    var box = video.closest(".player-box");
    var cover = box ? box.querySelector(".player-cover") : null;
    var button = box ? box.querySelector(".play-start") : null;
    var hlsInstance = null;
    var ready = false;

    function start() {
        if (!ready) {
            ready = true;
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        if (cover) {
            cover.classList.add("is-hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }

    if (cover) {
        cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
