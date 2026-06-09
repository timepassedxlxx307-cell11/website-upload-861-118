(function() {
  function setupMoviePlayer(url) {
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-button]");

    if (!video || !url) {
      return;
    }

    var hls = null;

    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function beginPlayback() {
      hideButton();
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    attach();

    if (button) {
      button.addEventListener("click", beginPlayback);
    }

    video.addEventListener("play", hideButton);

    window.addEventListener("beforeunload", function() {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
}());
