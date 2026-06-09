(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      var icon = button.querySelector(".mobile-menu-icon");
      if (icon) {
        icon.textContent = isOpen ? "×" : "☰";
      }
    });
  }

  function setupHeroCarousel() {
    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      if (slides.length <= 1) {
        return;
      }

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
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
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot") || 0));
          restart();
        });
      });

      restart();
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-select-filter]"));
      var container = scope.parentElement || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
      var resultCount = scope.querySelector("[data-result-count]");
      var emptyState = container.querySelector("[data-empty-state]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function searchableText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category
        ].join(" "));
      }

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var filters = {};

        selects.forEach(function (select) {
          filters[select.getAttribute("data-select-filter")] = normalize(select.value);
        });

        var visible = 0;
        cards.forEach(function (card) {
          var matchesQuery = !query || searchableText(card).indexOf(query) !== -1;
          var matchesSelects = Object.keys(filters).every(function (key) {
            var wanted = filters[key];
            return !wanted || normalize(card.dataset[key]).indexOf(wanted) !== -1;
          });
          var shouldShow = matchesQuery && matchesSelects;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });

        if (resultCount) {
          resultCount.textContent = "显示 " + visible + " 部 / 共 " + cards.length + " 部";
        }

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });

      applyFilter();
    });
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise(function (resolve, reject) {
      var existing = document.querySelector("script[data-hls-loader]");
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.async = true;
      script.setAttribute("data-hls-loader", "true");
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setStatus(container, message) {
    var status = container.querySelector("[data-player-status]");
    if (status) {
      status.textContent = message;
    }
  }

  function playVideo(container) {
    var video = container.querySelector("video[data-src]");
    var button = container.querySelector(".player-overlay-button");

    if (!video) {
      return;
    }

    var source = video.getAttribute("data-src");
    if (!source) {
      setStatus(container, "未找到播放源");
      return;
    }

    if (button) {
      button.classList.add("is-hidden");
    }
    setStatus(container, "正在加载播放源...");

    function startPlayback() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus(container, "播放源已加载，请使用播放器控件开始播放");
        });
      }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== source) {
        video.src = source;
      }
      setStatus(container, "播放源已就绪");
      startPlayback();
      return;
    }

    loadHlsScript()
      .then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          if (video._siteHls) {
            video._siteHls.destroy();
          }
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 60
          });
          video._siteHls = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(container, "播放源已就绪");
            startPlayback();
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus(container, "播放加载遇到网络或跨域限制，请稍后重试");
            }
          });
        } else {
          video.src = source;
          startPlayback();
        }
      })
      .catch(function () {
        video.src = source;
        setStatus(container, "已尝试使用浏览器原生方式播放");
        startPlayback();
      });
  }

  function setupPlayers() {
    document.querySelectorAll(".js-video-player").forEach(function (container) {
      var button = container.querySelector(".player-overlay-button");
      if (button) {
        button.addEventListener("click", function () {
          playVideo(container);
        });
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
}());
