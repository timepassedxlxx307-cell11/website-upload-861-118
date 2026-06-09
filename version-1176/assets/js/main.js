(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function() {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var previous = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function() {
          showSlide(current + 1);
        }, 5000);
      }

      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      if (previous) {
        previous.addEventListener("click", function() {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          showSlide(current + 1);
          startTimer();
        });
      }

      showSlide(0);
      startTimer();
    }

    var searchInput = document.querySelector("[data-card-search]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var typeFilter = document.querySelector("[data-filter-type]");
    var regionFilter = document.querySelector("[data-filter-region]");
    var countTarget = document.querySelector("[data-filter-count]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");
      var year = normalize(yearFilter ? yearFilter.value : "");
      var type = normalize(typeFilter ? typeFilter.value : "");
      var region = normalize(regionFilter ? regionFilter.value : "");
      var visible = 0;

      items.forEach(function(item) {
        var searchValue = normalize(item.getAttribute("data-search-value"));
        var itemYear = normalize(item.getAttribute("data-year"));
        var itemType = normalize(item.getAttribute("data-type"));
        var itemRegion = normalize(item.getAttribute("data-region"));
        var matched = true;

        if (query && searchValue.indexOf(query) === -1) {
          matched = false;
        }

        if (year && itemYear !== year) {
          matched = false;
        }

        if (type && itemType !== type) {
          matched = false;
        }

        if (region && itemRegion !== region) {
          matched = false;
        }

        item.classList.toggle("is-hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (countTarget && items.length) {
        countTarget.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [searchInput, yearFilter, typeFilter, regionFilter].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
}());
