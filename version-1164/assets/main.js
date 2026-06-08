(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var current = 0;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var yearSelect = qs('[data-filter-year]', scope);
      var typeSelect = qs('[data-filter-type]', scope);
      var reset = qs('[data-filter-reset]', scope);
      var count = qs('[data-filter-count]', scope);
      var cards = qsa('.movie-card', scope);

      if (scope.hasAttribute('data-read-query') && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          input.value = query;
        }
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          card.classList.toggle('hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', applyFilter);
      }

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          applyFilter();
        });
      }

      applyFilter();
    });
  }

  function setupPlayers() {
    qsa('.movie-player').forEach(function (player) {
      var video = qs('video', player);
      var source = player.getAttribute('data-video-src');
      var playOverlay = qs('[data-player-play]', player);
      var toggle = qs('[data-player-toggle]', player);
      var mute = qs('[data-player-mute]', player);
      var fullscreen = qs('[data-player-fullscreen]', player);
      var initialized = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function initialize() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;
        player.classList.add('loading');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            player.classList.remove('loading');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          player.classList.remove('loading');
        } else {
          player.classList.remove('loading');
          player.setAttribute('data-player-error', '当前浏览器不支持 HLS 播放');
        }

        return Promise.resolve();
      }

      function playVideo() {
        initialize().then(function () {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              player.classList.remove('playing');
            });
          }
        });
      }

      function toggleVideo() {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (playOverlay) {
        playOverlay.addEventListener('click', playVideo);
      }

      if (toggle) {
        toggle.addEventListener('click', toggleVideo);
      }

      video.addEventListener('click', toggleVideo);
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('playing');
      });
      video.addEventListener('loadeddata', function () {
        player.classList.remove('loading');
      });

      if (mute) {
        mute.addEventListener('click', function () {
          video.muted = !video.muted;
          mute.textContent = video.muted ? '取消静音' : '静音';
        });
      }

      if (fullscreen) {
        fullscreen.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
}());
