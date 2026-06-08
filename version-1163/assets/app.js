(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter(value) {
    var query = normalize(value);
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      card.classList.toggle("is-hidden", query !== "" && haystack.indexOf(query) === -1);
    });
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    if (!inputs.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    inputs.forEach(function (input) {
      if (input.hasAttribute("data-query-input")) {
        input.value = query;
      }
      input.addEventListener("input", function () {
        applyFilter(input.value);
      });
    });
    if (query) {
      applyFilter(query);
    }
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-player]");
    var configNode = document.getElementById("video-config");
    if (!shell || !configNode) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    if (!video || !overlay) {
      return;
    }
    var config = {};
    try {
      config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
      config = {};
    }
    var streamUrl = config.url || "";
    var prepared = false;
    var instance = null;

    function attachStream() {
      if (prepared || !streamUrl) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(streamUrl);
        instance.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }

    function startPlayback() {
      attachStream();
      shell.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        startPlayback();
      }
    });
    window.addEventListener("pagehide", function () {
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
