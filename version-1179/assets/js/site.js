(function () {
    function currentBase() {
        return document.body.getAttribute("data-base") || ".";
    }

    function joinUrl(base, url) {
        if (!base || base === ".") {
            return "./" + url.replace(/^\.\//, "");
        }
        return base.replace(/\/$/, "") + "/" + url.replace(/^\.\//, "");
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
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

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
                start();
            });
        });

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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll(".search-form"));
        var index = window.SEARCH_INDEX || [];
        if (!forms.length || !index.length) {
            return;
        }
        var base = currentBase();
        forms.forEach(function (form) {
            var input = form.querySelector(".search-input");
            var results = form.querySelector(".search-results");
            if (!input || !results) {
                return;
            }

            function render(query) {
                var value = query.trim().toLowerCase();
                if (!value) {
                    results.innerHTML = "";
                    results.classList.remove("is-open");
                    return;
                }
                var matches = index.filter(function (item) {
                    return item.keywords.toLowerCase().indexOf(value) !== -1;
                }).slice(0, 10);
                if (!matches.length) {
                    results.innerHTML = '<a href="' + joinUrl(base, 'categories.html') + '"><strong>进入分类片库</strong><span>浏览更多影视内容</span></a>';
                    results.classList.add("is-open");
                    return;
                }
                results.innerHTML = matches.map(function (item) {
                    return '<a href="' + joinUrl(base, item.url) + '"><strong>' + item.title + '</strong><span>' + item.category + ' · ' + item.year + '</span></a>';
                }).join("");
                results.classList.add("is-open");
            }

            input.addEventListener("input", function () {
                render(input.value);
            });

            input.addEventListener("focus", function () {
                render(input.value);
            });

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var first = results.querySelector("a");
                if (first) {
                    window.location.href = first.href;
                } else {
                    window.location.href = joinUrl(base, "categories.html");
                }
            });

            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove("is-open");
                }
            });
        });
    }

    function setupFilters() {
        var groups = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));
        groups.forEach(function (group) {
            var container = group.parentElement;
            var cards = Array.prototype.slice.call(container.querySelectorAll(".filter-card"));
            var buttons = Array.prototype.slice.call(group.querySelectorAll(".filter-btn"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var filter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    cards.forEach(function (card) {
                        var text = card.getAttribute("data-filter-text") || "";
                        var visible = filter === "all" || text.indexOf(filter) !== -1;
                        card.classList.toggle("is-hidden-card", !visible);
                    });
                });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupFilters();
    });
}());
