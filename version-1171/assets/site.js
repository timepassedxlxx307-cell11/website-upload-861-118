(function () {
    const menuButton = document.querySelector(".menu-button");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    const prev = document.querySelector(".hero-arrow.prev");
    const next = document.querySelector(".hero-arrow.next");
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function scheduleSlides() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    if (slides.length) {
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                scheduleSlides();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                scheduleSlides();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                scheduleSlides();
            });
        });
        scheduleSlides();
    }

    function startPlayer(player) {
        const video = player.querySelector("video");
        const cover = player.querySelector(".player-cover");
        const url = player.getAttribute("data-url");

        if (!video || !url) {
            return;
        }

        if (video.getAttribute("data-ready") !== "1") {
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
            video.setAttribute("data-ready", "1");
        }

        if (cover) {
            cover.classList.add("is-hidden");
        }

        const playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {});
        }
    }

    document.querySelectorAll(".js-player").forEach(function (player) {
        const cover = player.querySelector(".player-cover");
        const video = player.querySelector("video");

        if (cover) {
            cover.addEventListener("click", function () {
                startPlayer(player);
            });
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.getAttribute("data-ready") !== "1") {
                    startPlayer(player);
                }
            });
        }

        const trigger = document.querySelector(".player-trigger");
        if (trigger) {
            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayer(player);
            });
        }
    });

    const filterInput = document.querySelector("[data-filter-input]");
    const cards = Array.from(document.querySelectorAll(".filter-grid .movie-card"));

    function applyFilter(value) {
        const query = String(value || "").trim().toLowerCase();
        cards.forEach(function (card) {
            const haystack = card.getAttribute("data-search") || "";
            card.classList.toggle("is-hidden-card", query && haystack.indexOf(query) === -1);
        });
    }

    if (filterInput && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";
        if (query) {
            filterInput.value = query;
            applyFilter(query);
        }
        filterInput.addEventListener("input", function () {
            applyFilter(filterInput.value);
        });
    }
})();
