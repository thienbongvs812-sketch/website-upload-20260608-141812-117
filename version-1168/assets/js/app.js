document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var next = document.querySelector(".hero-next");
    var prev = document.querySelector(".hero-prev");
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === heroIndex);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showHero(i);
            });
        });
        if (next) {
            next.addEventListener("click", function () {
                showHero(heroIndex + 1);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                showHero(heroIndex - 1);
            });
        }
        window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 6200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var input = document.querySelector("[data-filter-input]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var empty = document.querySelector(".empty-state");
    var query = new URLSearchParams(window.location.search).get("q") || "";

    if (input && query) {
        input.value = query;
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyFilter(value) {
        var term = normalize(value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-title"));
            var show = !term || haystack.indexOf(term) !== -1;
            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    if (input && cards.length) {
        applyFilter(input.value);
        input.addEventListener("input", function () {
            applyFilter(input.value);
        });
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (item) {
                item.classList.remove("is-active");
            });
            chip.classList.add("is-active");
            if (input) {
                input.value = chip.getAttribute("data-filter-value") || "";
            }
            applyFilter(chip.getAttribute("data-filter-value") || "");
        });
    });
});
