(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupSearchPage();
  });

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var nav = document.getElementById('mobileNav');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
      button.textContent = opened ? '×' : '☰';
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-search-root]');

    if (!root || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = document.getElementById('movieSearchInput');
    var region = document.getElementById('movieRegionFilter');
    var type = document.getElementById('movieTypeFilter');
    var year = document.getElementById('movieYearFilter');
    var reset = document.getElementById('movieSearchReset');
    var summary = document.getElementById('movieSearchSummary');
    var results = document.getElementById('movieSearchResults');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function makeCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
        '    <img class="poster-image" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.hidden = true; this.nextElementSibling.hidden = false;">',
        '    <div class="poster-fallback" hidden>' + escapeHtml(movie.title.slice(0, 2)) + '</div>',
        '    <span class="play-chip">播放</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-desc">' + escapeHtml(movie.one_line || '') + '</p>',
        '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }

    function render() {
      var query = normalize(input && input.value);
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var words = query.split(/\s+/).filter(Boolean);

      var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        if (regionValue && movie.region !== regionValue) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        if (yearValue && movie.year !== yearValue) {
          return false;
        }
        if (!words.length) {
          return true;
        }
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags && movie.tags.join(' '),
          movie.one_line
        ].join(' '));
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });

      var limited = matched.slice(0, 80);
      results.innerHTML = limited.map(makeCard).join('') || '<p class="search-summary">没有找到匹配影片，请更换关键词。</p>';
      summary.textContent = '共找到 ' + matched.length + ' 部影片，当前显示前 ' + limited.length + ' 部。';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        input.value = '';
        region.value = '';
        type.value = '';
        year.value = '';
        render();
      });
    }

    render();
  }
})();
