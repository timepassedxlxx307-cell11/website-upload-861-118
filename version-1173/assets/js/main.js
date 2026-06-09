(function () {
  var ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  };

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      var show = function (nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      };

      var start = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      };

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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-card-filter]").forEach(function (input) {
      var scope = document.querySelector("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          card.classList.toggle("hidden-card", keyword && text.indexOf(keyword) === -1);
        });
      });
    });

    var searchInput = document.querySelector("[data-site-search]");
    var searchResults = document.querySelector("[data-search-results]");
    var searchTitle = document.querySelector("[data-search-title]");

    if (searchInput && searchResults && Array.isArray(window.SEARCH_INDEX)) {
      var params = new URLSearchParams(window.location.search);
      var preset = params.get("q") || "";
      searchInput.value = preset;

      var render = function () {
        var keyword = searchInput.value.trim().toLowerCase();
        var pool = window.SEARCH_INDEX;
        var results = keyword ? pool.filter(function (item) {
          return [item.title, item.region, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 80) : pool.slice(0, 24);

        if (searchTitle) {
          searchTitle.textContent = keyword ? "搜索结果" : "精选影片";
        }

        if (!results.length) {
          searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
          return;
        }

        searchResults.innerHTML = results.map(function (item) {
          var tags = item.tags.split(",").filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
          }).join("");
          return [
            '<article class="movie-card" data-movie-card>',
            '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="play-mark">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
            '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
          ].join("");
        }).join("");
      };

      searchInput.addEventListener("input", render);
      render();
    }

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-play-overlay]");
      var source = typeof CURRENT_VIDEO_SOURCE !== "undefined" ? CURRENT_VIDEO_SOURCE : "";
      var readyState = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      var attach = function () {
        if (readyState) {
          return;
        }
        readyState = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = source;
      };

      var play = function () {
        attach();
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      };

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
      }[char];
    });
  }
})();
