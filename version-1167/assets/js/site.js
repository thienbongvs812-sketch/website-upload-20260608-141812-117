(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
        toggle.textContent = mobileNav.classList.contains("open") ? "×" : "☰";
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot") || 0));
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterInput = document.querySelector("[data-page-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filterable-card"));

    function normalized(value) {
      return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }

      var query = normalized(filterInput && filterInput.value);
      var type = normalized(typeFilter && typeFilter.value);
      var year = normalized(yearFilter && yearFilter.value);
      var category = normalized(categoryFilter && categoryFilter.value);

      cards.forEach(function (card) {
        var text = normalized(card.getAttribute("data-search"));
        var cardType = normalized(card.getAttribute("data-type"));
        var cardYear = normalized(card.getAttribute("data-year"));
        var cardCategory = normalized(card.getAttribute("data-category"));
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }

        if (type && cardType !== type) {
          visible = false;
        }

        if (year && cardYear !== year) {
          visible = false;
        }

        if (category && cardCategory !== category) {
          visible = false;
        }

        card.classList.toggle("is-hidden", !visible);
      });
    }

    [filterInput, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
  });
})();
