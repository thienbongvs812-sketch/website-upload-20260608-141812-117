(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeText(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeText(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
                "<a href=\"" + escapeText(movie.url) + "\" class=\"movie-card-link\">" +
                    "<div class=\"poster-wrap\">" +
                        "<img src=\"" + escapeText(movie.cover) + "\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\">" +
                        "<span class=\"badge-top\">" + escapeText(movie.type) + "</span>" +
                        "<span class=\"rating-badge\">★ " + escapeText(movie.rating) + "</span>" +
                    "</div>" +
                    "<div class=\"movie-card-body\">" +
                        "<h3>" + escapeText(movie.title) + "</h3>" +
                        "<p>" + escapeText(movie.oneLine) + "</p>" +
                        "<div class=\"movie-meta-line\">" +
                            "<span>" + escapeText(movie.year) + "</span>" +
                            "<span>" + escapeText(movie.region) + "</span>" +
                            "<span>" + escapeText(movie.category) + "</span>" +
                        "</div>" +
                        "<div class=\"tag-row\">" + tags + "</div>" +
                    "</div>" +
                "</a>" +
            "</article>";
    }

    ready(function () {
        var movies = window.SEARCH_MOVIES || [];
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = document.querySelector("[data-search-input]");
        var form = document.querySelector("[data-search-form]");
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");
        var title = document.querySelector("[data-search-title]");

        if (input) {
            input.value = query;
        }

        function render(value) {
            var q = normalize(value);
            if (!results || !empty || !title) {
                return;
            }
            if (!q) {
                results.innerHTML = "";
                empty.classList.remove("is-hidden");
                title.textContent = "搜索结果";
                return;
            }
            var matched = movies.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));
                return text.indexOf(q) !== -1;
            }).sort(function (a, b) {
                return (b.rating || 0) - (a.rating || 0) || (b.yearInt || 0) - (a.yearInt || 0);
            }).slice(0, 100);

            title.textContent = "“" + value + "” 的搜索结果";
            results.innerHTML = matched.map(card).join("");
            empty.classList.toggle("is-hidden", matched.length > 0);
            if (matched.length === 0) {
                empty.querySelector("h2").textContent = "没有找到相关影片";
                empty.querySelector("p").textContent = "可尝试更换影片名称、地区、类型或年份。";
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var nextValue = input ? input.value.trim() : "";
                var nextUrl = nextValue ? "search.html?q=" + encodeURIComponent(nextValue) : "search.html";
                window.history.replaceState(null, "", nextUrl);
                render(nextValue);
            });
        }

        render(query);
    });
})();
