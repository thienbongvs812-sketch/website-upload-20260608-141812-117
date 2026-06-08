(() => {
    const prepare = (root) => {
        const video = root.querySelector('video');
        const source = root.querySelector('source');
        const cover = root.querySelector('[data-player-start]');
        const url = source ? source.src : video?.src;
        let ready = false;

        if (!video || !url) {
            return;
        }

        const start = () => {
            cover?.classList.add('is-hidden');

            if (!ready) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }

                ready = true;
            }

            video.controls = true;
            const played = video.play();

            if (played && typeof played.catch === 'function') {
                played.catch(() => {});
            }
        };

        cover?.addEventListener('click', start);
        video.addEventListener('click', () => {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-player]').forEach(prepare);
    });
})();
