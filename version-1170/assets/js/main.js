document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var activeIndex = 0;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === activeIndex);
    });

    dots.forEach(function (dot, index) {
      dot.setAttribute("aria-pressed", index === activeIndex ? "true" : "false");
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

  function filterCards(input) {
    var keyword = input.value.trim().toLowerCase();
    var list = input.closest("main").querySelector("[data-card-list]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      card.classList.toggle("is-hidden", keyword.length > 0 && text.indexOf(keyword) === -1);
    });
  }

  filterInputs.forEach(function (input) {
    if (input.hasAttribute("data-query-param")) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get(input.getAttribute("data-query-param"));
      if (initial) {
        input.value = initial;
      }
    }

    filterCards(input);

    input.addEventListener("input", function () {
      filterCards(input);
    });
  });
});
