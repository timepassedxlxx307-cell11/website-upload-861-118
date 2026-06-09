import { H as Hls } from './hls-dru42stk.js';

function setupHlsPlayer(container) {
  const video = container.querySelector('video');
  const button = container.querySelector('.player-start');
  const status = container.querySelector('.player-status');

  if (!video || !button) {
    return;
  }

  const source = video.getAttribute('data-hls-src');
  let hls = null;
  let initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function playVideo() {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击播放器上的播放按钮。');
      });
    }
  }

  function initialize() {
    if (!source) {
      setStatus('未找到可用播放源。');
      return;
    }

    if (initialized) {
      button.classList.add('is-hidden');
      playVideo();
      return;
    }

    initialized = true;
    setStatus('正在加载 HLS 播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      button.classList.add('is-hidden');
      setStatus('已使用浏览器原生 HLS 播放能力。');
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        button.classList.add('is-hidden');
        setStatus('播放源加载完成。');
        playVideo();
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络加载异常，正在尝试恢复播放源。');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，正在尝试恢复。');
          hls.recoverMediaError();
          return;
        }

        setStatus('当前浏览器无法播放此 HLS 源。');
        hls.destroy();
      });

      return;
    }

    setStatus('当前浏览器不支持 HLS 播放。');
  }

  button.addEventListener('click', initialize);

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupHlsPlayer);
