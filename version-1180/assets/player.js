(function () {
    window.MoviePlayer = {
        attach: function (videoId, streamUrl) {
            var video = document.getElementById(videoId);
            if (!video || !streamUrl) {
                return;
            }

            var shell = video.closest('.player-shell');
            var button = shell ? shell.querySelector('[data-play-button]') : null;
            var loaded = false;
            var hls = null;

            function markPlaying() {
                if (shell) {
                    shell.classList.add('is-playing');
                }
            }

            function loadAndPlay() {
                if (!loaded) {
                    loaded = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = streamUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false,
                            backBufferLength: 90
                        });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = streamUrl;
                    }
                }
                markPlaying();
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', loadAndPlay);
            }

            video.addEventListener('click', function () {
                if (!loaded) {
                    loadAndPlay();
                }
            });

            video.addEventListener('play', markPlaying);
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        }
    };
})();
