(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = selectAll('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scope = panel.closest('main') || document;
            var cards = selectAll('[data-movie-list] article', scope);
            var input = panel.querySelector('[data-search-input]');
            var region = panel.querySelector('[data-filter-region]');
            var year = panel.querySelector('[data-filter-year]');
            var genre = panel.querySelector('[data-filter-genre]');
            var reset = panel.querySelector('[data-filter-reset]');
            var empty = scope.querySelector('[data-no-result]');

            function apply() {
                var queryValue = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var genreValue = normalize(genre && genre.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var title = normalize(card.getAttribute('data-title'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardGenre = normalize(card.getAttribute('data-genre'));
                    var matched = true;

                    if (queryValue && title.indexOf(queryValue) === -1 && cardGenre.indexOf(queryValue) === -1) {
                        matched = false;
                    }

                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }

                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    if (genreValue && cardGenre.indexOf(genreValue) === -1) {
                        matched = false;
                    }

                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', visibleCount === 0);
                }
            }

            [input, region, year, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (genre) {
                        genre.value = '';
                    }
                    apply();
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
