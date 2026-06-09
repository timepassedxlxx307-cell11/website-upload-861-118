(function () {
  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var hlsInstance = null;
    var hasLoaded = false;

    if (!video || !overlay || !source) {
      return;
    }

    function startPlayback() {
      overlay.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function attachSource() {
      if (hasLoaded) {
        startPlayback();
        return;
      }

      hasLoaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", startPlayback, { once: true });
        startPlayback();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = source;
              startPlayback();
            }
          }
        });
        return;
      }

      video.src = source;
      startPlayback();
    }

    overlay.addEventListener("click", attachSource);

    video.addEventListener("click", function () {
      if (video.paused) {
        attachSource();
      } else {
        video.pause();
      }
    });
  };
})();
