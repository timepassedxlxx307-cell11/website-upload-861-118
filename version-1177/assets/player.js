(function () {
    window.createMoviePlayer = function (videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hls = null;
        var loaded = false;
        var manifestReady = false;
        var pendingPlay = false;

        if (!video || !button || !sourceUrl) {
            return;
        }

        function revealVideo() {
            button.classList.add("is-hidden");
            button.classList.remove("is-loading");
        }

        function showButton() {
            button.classList.remove("is-hidden");
            button.classList.remove("is-loading");
        }

        function requestPlay() {
            revealVideo();
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    showButton();
                });
            }
        }

        function bindSource() {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                loaded = true;
                manifestReady = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    manifestReady = true;

                    if (pendingPlay) {
                        requestPlay();
                    }
                });
                loaded = true;
                return;
            }

            video.src = sourceUrl;
            loaded = true;
            manifestReady = true;
        }

        function startPlayback() {
            pendingPlay = true;
            button.classList.add("is-loading");
            bindSource();

            if (!hls || manifestReady) {
                requestPlay();
            }
        }

        button.addEventListener("click", startPlayback);

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", revealVideo);
        video.addEventListener("error", showButton);
    };
})();
