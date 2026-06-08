(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMobileMenu() {
        var button = $('.mobile-menu-button');
        var panel = $('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = $('.hero');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var dots = $all('.hero-dots button', hero);
        var prev = $('.hero-prev', hero);
        var next = $('.hero-next', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        var panel = $('.filter-panel');
        if (!panel) {
            return;
        }
        var input = $('.filter-input', panel);
        var year = $('.filter-year', panel);
        var rating = $('.filter-rating', panel);
        var cards = $all('.movie-card');

        function apply() {
            var q = normalize(input ? input.value : '');
            var y = year ? year.value : '';
            var r = rating ? Number(rating.value || 0) : 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var cardYear = card.getAttribute('data-year') || '';
                var cardRating = Number(card.getAttribute('data-rating') || 0);
                var matchText = !q || text.indexOf(q) !== -1;
                var matchYear = !y || cardYear === y;
                var matchRating = !r || cardRating >= r;
                card.style.display = matchText && matchYear && matchRating ? '' : 'none';
            });
        }

        [input, year, rating].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
    }

    function initSearchPage() {
        var form = $('.search-large');
        var resultGrid = $('#search-results');
        var status = $('.search-status');
        if (!form || !resultGrid || typeof moviesIndex === 'undefined') {
            return;
        }
        var input = $('input[name="q"]', form);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }

        function render(query) {
            var q = normalize(query);
            if (!q) {
                resultGrid.innerHTML = '<div class="empty-result">输入片名、地区、年份或类型后即可查看相关影片。</div>';
                if (status) {
                    status.textContent = '推荐使用片名、题材或年份搜索。';
                }
                return;
            }
            var matched = moviesIndex.filter(function (item) {
                return normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.tags,
                    item.oneLine
                ].join(' ')).indexOf(q) !== -1;
            }).slice(0, 120);
            if (status) {
                status.textContent = '关键词 “' + query + '” 找到 ' + matched.length + ' 部相关影片';
            }
            if (!matched.length) {
                resultGrid.innerHTML = '<div class="empty-result">没有找到相关影片，可以尝试更短的关键词。</div>';
                return;
            }
            resultGrid.innerHTML = matched.map(function (item) {
                return '<article class="movie-card poster-card">' +
                    '<a class="poster-link" href="' + escapeHtml(item.file) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="score-badge">' + escapeHtml(item.rating) + '</span>' +
                    '<span class="play-float">▶</span>' +
                    '</a>' +
                    '<div class="poster-body">' +
                    '<h3><a href="' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = input ? input.value.trim() : '';
            var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
            history.replaceState(null, '', url);
            render(value);
        });
        render(initial);
    }

    function initPlayer() {
        var video = $('.movie-video');
        var overlay = $('.play-overlay');
        if (!video) {
            return;
        }
        var player = null;
        var ready = false;

        function begin() {
            var url = video.getAttribute('data-video-url');
            if (!url) {
                return;
            }
            if (!ready) {
                if (window.Hls && window.Hls.isSupported()) {
                    player = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    player.loadSource(url);
                    player.attachMedia(video);
                    player.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    player.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && player) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                player.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                player.recoverMediaError();
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.play().catch(function () {});
                }
                ready = true;
            } else {
                video.play().catch(function () {});
            }
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }

        if (overlay) {
            overlay.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (player) {
                player.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
        initPlayer();
    });
}());
