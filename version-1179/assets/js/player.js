(function () {
    window.initMoviePlayer = function (src) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("player-overlay");
        var button = document.getElementById("player-start");
        var hls = null;
        var started = false;

        if (!video || !src) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function load() {
            hideOverlay();
            if (!started) {
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hls) {
                            hls.destroy();
                            hls = null;
                            video.src = src;
                            video.load();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    video.load();
                } else {
                    video.src = src;
                    video.load();
                }
            }
            playVideo();
        }

        if (overlay) {
            overlay.addEventListener("click", load);
            overlay.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    load();
                }
            });
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                load();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                load();
            }
        });
    };
}());
