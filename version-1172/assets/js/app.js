(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setHero(index, slides, dots) {
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === index);
    });
  }

  function initHero() {
    var slides = all('.hero-slide');
    var dots = all('.hero-dot');
    if (!slides.length) return;
    var index = 0;
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        index = dotIndex;
        setHero(index, slides, dots);
      });
    });
    window.setInterval(function () {
      index = (index + 1) % slides.length;
      setHero(index, slides, dots);
    }, 5200);
  }

  function initMenu() {
    var button = one('.menu-toggle');
    var menu = one('.mobile-nav');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function getQueryValue(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (error) {
      return '';
    }
  }

  function initCatalog() {
    var input = one('.js-search-input');
    var select = one('.js-year-filter');
    var cards = all('.movie-card');
    var empty = one('.js-empty-state');
    if (!cards.length) return;
    var initial = getQueryValue('q');
    if (input && initial) input.value = initial;

    function matchYear(card, value) {
      var year = parseInt(card.getAttribute('data-year') || '', 10);
      if (!value) return true;
      if (value === '2020s') return year >= 2020 && year <= 2029;
      if (value === 'classic') return year > 0 && year < 2020;
      return String(year) === value;
    }

    function update() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = select ? select.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var show = (!query || text.indexOf(query) !== -1) && matchYear(card, yearValue);
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    if (input) input.addEventListener('input', update);
    if (select) select.addEventListener('change', update);
    update();
  }

  window.initPlayer = function (url) {
    var video = one('.js-player-video');
    var overlay = one('.js-player-overlay');
    if (!video || !url) return;
    var ready = false;
    var hlsInstance = null;

    function play() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    function start() {
      if (overlay) overlay.classList.add('is-hidden');
      if (!ready) {
        ready = true;
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('loadedmetadata', play, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, play);
        } else {
          video.src = url;
          video.addEventListener('loadedmetadata', play, { once: true });
        }
      } else {
        play();
      }
    }

    if (overlay) overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready || video.paused) start();
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initMenu();
    initCatalog();
  });
})();
