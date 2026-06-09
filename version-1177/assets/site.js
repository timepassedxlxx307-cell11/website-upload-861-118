(function () {
    function toText(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
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
            }
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupCardFiltering() {
        var input = document.querySelector("[data-card-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-card-select]"));
        var emptyState = document.querySelector("[data-empty-state]");

        if (!input || !cards.length) {
            return;
        }

        if (document.body.dataset.page === "search") {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query) {
                input.value = query;
            }
        }

        function apply() {
            var term = toText(input.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var matched = true;
                var haystack = toText(card.dataset.search || card.textContent);

                if (term && haystack.indexOf(term) === -1) {
                    matched = false;
                }

                selects.forEach(function (select) {
                    var value = select.value;
                    var field = select.dataset.field;

                    if (value && field && card.dataset[field] !== value) {
                        matched = false;
                    }
                });

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        input.addEventListener("input", apply);

        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });

        apply();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHeroSlider();
        setupCardFiltering();
    });
})();
