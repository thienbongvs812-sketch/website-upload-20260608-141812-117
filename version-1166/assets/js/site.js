(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFiltering() {
        var input = document.querySelector("[data-search-input]");
        var filterGroup = document.querySelector("[data-filter-group]");
        var sortSelect = document.querySelector("[data-sort-select]");
        var control = document.querySelector(".control-bar");
        var grid = null;
        var empty = null;
        if (control) {
            grid = control.nextElementSibling;
            while (grid && !grid.matches("[data-card-grid]")) {
                grid = grid.nextElementSibling;
            }
            empty = grid ? grid.nextElementSibling : null;
            if (!empty || !empty.matches("[data-empty-result]")) {
                empty = document.querySelector("[data-empty-result]");
            }
        }
        if (!grid) {
            grid = document.querySelector("[data-card-grid]");
            empty = document.querySelector("[data-empty-result]");
        }
        if (!grid) {
            return;
        }
        var activeFilter = "all";

        function cards() {
            return Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        }

        function matches(card) {
            var query = input ? normalize(input.value) : "";
            var filter = normalize(activeFilter);
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-meta"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
            var queryMatch = !query || text.indexOf(query) !== -1;
            var filterMatch = filter === "all" || text.indexOf(filter) !== -1;
            return queryMatch && filterMatch;
        }

        function apply() {
            var visible = 0;
            cards().forEach(function (card) {
                var ok = matches(card);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        function sortCards(mode) {
            var list = cards();
            if (mode === "year-desc") {
                list.sort(function (a, b) {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
            } else if (mode === "year-asc") {
                list.sort(function (a, b) {
                    return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                });
            } else if (mode === "title") {
                list.sort(function (a, b) {
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                });
            } else {
                list.sort(function (a, b) {
                    return Number(a.getAttribute("data-index") || 0) - Number(b.getAttribute("data-index") || 0);
                });
            }
            list.forEach(function (card) {
                grid.appendChild(card);
            });
            apply();
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
            input.addEventListener("input", apply);
        }
        if (filterGroup) {
            filterGroup.addEventListener("click", function (event) {
                var target = event.target.closest("[data-filter]");
                if (!target) {
                    return;
                }
                activeFilter = target.getAttribute("data-filter") || "all";
                Array.prototype.slice.call(filterGroup.querySelectorAll("[data-filter]")).forEach(function (button) {
                    button.classList.toggle("active", button === target);
                });
                apply();
            });
        }
        if (sortSelect) {
            sortSelect.addEventListener("change", function () {
                sortCards(sortSelect.value);
            });
        }
        apply();
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (panel) {
            var video = panel.querySelector("video");
            var button = panel.querySelector("[data-play-button]");
            var stream = panel.getAttribute("data-stream");
            var hls = null;
            var loaded = false;

            if (!video || !button || !stream) {
                return;
            }

            function beginPlayback() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        panel.classList.remove("is-playing");
                    });
                }
            }

            function load() {
                if (loaded) {
                    beginPlayback();
                    return;
                }
                loaded = true;
                panel.classList.add("is-playing");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", beginPlayback, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, beginPlayback);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            panel.classList.remove("is-playing");
                        }
                    });
                    return;
                }
                video.src = stream;
                video.load();
                beginPlayback();
            }

            button.addEventListener("click", load);
            video.addEventListener("click", function () {
                if (video.paused) {
                    load();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                panel.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    panel.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
})();
