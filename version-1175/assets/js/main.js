(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === current);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === current);
        });
      }

      function play() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, itemIndex) {
        dot.addEventListener("click", function () {
          show(itemIndex);
          play();
        });
      });

      if (slides.length > 1) {
        play();
      }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterGenre = document.querySelector("[data-filter-genre]");
    var filterRegion = document.querySelector("[data-filter-region]");
    var filterYear = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

    function fillQueryFromUrl() {
      if (!filterInput) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        filterInput.value = q;
      }
    }

    function applyFilters() {
      var query = normalize(filterInput && filterInput.value);
      var genre = normalize(filterGenre && filterGenre.value);
      var region = normalize(filterRegion && filterRegion.value);
      var year = normalize(filterYear && filterYear.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (genre && normalize(card.getAttribute("data-genre")).indexOf(genre) === -1) {
          ok = false;
        }
        if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
          ok = false;
        }
        if (year && normalize(card.getAttribute("data-year")) !== year) {
          ok = false;
        }

        card.hidden = !ok;
      });
    }

    [filterInput, filterGenre, filterRegion, filterYear].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    fillQueryFromUrl();
    applyFilters();
  });
})();
