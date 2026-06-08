(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var grid = targetSelector ? document.querySelector(targetSelector) : null;
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
            var search = panel.querySelector("[data-list-search]");
            var sort = panel.querySelector("[data-sort-select]");
            var year = panel.querySelector("[data-year-select]");
            var region = panel.querySelector("[data-region-select]");

            function numberValue(card, name) {
                return Number(card.getAttribute(name)) || 0;
            }

            function apply() {
                var query = normalize(search && search.value);
                var sortValue = sort ? sort.value : "default";
                var yearValue = year ? year.value : "all";
                var regionValue = region ? region.value : "all";
                var visible = cards.filter(function (card) {
                    var cardText = normalize(card.getAttribute("data-keywords"));
                    var matchQuery = !query || cardText.indexOf(query) !== -1;
                    var matchYear = yearValue === "all" || card.getAttribute("data-year") === yearValue;
                    var matchRegion = regionValue === "all" || card.getAttribute("data-region") === regionValue;
                    return matchQuery && matchYear && matchRegion;
                });

                visible.sort(function (a, b) {
                    if (sortValue === "year") {
                        return numberValue(b, "data-year") - numberValue(a, "data-year");
                    }
                    if (sortValue === "rating") {
                        return numberValue(b, "data-rating") - numberValue(a, "data-rating");
                    }
                    if (sortValue === "views") {
                        return numberValue(b, "data-views") - numberValue(a, "data-views");
                    }
                    return cards.indexOf(a) - cards.indexOf(b);
                });

                cards.forEach(function (card) {
                    card.style.display = "none";
                });
                visible.forEach(function (card) {
                    card.style.display = "";
                    grid.appendChild(card);
                });
            }

            [search, sort, year, region].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });
            apply();
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
