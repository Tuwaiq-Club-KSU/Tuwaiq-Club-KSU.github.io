window.TuwaiqGolf = (function () {
  'use strict';

  /* ── Path constants ─────────────────────────────────── */
  var MEME_PATH = './Useful Assets/memes/';

  /* ── Sprite image handles ───────────────────────────── */
  var imgBall   = null;
  var imgCube   = null;
  var imgGangle = null;

  /* ── Meme manifest ──────────────────────────────────── */
  var memeManifest = { events: {}, random: [] };

  /* ── Random meme timer ──────────────────────────────── */
  var randomMemeTimer = 20 + Math.random() * 15;

  /* ── Level encoding helpers ─────────────────────────── */
  function encodeLevel(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  }
  function decodeLevel(str) {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  }

  /* ── Campaign level data ────────────────────────────── */
  var CAMPAIGN = (function () {
    var lvl1 = {
      name: 'Hello World', par: 2,
      ball: { x: 100, y: 500 },
      hole: { x: 300, y: 200, r: 14 },
      entities: [
        { t: 'wall', x: 40,  y: 80,  w: 20, h: 480 },
        { t: 'wall', x: 40,  y: 80,  w: 400, h: 20 },
        { t: 'wall', x: 420, y: 80,  w: 20,  h: 480 },
        { t: 'wall', x: 40,  y: 540, w: 420, h: 20  }
      ]
    };
    var lvl2 = {
      name: 'Alley', par: 3,
      ball: { x: 200, y: 550 },
      hole: { x: 200, y: 100, r: 14 },
      cube: { x: 200, y: -60 },
      entities: [
        { t: 'wall', x: 130, y: 60,  w: 20,  h: 560 },
        { t: 'wall', x: 250, y: 60,  w: 20,  h: 560 },
        { t: 'wall', x: 130, y: 60,  w: 140, h: 20  },
        { t: 'wall', x: 130, y: 600, w: 140, h: 20  },
        { t: 'sand', x: 140, y: 380, w: 110, h: 80  }
      ]
    };
    var lvl3 = {
      name: 'Ganggle Field', par: 4,
      ball: { x: 100, y: 520 },
      hole: { x: 620, y: 120, r: 14 },
      cube: { x: 350, y: -60 },
      entities: [
        { t: 'wall',    x: 40,  y: 60,  w: 20,  h: 520 },
        { t: 'wall',    x: 40,  y: 60,  w: 700, h: 20  },
        { t: 'wall',    x: 720, y: 60,  w: 20,  h: 520 },
        { t: 'wall',    x: 40,  y: 560, w: 700, h: 20  },
        { t: 'water',   x: 280, y: 380, w: 160, h: 100 },
        { t: 'ganggle', x: 200, y: 200, r: 14, vx:  80, vy:  60 },
        { t: 'ganggle', x: 400, y: 300, r: 14, vx: -70, vy:  90 },
        { t: 'ganggle', x: 550, y: 200, r: 14, vx:  60, vy: -80 },
        { t: 'ganggle', x: 300, y: 150, r: 14, vx: -90, vy:  50 },
        { t: 'ganggle', x: 600, y: 400, r: 14, vx:  75, vy: -65 }
      ]
    };
    var lvl4 = {
      name: 'The Maze', par: 5,
      ball: { x: 80, y: 500 },
      hole: { x: 650, y: 100, r: 14 },
      cube: { x: 350, y: -60 },
      entities: [
        { t: 'wall', x: 40,  y: 60,  w: 20,  h: 520 },
        { t: 'wall', x: 40,  y: 60,  w: 700, h: 20  },
        { t: 'wall', x: 720, y: 60,  w: 20,  h: 520 },
        { t: 'wall', x: 40,  y: 560, w: 700, h: 20  },
        { t: 'wall', x: 140, y: 60,  w: 20,  h: 320 },
        { t: 'wall', x: 140, y: 440, w: 20,  h: 120 },
        { t: 'wall', x: 240, y: 200, w: 20,  h: 360 },
        { t: 'wall', x: 340, y: 60,  w: 20,  h: 300 },
        { t: 'wall', x: 440, y: 220, w: 20,  h: 340 },
        { t: 'wall', x: 540, y: 60,  w: 20,  h: 280 },
        { t: 'wall', x: 620, y: 220, w: 120, h: 20  },
        { t: 'sand', x: 60,  y: 390, w: 70,  h: 80  },
        { t: 'sand', x: 260, y: 80,  w: 70,  h: 80  },
        { t: 'sand', x: 460, y: 250, w: 70,  h: 80  }
      ]
    };
    var lvl5 = {
      name: 'Chaos', par: 6,
      ball: { x: 80, y: 520 },
      hole: { x: 680, y: 100, r: 14 },
      cube: { x: 400, y: -60 },
      entities: [
        { t: 'wall',    x: 40,  y: 60,  w: 20,  h: 520 },
        { t: 'wall',    x: 40,  y: 60,  w: 740, h: 20  },
        { t: 'wall',    x: 760, y: 60,  w: 20,  h: 520 },
        { t: 'wall',    x: 40,  y: 560, w: 740, h: 20  },
        { t: 'wall',    x: 200, y: 300, w: 140, h: 20  },
        { t: 'wall',    x: 460, y: 200, w: 140, h: 20  },
        { t: 'wall',    x: 300, y: 420, w: 20,  h: 140 },
        { t: 'water',   x: 150, y: 380, w: 120, h: 100 },
        { t: 'water',   x: 530, y: 350, w: 120, h: 100 },
        { t: 'sand',    x: 350, y: 200, w: 100, h: 80  },
        { t: 'tri',     x: 400, y: 420, size: 60, angle: 0 },
        { t: 'weak',    x: 500, y: 450, w: 120, h: 20  },
        { t: 'switch',  x: 580, y: 480, r: 18, sid: 1  },
        { t: 'swwall',  x: 560, y: 260, w: 100, h: 20, sid: 1, on: false },
        { t: 'car',     x: 100, y: 200, w: 70, h: 20, dir: 'h', spd: 90, min: 100, max: 420 },
        { t: 'car',     x: 450, y: 480, w: 70, h: 20, dir: 'h', spd: 110, min: 450, max: 680 },
        { t: 'ganggle', x: 250, y: 150, r: 14, vx:  95, vy:  70 },
        { t: 'ganggle', x: 600, y: 300, r: 14, vx: -85, vy:  95 },
        { t: 'ganggle', x: 350, y: 480, r: 14, vx:  70, vy: -80 }
      ]
    };
    return [
      encodeLevel(lvl1),
      encodeLevel(lvl2),
      encodeLevel(lvl3),
      encodeLevel(lvl4),
      encodeLevel(lvl5)
    ];
  }());

  /* ── Module state ───────────────────────────────────── */
  var overlay, canvas, ctx, leftPanel;
  var rafId = null;
  var lastTs = 0;
  var gameState = 'menu'; // menu | playing | levelcomplete | editor | loadlevel | gameover | paused
  var onExitCb = null;

  /* playing state */
  var currentLevelIndex = 0;
  var currentLevelCode  = '';
  var level = null;
  var ball  = null;
  var cubeE = null;
  var cubeAngle = 0;
  var cubeSpeed = 20;
  var cubeState = 'chasing'; // chasing | catching | caught
  var cubeCatchTimer = 0;

  var strokes   = 0;
  var levelTime = 0;
  var totalTime = 0;
  var totalScore = 0;
  var resets    = 0;
  var skips     = 0;

  var aiming     = false;
  var aimStart   = { x: 0, y: 0 };
  var aimCurrent = { x: 0, y: 0 };

  var completionTimer = 0;
  var ballSinkScale   = 1;

  /* scared reaction state */
  var scaredShown = false;

  /* pause state */
  var paused = false;
  var pauseMenuEl = null;

  /* editor state */
  var editorTool    = 'wall';
  var editorEntities = [];
  var editorBall    = { x: 200, y: 400 };
  var editorHole    = { x: 400, y: 150 };
  var editorCube    = null;
  var editorLevelName = 'My Level';
  var editorPar       = 3;
  var editorDragging  = false;
  var editorDragStart = null;
  var editorCodeOutput = '';

  /* editor selection state */
  var editorSelected  = null;
  var editorDragOffX  = 0;
  var editorDragOffY  = 0;
  var editorIsDragging = false;

  /* load level screen */
  var loadLevelTextarea = null;
  var loadLevelOverlay  = null;

  /* visual fx */
  var flashColor  = null;
  var flashAlpha  = 0;
  var bonkEffects = [];   // {x,y,r,alpha,color?}
  var waveOffset  = 0;

  var memeImg = null;

  /* ── Sound system ───────────────────────────────────── */
  var howlerLoaded = false;
  function loadHowler(cb) {
    if (howlerLoaded || typeof Howl !== 'undefined') { howlerLoaded = true; if (cb) cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js';
    s.onload = function () { howlerLoaded = true; if (cb) cb(); };
    s.onerror = function () { howlerLoaded = false; if (cb) cb(); };
    document.head.appendChild(s);
  }

  var sndScream  = null;
  var sndStatic  = null;
  var sndTada    = null;
  var sndPutt    = null;  // procedural
  var sndGangle  = null;  // procedural
  var sndCoin    = null;  // procedural

  function initSounds() {
    if (typeof Howl === 'undefined') return;
    var base = '../Useful Assets/memes/Sounds/';
    sndScream = new Howl({ src: [base + 'Scream.mp3'], volume: 0.20, sprite: { play: [1000, 5000] } });
    sndStatic = new Howl({ src: [base + 'static.mp3'], volume: 0.08 });
    sndTada   = new Howl({ src: [base + 'tada.mp3'],  volume: 0.65 });
  }

  var _audioCtx = null;
  function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  function playPuttSound() {
    try {
      var ctx2 = getAudioCtx();
      var osc = ctx2.createOscillator();
      var gain = ctx2.createGain();
      osc.connect(gain); gain.connect(ctx2.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx2.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx2.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx2.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.2);
      osc.start(); osc.stop(ctx2.currentTime + 0.2);
    } catch(e){}
  }

  function playGangleSound() {
    try {
      var ctx2 = getAudioCtx();
      var osc = ctx2.createOscillator();
      var gain = ctx2.createGain();
      osc.connect(gain); gain.connect(ctx2.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx2.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx2.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx2.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.15);
      osc.start(); osc.stop(ctx2.currentTime + 0.15);
    } catch(e){}
  }

  function playCoinSound() {
    try {
      var ctx2 = getAudioCtx();
      [0, 0.05, 0.1].forEach(function(delay, i) {
        var osc = ctx2.createOscillator();
        var gain = ctx2.createGain();
        osc.connect(gain); gain.connect(ctx2.destination);
        osc.type = 'sine';
        osc.frequency.value = [523, 659, 784][i];
        gain.gain.setValueAtTime(0.12, ctx2.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + delay + 0.12);
        osc.start(ctx2.currentTime + delay);
        osc.stop(ctx2.currentTime + delay + 0.12);
      });
    } catch(e){}
  }

  function playScreamSound() {
    if (sndScream) { try { sndScream.play('play'); } catch(e){} }
  }

  function playStaticSound() {
    // Procedural noise burst
    try {
      var ctx2 = getAudioCtx();
      var bufSize = ctx2.sampleRate * 0.6;
      var buf = ctx2.createBuffer(1, bufSize, ctx2.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      var src = ctx2.createBufferSource();
      src.buffer = buf;
      var gain = ctx2.createGain();
      gain.gain.setValueAtTime(1, ctx2.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.6);
      src.connect(gain); gain.connect(ctx2.destination);
      src.start(); src.stop(ctx2.currentTime + 0.6);
    } catch(e){}
  }

  function playTadaSound() {
    if (sndTada) { try { sndTada.play(); } catch(e){} }
  }

  /* ── Manifest loading ───────────────────────────────── */
  function loadManifest() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', MEME_PATH + 'manifest.json', true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          memeManifest = JSON.parse(xhr.responseText);
          if (!memeManifest.events) memeManifest.events = {};
          if (!memeManifest.random) memeManifest.random = [];
        } catch (ex) {
          memeManifest = { events: {}, random: [] };
        }
      }
    };
    xhr.onerror = function () {
      memeManifest = { events: {}, random: [] };
    };
    xhr.send();
  }

  /* ── pickReactionFile ───────────────────────────────── */
  function pickReactionFile(event, callback) {
    var arr = memeManifest.events && memeManifest.events[event];
    if (arr && arr.length > 0) {
      var pick = arr[Math.floor(Math.random() * arr.length)];
      callback(pick);
      return;
    }
    // probe extensions
    var exts = ['.gif', '.webp', '.png', '.jpg'];
    var idx = 0;
    function tryNext() {
      if (idx >= exts.length) { callback(null); return; }
      var ext = exts[idx++];
      var probe = new Image();
      probe.onload = function () { callback(event + ext); };
      probe.onerror = function () { tryNext(); };
      probe.src = MEME_PATH + event + ext;
    }
    tryNext();
  }

  /* ── showReaction ───────────────────────────────────── */
  var memeHasShown = false;
  function showReaction(event) {
    if (!memeImg) return;
    pickReactionFile(event, function (filename) {
      if (!filename) return;
      if (memeHasShown) {
        playStaticSound();
        memeImg.src = MEME_PATH + 'static.gif';
        setTimeout(function () {
          if (memeImg) memeImg.src = MEME_PATH + filename;
        }, 700);
      } else {
        memeImg.src = MEME_PATH + filename;
        memeHasShown = true;
      }
    });
  }

  /* ── showRandomMeme ─────────────────────────────────── */
  function showRandomMeme() {
    if (!memeManifest.random || memeManifest.random.length === 0) return;
    var pick = memeManifest.random[Math.floor(Math.random() * memeManifest.random.length)];
    if (!memeImg) return;
    playStaticSound();
    memeImg.src = MEME_PATH + 'static.gif';
    setTimeout(function () {
      if (memeImg) memeImg.src = MEME_PATH + pick;
      // hold the random meme for 4 seconds then return to idle
      setTimeout(function () {
        showReaction('idle');
      }, 4000);
    }, 700);
  }

  /* ── Sprite preloading ──────────────────────────────── */
  function preloadSprites() {
    imgBall   = new Image(); imgBall.src   = MEME_PATH + 'ball.jpg';
    imgCube   = new Image(); imgCube.src   = MEME_PATH + 'void.webp';
    imgGangle = new Image(); imgGangle.src = MEME_PATH + 'gangle.gif';
  }

  /* ── DOM / Init ─────────────────────────────────────── */

  function injectCSS() {
    if (document.getElementById('tqg-style')) return;
    var s = document.createElement('style');
    s.id  = 'tqg-style';
    s.textContent = [
      '#tqg-overlay{position:fixed;z-index:9999;display:flex;background:#0d0520;font-family:monospace;transform-origin:center center;overflow:hidden;}',
      '#tqg-left{width:260px;flex-shrink:0;background:#1a0d3d;display:flex;flex-direction:column;padding:12px;box-sizing:border-box;overflow:hidden;}',
      '#tqg-canvas{display:block;cursor:crosshair;position:relative;overflow:hidden;flex-shrink:0;}',
      '#tqg-portrait{display:none;position:fixed;inset:0;z-index:99999;background:#0d0520;align-items:center;justify-content:center;flex-direction:column;gap:16px;color:#e0b0ff;font-family:monospace;font-size:18px;text-align:center;pointer-events:none;}',
      '@media(orientation:portrait){#tqg-portrait{display:flex;}}',
      '#tqg-title{margin-bottom:10px;text-align:center;}',
      '#tqg-logo{width:100%;max-height:80px;object-fit:contain;}',
      '#tqg-stats{font-size:12px;color:#ccc;line-height:1.8;}',
      '#tqg-stats span{color:#fff;font-weight:700;}',
      '#tqg-resets{color:#ff6666!important;}',
      '#tqg-skips{color:#66ffff!important;}',
      '#tqg-levelname{color:#ffe066!important;font-size:11px;}',
      '#tqg-par{color:#aaffaa!important;}',
      '#tqg-reaction-wrap{margin-top:auto;background:#000;border:3px solid #555;border-radius:6px;overflow:hidden;}',
      '#tqg-reaction-label{color:#888;font-size:10px;letter-spacing:1px;margin-bottom:0;text-align:center;padding:4px 0 2px;}',
      '#tqg-meme{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#111;}',
      '#tqg-exit{position:absolute;top:8px;right:8px;background:transparent;border:1px solid #553388;color:#cc88ff;cursor:pointer;font-size:16px;width:28px;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;z-index:10001;}',
      '#tqg-exit:hover{background:#3a1a6e;}',
      '.tqg-menubtn{background:linear-gradient(135deg,#2a0d5e,#4a1a9e);border:2px solid #7030d0;color:#e0b0ff;font-family:monospace;font-size:14px;font-weight:700;letter-spacing:2px;padding:12px 20px;cursor:pointer;border-radius:6px;margin:6px 0;width:100%;text-transform:uppercase;transition:background .15s;}',
      '.tqg-menubtn:hover{background:linear-gradient(135deg,#3a1d7e,#6a2abe);}',
      '#tqg-loadoverlay{position:absolute;inset:0;background:rgba(13,5,32,0.95);z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;}',
      '#tqg-loadoverlay textarea{width:320px;height:100px;background:#1a0d3d;border:1px solid #553388;color:#e0b0ff;font-family:monospace;font-size:12px;padding:8px;border-radius:4px;resize:none;}',
      '#tqg-loadoverlay label{color:#e0b0ff;font-size:14px;}',
      '.tqg-editortoolbtn{width:44px;height:44px;background:#2a0d5e;border:1px solid #553388;color:#ccc;font-size:18px;cursor:pointer;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;}',
      '.tqg-editortoolbtn.active{background:#4a1a9e;border-color:#a070e0;box-shadow:0 0 6px #a070e0;}',
      '.tqg-editortoolbtn:hover{background:#3a1570;}',
      '#tqg-ed-toolbar{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0;}',
      '#tqg-ed-trash{width:36px;height:36px;background:#550000;border:1px solid #aa0000;border-radius:4px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;margin-top:6px;}',
      '#tqg-ed-trash:disabled{opacity:0.3;cursor:default;}',
      '#tqg-ed-trash img{width:20px;height:20px;object-fit:contain;}',
      '#tqg-editorinputs{display:flex;flex-direction:column;gap:5px;}',
      '#tqg-editorinputs input{background:#1a0d3d;border:1px solid #553388;color:#e0b0ff;font-family:monospace;font-size:12px;padding:4px 6px;border-radius:3px;width:100%;box-sizing:border-box;}',
      '#tqg-editorinputs label{color:#aaa;font-size:11px;}',
      '#tqg-codebox{background:#0d0520;border:1px solid #553388;color:#88ff88;font-family:monospace;font-size:10px;padding:6px;border-radius:3px;width:100%;box-sizing:border-box;height:60px;resize:none;margin-top:6px;word-break:break-all;}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function buildDOM() {
    overlay = document.createElement('div');
    overlay.id = 'tqg-overlay';

    // exit button
    var exitBtn = document.createElement('button');
    exitBtn.id = 'tqg-exit';
    exitBtn.textContent = '✕';
    exitBtn.addEventListener('click', function () { exitGame(); });
    overlay.appendChild(exitBtn);

    // left panel
    leftPanel = document.createElement('div');
    leftPanel.id = 'tqg-left';
    leftPanel.innerHTML = [
      '<div id="tqg-title"><img id="tqg-logo" src="../ Useful Assets/memes/logo.png" alt="Uncanny Cube Golf"></div>',
      '<div id="tqg-stats">',
      '  Strokes: <span id="tqg-s-strokes">0</span><br>',
      '  Time: <span id="tqg-s-time">00:00</span><br>',
      '  Total: <span id="tqg-s-total">00:00</span><br>',
      '  Score: <span id="tqg-s-score">0</span><br>',
      '  <span id="tqg-resets">Resets: <span id="tqg-s-resets">0</span></span><br>',
      '  <span id="tqg-skips">Skips: <span id="tqg-s-skips">0</span></span><br>',
      '  Level: <span id="tqg-levelname" id="tqg-s-levelname">-</span><br>',
      '  Par: <span id="tqg-par" id="tqg-s-par">-</span>',
      '</div>',
      '<div id="tqg-reaction-wrap">',
      '  <div id="tqg-reaction-label">▣ CUBE THOUGHT DISPLAYER 9000 ▣</div>',
      '  <img id="tqg-meme" src="" alt="">',
      '</div>',
    ].join('');
    overlay.appendChild(leftPanel);

    // canvas
    canvas = document.createElement('canvas');
    canvas.id = 'tqg-canvas';
    overlay.appendChild(canvas);

    // portrait lock overlay
    var portraitMsg = document.createElement('div');
    portraitMsg.id = 'tqg-portrait';
    portraitMsg.innerHTML = '<div style="font-size:48px">📱↔️</div><div>Rotate your device to landscape</div>';
    document.body.appendChild(portraitMsg);

    document.body.appendChild(overlay);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    memeImg = document.getElementById('tqg-meme');
    showReaction('idle');
  }

  var GAME_W = 900, GAME_H = 600;   // fixed logical resolution

  function resizeCanvas() {
    canvas.width  = GAME_W;
    canvas.height = GAME_H;
    var TOTAL_W = GAME_W + 260;     // 260 = left panel width
    var scale   = Math.min(window.innerWidth / TOTAL_W, window.innerHeight / GAME_H);
    overlay.style.width     = TOTAL_W + 'px';
    overlay.style.height    = GAME_H  + 'px';
    overlay.style.left      = '50%';
    overlay.style.top       = '50%';
    overlay.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
  }

  function updateStats() {
    function el(id) { return document.getElementById(id); }
    if (el('tqg-s-strokes')) el('tqg-s-strokes').textContent = strokes;
    if (el('tqg-s-time'))    el('tqg-s-time').textContent    = fmtTime(levelTime);
    if (el('tqg-s-total'))   el('tqg-s-total').textContent   = fmtTime(totalTime);
    if (el('tqg-s-score'))   el('tqg-s-score').textContent   = totalScore;
    if (el('tqg-s-resets'))  el('tqg-s-resets').textContent  = resets;
    if (el('tqg-s-skips'))   el('tqg-s-skips').textContent   = skips;
    if (level) {
      var ln = leftPanel.querySelector('#tqg-levelname');
      if (ln) ln.textContent = level.name || '-';
      var lp = leftPanel.querySelector('#tqg-par');
      if (lp) lp.textContent = level.par || '-';
    }
  }

  function fmtTime(s) {
    s = Math.floor(s);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
  }

  /* ── Input handling ─────────────────────────────────── */
  var mousePos = { x: 0, y: 0 };

  function canvasCoords(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width  / r.width),
      y: (e.clientY - r.top)  * (canvas.height / r.height)
    };
  }

  function onMouseMove(e) {
    var raw = canvasCoords(e);
    mousePos = {
      x: Math.max(0, Math.min(canvas.width,  raw.x)),
      y: Math.max(0, Math.min(canvas.height, raw.y))
    };
    if (aiming) aimCurrent = { x: mousePos.x, y: mousePos.y };

    if (gameState === 'editor') {
      // select drag
      if (editorTool === 'select' && editorIsDragging && editorSelected !== null) {
        var p2 = mousePos;
        var sx2 = snap(p2.x + editorDragOffX), sy2 = snap(p2.y + editorDragOffY);
        var ent2 = getEditorEntity(editorSelected);
        if (ent2) { ent2.x = sx2; ent2.y = sy2; }
      }
      // rotate mode
      if (editorTool === 'rotate' && editorSelected !== null) {
        var ent3 = getEditorEntity(editorSelected);
        if (ent3 && ent3.t === 'tri') {
          ent3.angle = Math.atan2(mousePos.y - ent3.y, mousePos.x - ent3.x);
        }
      }
      // standard drag-to-draw
      if (editorDragging && editorDragStart) {
        // handled in drawEditor via mousePos
      }
    }
  }

  function onMouseDown(e) {
    var p = canvasCoords(e);
    if (gameState === 'menu') {
      handleMenuClick(p);
      return;
    }
    if (gameState === 'playing') {
      if (e.button === 0) {
        if (cubeState !== 'catching' && isBallStopped() && gameState === 'playing') {
          var dx = p.x - ball.x, dy = p.y - ball.y;
          if (Math.sqrt(dx * dx + dy * dy) < 30) {
            aiming = true;
            aimStart   = { x: p.x, y: p.y };
            aimCurrent = { x: p.x, y: p.y };
          }
        }
      }
      return;
    }
    if (gameState === 'editor') {
      if (e.button === 2) {
        // right-click: delete entity at cursor
        var found = findEditorEntityAt(p.x, p.y);
        if (found !== null && typeof found === 'number') {
          editorEntities.splice(found, 1);
          if (editorSelected === found) { editorSelected = null; updateEditorSelection(); }
          else if (typeof editorSelected === 'number' && editorSelected > found) {
            editorSelected--;
            updateEditorSelection();
          }
        }
        return;
      } else {
        editorLeftClick(p, e);
      }
      return;
    }
  }

  function onMouseUp(e) {
    if (gameState === 'playing' && aiming) {
      var p = canvasCoords(e);
      var dx = aimStart.x - p.x;
      var dy = aimStart.y - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 3) {
        var power = Math.min(dist, 140) / 140 * 650;
        ball.vx = (dx / dist) * power;
        ball.vy = (dy / dist) * power;
        playPuttSound();
        strokes++;
        updateStats();
      }
      aiming = false;
    }
    if (gameState === 'editor') {
      editorIsDragging = false;
      if (editorDragging) {
        editorFinishDrag(canvasCoords(e));
      }
    }
  }

  function isBallStopped() {
    if (!ball) return false;
    return Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) < 0.5;
  }

  /* ── Menu ───────────────────────────────────────────── */
  var menuButtons = [];

  function buildMenuButtons() {
    var cw = canvas.width, ch = canvas.height;
    var bw = 260, bh = 52, gap = 18;
    var totalH = 3 * bh + 2 * gap;
    var startY = (ch - totalH) / 2;
    var bx = (cw - bw) / 2;
    menuButtons = [
      { label: 'CAMPAIGN',    y: startY,              action: startCampaign },
      { label: 'LOAD LEVEL',  y: startY + bh + gap,   action: showLoadLevel },
      { label: 'LEVEL MAKER', y: startY + (bh + gap) * 2, action: openEditor },
    ];
    menuButtons.forEach(function (b) {
      b.x = bx; b.w = bw; b.h = bh;
    });
  }

  function handleMenuClick(p) {
    menuButtons.forEach(function (b) {
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        b.action();
      }
    });
  }

  function drawMenu() {
    var cw = canvas.width, ch = canvas.height;
    ctx.fillStyle = '#1a4d1a';
    ctx.fillRect(0, 0, cw, ch);
    drawGreenPattern();

    // title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e0b0ff';
    ctx.font = 'bold 32px monospace';
    ctx.shadowColor = '#a050ff';
    ctx.shadowBlur = 16;
    ctx.fillText('UNCANNY CUBE GOLF', cw / 2, ch / 2 - 140);
    ctx.shadowBlur = 0;
    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('A Tuwaiq Easter Egg Experience', cw / 2, ch / 2 - 105);
    ctx.restore();

    buildMenuButtons();
    menuButtons.forEach(function (b) {
      ctx.save();
      ctx.shadowColor = '#7030d0';
      ctx.shadowBlur = 12;
      var grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
      grad.addColorStop(0, '#3a1d7e');
      grad.addColorStop(1, '#2a0d5e');
      ctx.fillStyle = grad;
      roundRect(ctx, b.x, b.y, b.w, b.h, 8);
      ctx.fill();
      ctx.strokeStyle = '#7030d0';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#e0b0ff';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
      ctx.restore();
    });
  }

  /* ── Load Level Screen ──────────────────────────────── */

  function showLoadLevel() {
    gameState = 'loadlevel';
    var d = document.createElement('div');
    d.id = 'tqg-loadoverlay';
    d.innerHTML = [
      '<label>Paste level code below:</label>',
      '<textarea id="tqg-leveltextarea" placeholder="Paste base64 level code here..."></textarea>',
      '<div style="display:flex;gap:8px;">',
      '<button class="tqg-menubtn" id="tqg-loadbtn" style="width:120px">LOAD</button>',
      '<button class="tqg-menubtn" id="tqg-backbtn2" style="width:120px">BACK</button>',
      '</div>',
    ].join('');
    canvas.style.position = 'relative';
    d.style.position = 'absolute';
    canvas.parentNode.insertBefore(d, canvas);
    canvas.parentNode.style.position = 'relative';
    loadLevelOverlay = d;

    document.getElementById('tqg-loadbtn').addEventListener('click', function () {
      var code = document.getElementById('tqg-leveltextarea').value.trim();
      try {
        var lvl = decodeLevel(code);
        closeLoadLevel();
        startCustomLevel(code, lvl);
      } catch (ex) {
        alert('Invalid level code!');
      }
    });
    document.getElementById('tqg-backbtn2').addEventListener('click', function () {
      closeLoadLevel();
      gameState = 'menu';
    });
  }

  function closeLoadLevel() {
    if (loadLevelOverlay && loadLevelOverlay.parentNode) {
      loadLevelOverlay.parentNode.removeChild(loadLevelOverlay);
    }
    loadLevelOverlay = null;
  }

  function startCustomLevel(code, lvl) {
    currentLevelIndex = -1;
    currentLevelCode  = code;
    loadLevel(lvl);
    gameState = 'playing';
  }

  /* ── Campaign ───────────────────────────────────────── */

  function startCampaign() {
    totalScore = 0;
    totalTime  = 0;
    resets = 0;
    skips  = 0;
    currentLevelIndex = 0;
    loadLevelByIndex(0);
    gameState = 'playing';
  }

  function loadLevelByIndex(i) {
    var code = CAMPAIGN[i];
    currentLevelCode = code;
    loadLevel(decodeLevel(code));
  }

  function loadLevel(lvlObj) {
    // deep clone
    level = JSON.parse(JSON.stringify(lvlObj));
    if (!level.hole.r) level.hole.r = 14;

    ball = { x: level.ball.x, y: level.ball.y, vx: 0, vy: 0, r: 8 };
    ballSinkScale = 1;   // FIX 1: reset sink scale on new level
    completionTimer = 0; // FIX 1: reset completion timer on new level
    strokes = 0;
    levelTime = 0;
    aiming = false;
    cubeState = 'chasing';
    bonkEffects = [];
    flashAlpha  = 0;
    scaredShown = false; // reset scared reaction flag

    if (level.cube) {
      cubeE = { x: level.cube.x, y: level.cube.y };
      cubeAngle = Math.PI / 2;
      cubeSpeed = 20 + resets * 4;
    } else {
      cubeE = null;
    }
    updateStats();
    showReaction('idle');
  }

  function resetLevel() {
    resets++;
    cubeSpeed = 20 + resets * 4;
    loadLevel(decodeLevel(currentLevelCode));
    showReaction('cube');
  }

  /* ── Level Complete ─────────────────────────────────── */

  function completeLevelCalcScore() {
    var par = level.par || 3;
    var sc;
    if (strokes === 1) {
      sc = 500 + par * 100;
      showReaction('holeinone');
    } else if (strokes <= par) {
      sc = par * 100 + (par - strokes) * 50;
      showReaction('goal');
    } else {
      sc = Math.max(0, par * 100 - (strokes - par) * 50);
      showReaction('goal');
    }
    totalScore += sc;
    updateStats();
    return sc;
  }

  function sinkBall() {
    gameState  = 'levelcomplete';
    completionTimer = 0;
    ballSinkScale   = 1;
    completeLevelCalcScore();
    playTadaSound();
  }

  function advanceLevel() {
    if (currentLevelIndex >= 0 && currentLevelIndex < CAMPAIGN.length - 1) {
      currentLevelIndex++;
      loadLevelByIndex(currentLevelIndex);
      gameState = 'playing';
    } else if (currentLevelIndex >= CAMPAIGN.length - 1) {
      gameState = 'gameover';
    } else {
      gameState = 'menu';
    }
  }

  function skipLevel() {
    if (gameState !== 'playing') return;
    skips++;
    totalTime += levelTime;
    if (currentLevelIndex >= 0 && currentLevelIndex < CAMPAIGN.length - 1) {
      currentLevelIndex++;
      loadLevelByIndex(currentLevelIndex);
    } else {
      gameState = 'menu';
    }
    updateStats();
  }

  /* ── Pause Menu ─────────────────────────────────────── */

  function togglePause() {
    if (gameState !== 'playing' && gameState !== 'paused') return;
    paused = !paused;
    gameState = paused ? 'paused' : 'playing';
    if (paused) showPauseMenu(); else hidePauseMenu();
  }

  function showPauseMenu() {
    if (pauseMenuEl) return;
    pauseMenuEl = document.createElement('div');
    pauseMenuEl.id = 'tqg-pause';
    pauseMenuEl.style.cssText = 'position:absolute;inset:0;background:rgba(13,5,32,0.88);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;';

    var title = document.createElement('div');
    title.style.cssText = 'color:#e0b0ff;font-size:22px;font-weight:900;letter-spacing:3px;text-shadow:0 0 12px #a050ff;margin-bottom:10px;font-family:monospace;';
    title.textContent = '— PAUSED —';
    pauseMenuEl.appendChild(title);

    function addBtn(text, cb) {
      var b = document.createElement('button');
      b.className = 'tqg-menubtn';
      b.style.cssText = 'width:220px;font-size:13px;padding:10px;';
      b.textContent = text;
      b.addEventListener('click', cb);
      pauseMenuEl.appendChild(b);
    }

    addBtn('▶  RESUME', function() { togglePause(); });

    // Skip level only in campaign
    if (currentLevelIndex >= 0) {
      addBtn('⏭  SKIP LEVEL', function() {
        hidePauseMenu(); paused = false; gameState = 'playing';
        skipLevel();
      });
    }

    // Back to editor (if playtesting from editor)
    if (currentLevelIndex < 0) {
      addBtn('✏  BACK TO EDITOR', function() {
        hidePauseMenu(); paused = false;
        gameState = 'editor';
        buildEditorPanel();
      });
    }

    addBtn('🏠  MAIN MENU', function() {
      hidePauseMenu(); paused = false;
      gameState = 'menu';
      rebuildStatsPanel();
    });

    addBtn('✕  EXIT GAME', function() {
      hidePauseMenu(); paused = false;
      exitGame();
    });

    // Attach to the canvas wrapper
    var wrapper = canvas.parentNode || overlay;
    wrapper.style.position = 'relative';
    wrapper.appendChild(pauseMenuEl);
  }

  function hidePauseMenu() {
    if (pauseMenuEl && pauseMenuEl.parentNode) pauseMenuEl.parentNode.removeChild(pauseMenuEl);
    pauseMenuEl = null;
    paused = false;
    gameState = 'playing';
  }

  /* ── Physics ────────────────────────────────────────── */

  function updatePhysics(dt) {
    if (!ball) return;

    waveOffset += dt * 2;

    // movement
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // friction
    var f = Math.pow(0.988, dt * 60);
    ball.vx *= f;
    ball.vy *= f;

    // stop threshold — snap to stopped when barely drifting
    if (Math.abs(ball.vx) < 4.0) ball.vx = 0;
    if (Math.abs(ball.vy) < 4.0) ball.vy = 0;

    // canvas boundary
    var cw = canvas.width, ch = canvas.height;
    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx) * 0.65; }
    if (ball.x + ball.r > cw) { ball.x = cw - ball.r; ball.vx = -Math.abs(ball.vx) * 0.65; }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy) * 0.65; }
    if (ball.y + ball.r > ch) { ball.y = ch - ball.r; ball.vy = -Math.abs(ball.vy) * 0.65; }

    // sand extra friction
    level.entities.forEach(function (e) {
      if (e.t === 'sand' && e._alive !== false) {
        if (ptInRect(ball.x, ball.y, e)) {
          ball.vx *= 0.94;
          ball.vy *= 0.94;
        }
      }
    });

    // coin collisions
    level.entities.forEach(function (e) {
      if (e.t !== 'coin' || e._alive === false) return;
      var dx = ball.x - e.x, dy = ball.y - e.y;
      if (Math.sqrt(dx * dx + dy * dy) < ball.r + e.r) {
        e._alive = false;
        playCoinSound();
        totalScore += 50;
        bonkEffects.push({ x: e.x, y: e.y, r: e.r, alpha: 1, color: '#ffdd00' });
        updateStats();
      }
    });

    // entity collisions
    level.entities.forEach(function (e) {
      if (e._alive === false) return;
      switch (e.t) {
        case 'wall':   collideRectBall(e, false); break;
        case 'weak':   if (collideRectBall(e, false)) { e._alive = false; } break;
        case 'swwall': if (e.on) collideRectBall(e, false); break;
        case 'tri':    collideTriBall(e); break;
        case 'car':    collideCarBall(e, dt); break;
        case 'water':
          if (ptInRect(ball.x, ball.y, e)) {
            strokes++;
            flashColor = '#1a5fbe';
            flashAlpha = 0.7;
            showReaction('void');
            resetBallToStart();
            updateStats();
          }
          break;
        case 'switch':
          if (circleOverlapCircle(ball.x, ball.y, ball.r, e.x, e.y, e.r)) {
            if (!e._triggered) {
              e._triggered = true;
              toggleSwitchGroup(e.sid);
              showReaction('trigger');
            }
          } else {
            e._triggered = false;
          }
          break;
        case 'ganggle':
          if (e._alive !== false) {
            updateGanggle(e, dt);
            if (circleOverlapCircle(ball.x, ball.y, ball.r, e.x, e.y, e.r)) {
              reflectBallOffGanggle(e);
              playGangleSound();
              bonkEffects.push({ x: e.x, y: e.y, r: 0, alpha: 1, color: '#00ffff' });
              e._alive = false;
            }
          }
          break;
      }
    });

    // hole check
    var hx = level.hole.x, hy = level.hole.y, hr = level.hole.r || 14;
    var hdx = ball.x - hx, hdy = ball.y - hy;
    if (Math.sqrt(hdx * hdx + hdy * hdy) < ball.r + hr - 4) {
      sinkBall();
    }
  }

  function resetBallToStart() {
    ball.x  = level.ball.x;
    ball.y  = level.ball.y;
    ball.vx = 0;
    ball.vy = 0;
  }

  function ptInRect(px, py, e) {
    return px >= e.x && px <= e.x + e.w && py >= e.y && py <= e.y + e.h;
  }

  function circleOverlapCircle(ax, ay, ar, bx, by, br) {
    var dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy < (ar + br) * (ar + br);
  }

  function collideRectBall(e, absorb) {
    var nx = Math.max(e.x, Math.min(ball.x, e.x + e.w));
    var ny = Math.max(e.y, Math.min(ball.y, e.y + e.h));
    var dx = ball.x - nx, dy = ball.y - ny;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ball.r && dist > 0) {
      var nx2 = dx / dist, ny2 = dy / dist;
      ball.x = nx + nx2 * ball.r;
      ball.y = ny + ny2 * ball.r;
      var dot = ball.vx * nx2 + ball.vy * ny2;
      ball.vx -= 2 * dot * nx2;
      ball.vy -= 2 * dot * ny2;
      ball.vx *= 0.65;
      ball.vy *= 0.65;
      return true;
    }
    return false;
  }

  function collideTriBall(e) {
    var verts = triVertices(e);
    for (var i = 0; i < 3; i++) {
      var a = verts[i], b = verts[(i + 1) % 3];
      var closest = closestPtOnSegment(ball.x, ball.y, a.x, a.y, b.x, b.y);
      var dx = ball.x - closest.x, dy = ball.y - closest.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ball.r && dist > 0) {
        var nx = dx / dist, ny = dy / dist;
        ball.x = closest.x + nx * ball.r;
        ball.y = closest.y + ny * ball.r;
        var dot = ball.vx * nx + ball.vy * ny;
        ball.vx -= 2 * dot * nx;
        ball.vy -= 2 * dot * ny;
        ball.vx *= 0.65;
        ball.vy *= 0.65;
        return;
      }
    }
  }

  function triVertices(e) {
    var s = e.size || 60;
    var a = e.angle || 0;
    var verts = [];
    for (var i = 0; i < 3; i++) {
      var ang = a + (Math.PI * 2 / 3) * i - Math.PI / 2;
      verts.push({ x: e.x + Math.cos(ang) * s, y: e.y + Math.sin(ang) * s });
    }
    return verts;
  }

  function closestPtOnSegment(px, py, ax, ay, bx, by) {
    var abx = bx - ax, aby = by - ay;
    var len2 = abx * abx + aby * aby;
    if (len2 === 0) return { x: ax, y: ay };
    var t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
    return { x: ax + t * abx, y: ay + t * aby };
  }

  function reflectBallOffGanggle(g) {
    var dx = ball.x - g.x, dy = ball.y - g.y;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = dx / d, ny = dy / d;
    var dot = ball.vx * nx + ball.vy * ny;
    ball.vx -= 2 * dot * nx;
    ball.vy -= 2 * dot * ny;
    ball.vx *= 1.05;
    ball.vy *= 1.05;
  }

  function updateGanggle(g, dt) {
    if (!g._vx) { g._vx = g.vx || 60; g._vy = g.vy || 50; }
    g.x += g._vx * dt;
    g.y += g._vy * dt;
    var cw = canvas.width, ch = canvas.height;
    var r = g.r || 14;
    if (g.x - r < 0 || g.x + r > cw) { g._vx = -g._vx; g.x = Math.max(r, Math.min(cw - r, g.x)); }
    if (g.y - r < 0 || g.y + r > ch) { g._vy = -g._vy; g.y = Math.max(r, Math.min(ch - r, g.y)); }
    level.entities.forEach(function (e) {
      if (e === g) return;
      if ((e.t === 'wall' || e.t === 'weak' || (e.t === 'swwall' && e.on)) && e._alive !== false) {
        var nx2 = Math.max(e.x, Math.min(g.x, e.x + e.w));
        var ny2 = Math.max(e.y, Math.min(g.y, e.y + e.h));
        var dx2 = g.x - nx2, dy2 = g.y - ny2;
        var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist2 < r && dist2 > 0) {
          var nnx = dx2 / dist2, nny = dy2 / dist2;
          g.x = nx2 + nnx * r;
          g.y = ny2 + nny * r;
          var dot2 = g._vx * nnx + g._vy * nny;
          g._vx -= 2 * dot2 * nnx;
          g._vy -= 2 * dot2 * nny;
        }
      }
    });
  }

  function collideCarBall(e, dt) {
    if (e._pos === undefined) {
      e._pos = (e.dir === 'h') ? e.x : e.y;
      e._spd = e.spd || 80;
    }
    var prevPos = e._pos;
    e._pos += e._spd * dt;
    if (e._pos > e.max || e._pos < e.min) {
      e._spd = -e._spd;
      e._pos = Math.max(e.min, Math.min(e.max, e._pos));
    }
    var delta = e._pos - prevPos;
    if (e.dir === 'h') { e.x = e._pos; } else { e.y = e._pos; }

    var nx = Math.max(e.x, Math.min(ball.x, e.x + e.w));
    var ny = Math.max(e.y, Math.min(ball.y, e.y + e.h));
    var dx = ball.x - nx, dy = ball.y - ny;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ball.r && dist > 0) {
      if (e.dir === 'h') {
        ball.x += delta;
      } else {
        ball.y += delta;
      }
      collideRectBall(e, false);
    }
  }

  function toggleSwitchGroup(sid) {
    level.entities.forEach(function (e) {
      if (e.t === 'swwall' && e.sid === sid) {
        e.on = !e.on;
      }
    });
  }

  /* ── Cube Enemy ─────────────────────────────────────── */

  function updateCube(dt) {
    if (!cubeE || cubeState !== 'chasing') return;
    var tx = ball.x, ty = ball.y;
    var angle_to = Math.atan2(ty - cubeE.y, tx - cubeE.x);
    var diff = angle_to - cubeAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    var rotRate = 1.2;
    cubeAngle += Math.sign(diff) * Math.min(Math.abs(diff), rotRate * dt);
    cubeAngle += Math.sin(performance.now() * 0.001 * 1.4) * 0.4 * dt;

    var spd = cubeSpeed;
    cubeE.x += Math.cos(cubeAngle) * spd * dt;
    cubeE.y += Math.sin(cubeAngle) * spd * dt;

    var cw = canvas.width, ch = canvas.height;
    var hs = 13;
    if (cubeE.x < hs)       { cubeE.x = hs;       cubeAngle = Math.PI - cubeAngle; }
    if (cubeE.x > cw - hs)  { cubeE.x = cw - hs;  cubeAngle = Math.PI - cubeAngle; }
    if (cubeE.y < hs)       { cubeE.y = hs;        cubeAngle = -cubeAngle; }
    if (cubeE.y > ch - hs)  { cubeE.y = ch - hs;   cubeAngle = -cubeAngle; }

    // cube phases through all obstacles — nothing stops it

    // scared reaction when cube is close
    var distToBall = Math.sqrt(Math.pow(cubeE.x - ball.x, 2) + Math.pow(cubeE.y - ball.y, 2));
    if (distToBall < 140 && !scaredShown) {
      scaredShown = true;
      showReaction('scared');
    } else if (distToBall >= 200 && scaredShown) {
      scaredShown = false;
      showReaction('idle');
    }

    var dx = cubeE.x - ball.x, dy = cubeE.y - ball.y;
    if (Math.sqrt(dx * dx + dy * dy) < 21) {
      triggerCubeCatch();
    }
  }

  function triggerCubeCatch() {
    if (cubeState !== 'chasing') return;
    cubeState = 'catching';
    cubeCatchTimer = 0;
    playScreamSound();
    showReaction('cube');
    // Show void image full-screen — hold for 700ms then cut scream and reset
    var cover = document.createElement('div');
    cover.id = 'tqg-cubecover';
    cover.style.cssText = 'position:absolute;inset:0;z-index:10000;background:#000;display:flex;align-items:center;justify-content:center;';
    var img = document.createElement('img');
    img.src = MEME_PATH + 'void.webp';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    cover.appendChild(img);
    canvas.parentNode.appendChild(cover);
    setTimeout(function() {
      if (sndScream) { try { sndScream.stop(); } catch(e){} }
      if (cover.parentNode) cover.parentNode.removeChild(cover);
      resetLevel();
    }, 700);
  }

  /* ── Bonk fx ────────────────────────────────────────── */

  function updateBonks(dt) {
    bonkEffects = bonkEffects.filter(function (b) {
      b.r += 50 * dt;
      b.alpha -= 2 * dt;
      return b.alpha > 0;
    });
  }

  /* ── Drawing ────────────────────────────────────────── */

  function drawGreenPattern() {
    var cw = canvas.width, ch = canvas.height;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#1a5c1a';
    ctx.lineWidth = 1;
    for (var xi = 0; xi < cw; xi += 40) {
      ctx.beginPath(); ctx.moveTo(xi, 0); ctx.lineTo(xi, ch); ctx.stroke();
    }
    for (var yi = 0; yi < ch; yi += 40) {
      ctx.beginPath(); ctx.moveTo(0, yi); ctx.lineTo(cw, yi); ctx.stroke();
    }
    ctx.restore();
  }

  function drawGame() {
    var cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    ctx.fillStyle = '#2d7a2d';
    ctx.fillRect(0, 0, cw, ch);
    drawGreenPattern();

    if (!level) return;

    // entities
    level.entities.forEach(function (e) {
      if (e._alive === false) return;
      switch (e.t) {
        case 'wall':    drawWall(e, '#888888', 1); break;
        case 'weak':    drawWeakWall(e); break;
        case 'swwall':  drawSwWall(e); break;
        case 'tri':     drawTri(e); break;
        case 'ganggle': if (e._alive !== false) drawGanggle(e); break;
        case 'water':   drawWater(e); break;
        case 'sand':    drawSand(e); break;
        case 'switch':  drawSwitch(e); break;
        case 'car':     drawCar(e); break;
        case 'coin':    if (e._alive !== false) drawCoin(e); break;
      }
    });

    // hole
    drawHole();

    // ball
    if (gameState !== 'levelcomplete' || ballSinkScale > 0.05) {
      drawBall(ball.x, ball.y, ball.r * ballSinkScale);
    }

    // cube
    if (cubeE && cubeState !== 'catching') {
      drawCube();
    }

    // aim line
    if (aiming) {
      drawAimLine();
    }

    // bonk effects
    bonkEffects.forEach(function (b) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = b.color || '#00ffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // flash overlay
    if (flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = flashColor || '#fff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
      flashAlpha = Math.max(0, flashAlpha - 0.03);
    }

    // level complete overlay
    if (gameState === 'levelcomplete') {
      ctx.save();
      ctx.globalAlpha = Math.min(1, completionTimer * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffe066';
      ctx.font = 'bold 36px monospace';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 20;
      ctx.fillText(strokes === 1 ? 'HOLE IN ONE!' : 'LEVEL COMPLETE!', cw / 2, ch / 2 - 20);
      ctx.font = '18px monospace';
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.fillText('Strokes: ' + strokes + '  Par: ' + level.par, cw / 2, ch / 2 + 24);
      ctx.restore();
    }

    // gameover screen
    if (gameState === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e0b0ff';
      ctx.font = 'bold 40px monospace';
      ctx.shadowColor = '#a050ff';
      ctx.shadowBlur = 20;
      ctx.fillText('CAMPAIGN COMPLETE!', cw / 2, ch / 2 - 40);
      ctx.shadowBlur = 0;
      ctx.font = '22px monospace';
      ctx.fillStyle = '#ffe066';
      ctx.fillText('Final Score: ' + totalScore, cw / 2, ch / 2 + 10);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Click to return to menu', cw / 2, ch / 2 + 50);
      ctx.restore();
    }
  }

  function drawWall(e, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.fillStyle = color || '#888888';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.restore();
  }

  function drawWeakWall(e) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#666666';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.restore();
  }

  function drawSwWall(e) {
    ctx.save();
    if (e.on) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#cc4400';
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x, e.y, e.w, e.h);
    } else {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#cc4400';
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x, e.y, e.w, e.h);
    }
    ctx.restore();
  }

  function drawTri(e) {
    var verts = triVertices(e);
    ctx.save();
    ctx.fillStyle = '#888888';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    ctx.lineTo(verts[1].x, verts[1].y);
    ctx.lineTo(verts[2].x, verts[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawGanggle(e) {
    var r = e.r || 14;
    if (imgGangle && imgGangle.complete && imgGangle.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(imgGangle, e.x - r, e.y - r, r * 2, r * 2);
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = '#00ffee';
      ctx.shadowColor = '#00ffee'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  function drawWater(e) {
    ctx.save();
    ctx.fillStyle = '#1a5fbe';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = 'rgba(100,180,255,0.5)';
    ctx.lineWidth = 2;
    for (var row = 0; row < 3; row++) {
      var wy = e.y + e.h * (0.25 + row * 0.25);
      ctx.beginPath();
      for (var wx = e.x; wx <= e.x + e.w; wx += 4) {
        var wsy = wy + Math.sin((wx + waveOffset * 30) * 0.08) * 3;
        if (wx === e.x) ctx.moveTo(wx, wsy);
        else ctx.lineTo(wx, wsy);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = '#3399ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.restore();
  }

  function drawSand(e) {
    ctx.save();
    ctx.fillStyle = '#c8a96e';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = '#b8904a';
    for (var si = 0; si < 12; si++) {
      var sx = e.x + ((si * 37 + 7) % e.w);
      var sy = e.y + ((si * 53 + 11) % e.h);
      ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#a07840';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.restore();
  }

  function drawSwitch(e) {
    ctx.save();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffee00';
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r || 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#553300';
    ctx.font = 'bold ' + ((e.r || 18) * 1.1) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', e.x, e.y + 1);
    ctx.restore();
  }

  function drawCar(e) {
    ctx.save();
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = '#cc5500';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = '#222';
    var wr = Math.min(e.h * 0.5, 7);
    ctx.beginPath(); ctx.arc(e.x + wr + 2,       e.y + e.h - 2, wr, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(e.x + e.w - wr - 2, e.y + e.h - 2, wr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawCoin(e) {
    ctx.save();
    ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 8;
    var grad = ctx.createRadialGradient(e.x - 3, e.y - 3, 1, e.x, e.y, e.r);
    grad.addColorStop(0, '#ffe066');
    grad.addColorStop(1, '#cc8800');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#884400';
    ctx.font = 'bold ' + Math.floor(e.r * 1.2) + 'px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('\u00a2', e.x, e.y + 1);
    ctx.restore();
  }

  function drawHole() {
    var h = level.hole;
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(h.x, h.y - h.r);
    ctx.lineTo(h.x, h.y - h.r - 28);
    ctx.stroke();
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(h.x, h.y - h.r - 28);
    ctx.lineTo(h.x + 16, h.y - h.r - 20);
    ctx.lineTo(h.x, h.y - h.r - 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBall(x, y, r) {
    if (imgBall && imgBall.complete && imgBall.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(imgBall, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      var grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#cccccc');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawCube() {
    if (imgCube && imgCube.complete && imgCube.naturalWidth > 0) {
      ctx.save();
      var hs = 13;
      ctx.shadowColor = '#cc00cc'; ctx.shadowBlur = 16;
      ctx.drawImage(imgCube, cubeE.x - hs, cubeE.y - hs, hs * 2, hs * 2);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      ctx.save();
      var hs2 = 13;
      ctx.shadowColor = '#cc00cc';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#8800cc';
      ctx.fillRect(cubeE.x - hs2, cubeE.y - hs2, hs2 * 2, hs2 * 2);
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cubeE.x - hs2, cubeE.y - hs2, hs2 * 2, hs2 * 2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cubeE.x - 7, cubeE.y - 5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cubeE.x + 7, cubeE.y - 5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(cubeE.x - 7, cubeE.y - 5, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cubeE.x + 7, cubeE.y - 5, 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ff44ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cubeE.x, cubeE.y + 10, 7, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawAimLine() {
    var dx = aimStart.x - aimCurrent.x;
    var dy = aimStart.y - aimCurrent.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 3) return;
    var nx = dx / dist, ny = dy / dist;
    var power = Math.min(dist, 140) / 140;

    var endX = ball.x + nx * power * 120;
    var endY = ball.y + ny * power * 120;
    // Clamp end of aim line to canvas bounds
    endX = Math.max(4, Math.min(canvas.width  - 4, endX));
    endY = Math.max(4, Math.min(canvas.height - 4, endY));

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(aimCurrent.x, aimCurrent.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ── Level Complete Anim ────────────────────────────── */

  function updateLevelComplete(dt) {
    completionTimer += dt;
    ballSinkScale = Math.max(0, 1 - completionTimer * 3);
    if (completionTimer > 2) {
      totalTime += levelTime;
      advanceLevel();
    }
  }

  /* ── Editor ─────────────────────────────────────────── */

  function openEditor() {
    gameState = 'editor';
    editorEntities = [];
    editorBall = { x: 200, y: 400 };
    editorHole = { x: 400, y: 150 };
    editorCube = null;
    editorLevelName = 'My Level';
    editorPar = 3;
    editorCodeOutput = '';
    editorSelected = null;
    editorIsDragging = false;
    buildEditorPanel();
  }

  function buildEditorPanel() {
    leftPanel.innerHTML = '';

    // logo at top
    var logo = document.createElement('img');
    logo.src = MEME_PATH + 'logo.png';
    logo.style.cssText = 'width:100%;max-height:50px;object-fit:contain;margin-bottom:6px;';
    leftPanel.appendChild(logo);

    // level name + par inputs
    var inputs = document.createElement('div');
    inputs.id = 'tqg-editorinputs';
    inputs.innerHTML = '<label>Name</label><input id="tqg-ed-name" value="' + editorLevelName + '">'
                     + '<label>Par</label><input id="tqg-ed-par" type="number" value="' + editorPar + '" min="1">';
    leftPanel.appendChild(inputs);

    // toolbar
    var toolbar = document.createElement('div');
    toolbar.id = 'tqg-ed-toolbar';

    var MODE_TOOLS = [
      { id: 'select', icon: '\u2196', title: 'Select / Move' },
      { id: 'rotate', icon: '\u21bb', title: 'Rotate (triangles)' },
    ];
    var CREATE_TOOLS = [
      { id: 'ball',    icon: '\u26f3', title: 'Ball Start' },
      { id: 'hole',    icon: '\uD83D\uDD73', title: 'Hole' },
      { id: 'wall',    icon: '\u25a9', title: 'Wall' },
      { id: 'weak',    icon: '\u2591', title: 'Weak Wall' },
      { id: 'water',   icon: '\uD83D\uDCA7', title: 'Water/Void' },
      { id: 'sand',    icon: '\u3030', title: 'Sand' },
      { id: 'ganggle', icon: '\u25c9', title: 'Ganggle' },
      { id: 'switch',  icon: '\u26a1', title: 'Switch' },
      { id: 'swwall',  icon: '\uD83D\uDD34', title: 'Switch Wall' },
      { id: 'car',     icon: '\uD83D\uDE97', title: 'Car' },
      { id: 'tri',     icon: '\u25b3', title: 'Triangle' },
      { id: 'cube',    icon: '\uD83D\uDC7E', title: 'Cube Start' },
      { id: 'coin',    icon: '\u00a2', title: 'Coin' },
    ];

    var sep = document.createElement('div');
    sep.style.cssText = 'width:100%;height:1px;background:rgba(255,255,255,.15);margin:4px 0;';

    var allToolDefs = MODE_TOOLS.concat([{ sep: true }]).concat(CREATE_TOOLS);
    allToolDefs.forEach(function (t) {
      if (t.sep) { toolbar.appendChild(sep); return; }
      var btn = document.createElement('button');
      btn.className = 'tqg-editortoolbtn' + (editorTool === t.id ? ' active' : '');
      btn.textContent = t.icon;
      btn.title = t.title;
      btn.dataset.tool = t.id;
      btn.addEventListener('click', function () {
        editorTool = t.id;
        toolbar.querySelectorAll('.tqg-editortoolbtn').forEach(function (b) {
          b.classList.toggle('active', b.dataset.tool === t.id);
        });
      });
      toolbar.appendChild(btn);
    });
    leftPanel.appendChild(toolbar);

    // trash button row
    var trashRow = document.createElement('div');
    trashRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:4px;';
    var trashBtn = document.createElement('button');
    trashBtn.id = 'tqg-ed-trash';
    var trashImg = document.createElement('img');
    trashImg.src = MEME_PATH + 'trash.png';
    trashBtn.appendChild(trashImg);
    trashBtn.title = 'Delete selected (Del)';
    trashBtn.disabled = true;
    trashBtn.addEventListener('click', deleteSelectedEntity);
    var trashLabel = document.createElement('span');
    trashLabel.id = 'tqg-ed-sellabel';
    trashLabel.style.cssText = 'font-size:10px;color:#aaa;';
    trashLabel.textContent = 'Nothing selected';
    trashRow.appendChild(trashBtn);
    trashRow.appendChild(trashLabel);
    leftPanel.appendChild(trashRow);

    // action buttons
    var actRow = document.createElement('div');
    actRow.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:4px;';

    var testBtn = document.createElement('button');
    testBtn.className = 'tqg-menubtn'; testBtn.style.fontSize = '11px'; testBtn.style.padding = '6px';
    testBtn.textContent = '\u25b6 TEST LEVEL'; testBtn.addEventListener('click', testEditorLevel);

    var genBtn = document.createElement('button');
    genBtn.className = 'tqg-menubtn'; genBtn.style.fontSize = '11px'; genBtn.style.padding = '6px';
    genBtn.textContent = '{ } GENERATE CODE'; genBtn.addEventListener('click', generateEditorCode);

    var codeBox = document.createElement('textarea');
    codeBox.id = 'tqg-codebox'; codeBox.readOnly = true;
    codeBox.placeholder = 'Code will appear here...';

    var backBtn = document.createElement('button');
    backBtn.className = 'tqg-menubtn'; backBtn.style.fontSize = '11px'; backBtn.style.padding = '6px';
    backBtn.textContent = '\u2190 BACK';
    backBtn.addEventListener('click', function () {
      gameState = 'menu';
      editorSelected = null;
      document.removeEventListener('keydown', editorKeyHandler);
      rebuildStatsPanel();
    });

    [testBtn, genBtn, codeBox, backBtn].forEach(function (el) { actRow.appendChild(el); });
    leftPanel.appendChild(actRow);

    document.addEventListener('keydown', editorKeyHandler);
  }

  function editorKeyHandler(e) {
    if (gameState !== 'editor') return;
    // Don't intercept if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    var keyMap = {
      's': 'select', 'S': 'select',
      'r': 'rotate', 'R': 'rotate',
      'b': 'ball',   'B': 'ball',
      'h': 'hole',   'H': 'hole',
      'w': 'wall',   'W': 'wall',
      'k': 'weak',   'K': 'weak',
      'a': 'water',  'A': 'water',
      'd': 'sand',   'D': 'sand',
      'g': 'ganggle','G': 'ganggle',
      't': 'switch', 'T': 'switch',
      'c': 'coin',   'C': 'coin',
      'u': 'cube',   'U': 'cube',
    };

    if (keyMap[e.key]) {
      e.preventDefault();
      editorTool = keyMap[e.key];
      // Update toolbar buttons
      var toolbar = document.getElementById('tqg-ed-toolbar');
      if (toolbar) {
        toolbar.querySelectorAll('.tqg-editortoolbtn').forEach(function(btn) {
          btn.classList.toggle('active', btn.dataset.tool === editorTool);
        });
      }
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelectedEntity();
    }
    if (e.key === 'Escape') {
      gameState = 'menu';
      editorSelected = null;
      rebuildStatsPanel();
    }
  }

  function deleteSelectedEntity() {
    if (editorSelected === null) return;
    if (editorSelected === 'ball') { editorBall = { x: 200, y: 400 }; }
    else if (editorSelected === 'hole') { editorHole = { x: 400, y: 150 }; }
    else if (editorSelected === 'cube') { editorCube = null; }
    else if (typeof editorSelected === 'number') {
      editorEntities.splice(editorSelected, 1);
    }
    editorSelected = null;
    updateEditorSelection();
  }

  function updateEditorSelection() {
    var label = document.getElementById('tqg-ed-sellabel');
    var trash  = document.getElementById('tqg-ed-trash');
    if (label) label.textContent = editorSelected !== null ? 'Selected' : 'Nothing selected';
    if (trash) trash.disabled = (editorSelected === null);
  }

  function findEditorEntityAt(px, py) {
    var bd = Math.sqrt((px - editorBall.x) * (px - editorBall.x) + (py - editorBall.y) * (py - editorBall.y));
    if (bd < 14) return 'ball';
    var hd = Math.sqrt((px - editorHole.x) * (px - editorHole.x) + (py - editorHole.y) * (py - editorHole.y));
    if (hd < 16) return 'hole';
    if (editorCube) {
      var cd = Math.sqrt((px - editorCube.x) * (px - editorCube.x) + (py - editorCube.y) * (py - editorCube.y));
      if (cd < 24) return 'cube';
    }
    for (var i = editorEntities.length - 1; i >= 0; i--) {
      var e = editorEntities[i];
      if (e.t === 'ganggle' || e.t === 'switch' || e.t === 'coin' || e.t === 'tri') {
        var r = e.r || e.size || 18;
        var d = Math.sqrt((px - e.x) * (px - e.x) + (py - e.y) * (py - e.y));
        if (d < r + 8) return i;
      } else if (e.w !== undefined && e.h !== undefined) {
        if (px >= e.x && px <= e.x + e.w && py >= e.y && py <= e.y + e.h) return i;
      } else {
        var d2 = Math.sqrt((px - e.x) * (px - e.x) + (py - e.y) * (py - e.y));
        if (d2 < 20) return i;
      }
    }
    return null;
  }

  function getEditorEntity(sel) {
    if (sel === 'ball')  return editorBall;
    if (sel === 'hole')  return editorHole;
    if (sel === 'cube')  return editorCube;
    if (typeof sel === 'number') return editorEntities[sel];
    return null;
  }

  function rebuildStatsPanel() {
    leftPanel.innerHTML = [
      '<div id="tqg-title"><img id="tqg-logo" src="' + MEME_PATH + 'logo.png" alt="Uncanny Cube Golf" style="width:100%;max-height:80px;object-fit:contain;"></div>',
      '<div id="tqg-stats">',
      '  Strokes: <span id="tqg-s-strokes">0</span><br>',
      '  Time: <span id="tqg-s-time">00:00</span><br>',
      '  Total: <span id="tqg-s-total">00:00</span><br>',
      '  Score: <span id="tqg-s-score">0</span><br>',
      '  <span id="tqg-resets">Resets: <span id="tqg-s-resets">0</span></span><br>',
      '  <span id="tqg-skips">Skips: <span id="tqg-s-skips">0</span></span><br>',
      '  Level: <span id="tqg-levelname" id="tqg-s-levelname">-</span><br>',
      '  Par: <span id="tqg-par" id="tqg-s-par">-</span>',
      '</div>',
      '<div id="tqg-reaction-wrap">',
      '  <div id="tqg-reaction-label">▣ CUBE THOUGHT DISPLAYER 9000 ▣</div>',
      '  <img id="tqg-meme" src="" alt="">',
      '</div>',
    ].join('');
    memeImg = document.getElementById('tqg-meme');
    showReaction('idle');
    updateStats();
  }

  function getEditorLevel() {
    var name = (document.getElementById('tqg-ed-name') || {}).value || 'My Level';
    var par  = parseInt((document.getElementById('tqg-ed-par') || {}).value || '3', 10);
    var lvl = {
      name: name, par: par,
      ball: { x: editorBall.x, y: editorBall.y },
      hole: { x: editorHole.x, y: editorHole.y, r: 14 },
      entities: editorEntities.slice()
    };
    if (editorCube) lvl.cube = { x: editorCube.x, y: editorCube.y };
    return lvl;
  }

  function generateEditorCode() {
    var lvl = getEditorLevel();
    var code = encodeLevel(lvl);
    var box = document.getElementById('tqg-codebox');
    if (box) { box.value = code; box.select(); }
  }

  function testEditorLevel() {
    var lvl = getEditorLevel();
    var code = encodeLevel(lvl);
    currentLevelIndex = -1;
    currentLevelCode  = code;
    loadLevel(lvl);
    gameState = 'playing';
    document.removeEventListener('keydown', editorKeyHandler);
    rebuildStatsPanel();
  }

  var SNAP = 10;
  function snap(v) { return Math.round(v / SNAP) * SNAP; }

  function editorLeftClick(p, e) {
    var sx = snap(p.x), sy = snap(p.y);
    var tool = editorTool;

    // select mode
    if (tool === 'select') {
      editorSelected = findEditorEntityAt(p.x, p.y);
      if (editorSelected !== null) {
        var ent = getEditorEntity(editorSelected);
        if (ent) { editorDragOffX = ent.x - p.x; editorDragOffY = ent.y - p.y; }
        editorIsDragging = true;
      } else {
        editorIsDragging = false;
      }
      updateEditorSelection();
      return;
    }

    // rotate mode
    if (tool === 'rotate') {
      editorSelected = findEditorEntityAt(p.x, p.y);
      updateEditorSelection();
      return;
    }

    // placement tools
    if (tool === 'ball') { editorBall = { x: sx, y: sy }; return; }
    if (tool === 'hole') { editorHole = { x: sx, y: sy }; return; }
    if (tool === 'cube') { editorCube = { x: sx, y: sy }; return; }
    if (tool === 'ganggle') {
      editorEntities.push({ t: 'ganggle', x: sx, y: sy, r: 14, vx: 70, vy: 60 });
      return;
    }
    if (tool === 'switch') {
      editorEntities.push({ t: 'switch', x: sx, y: sy, r: 18, sid: 1 });
      return;
    }
    if (tool === 'tri') {
      editorEntities.push({ t: 'tri', x: sx, y: sy, size: 40, angle: 0 });
      return;
    }
    if (tool === 'coin') {
      editorEntities.push({ t: 'coin', x: sx, y: sy, r: 10 });
      return;
    }
    // drag-based tools
    editorDragging = true;
    editorDragStart = { x: sx, y: sy, tool: tool };
  }

  function editorFinishDrag(p) {
    if (!editorDragStart) { editorDragging = false; return; }
    var sx = snap(p.x), sy = snap(p.y);
    var ds = editorDragStart;
    var x = Math.min(ds.x, sx), y = Math.min(ds.y, sy);
    var w = Math.abs(sx - ds.x) || SNAP, h = Math.abs(sy - ds.y) || SNAP;
    var tool = ds.tool;
    if (tool === 'wall')   editorEntities.push({ t: 'wall',   x: x, y: y, w: w, h: h });
    if (tool === 'weak')   editorEntities.push({ t: 'weak',   x: x, y: y, w: w, h: h });
    if (tool === 'water')  editorEntities.push({ t: 'water',  x: x, y: y, w: w, h: h });
    if (tool === 'sand')   editorEntities.push({ t: 'sand',   x: x, y: y, w: w, h: h });
    if (tool === 'swwall') editorEntities.push({ t: 'swwall', x: x, y: y, w: w, h: h, sid: 1, on: false });
    if (tool === 'car')    editorEntities.push({ t: 'car',    x: x, y: y, w: w, h: h, dir: 'h', spd: 80, min: x, max: x + 200 });
    editorDragging  = false;
    editorDragStart = null;
  }

  function drawEditor() {
    var cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#2d7a2d';
    ctx.fillRect(0, 0, cw, ch);
    drawGreenPattern();

    // grid
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    for (var xi = 0; xi < cw; xi += SNAP) {
      ctx.beginPath(); ctx.moveTo(xi, 0); ctx.lineTo(xi, ch); ctx.stroke();
    }
    for (var yi = 0; yi < ch; yi += SNAP) {
      ctx.beginPath(); ctx.moveTo(0, yi); ctx.lineTo(cw, yi); ctx.stroke();
    }
    ctx.restore();

    // draw entities
    editorEntities.forEach(function (e) {
      switch (e.t) {
        case 'wall':    drawWall(e, '#888888', 1); break;
        case 'weak':    drawWeakWall(e); break;
        case 'water':   drawWater(e); break;
        case 'sand':    drawSand(e); break;
        case 'swwall':  drawSwWall(e); break;
        case 'car':     drawCar(e); break;
        case 'switch':  drawSwitch(e); break;
        case 'tri':     drawTri(e); break;
        case 'ganggle': drawGanggle(e); break;
        case 'coin':    drawCoin(e); break;
      }
    });

    // ball start marker
    ctx.save();
    ctx.strokeStyle = '#66ff66';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(editorBall.x, editorBall.y, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#66ff66';
    ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('B', editorBall.x, editorBall.y);
    ctx.restore();

    // hole
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(editorHole.x, editorHole.y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(editorHole.x, editorHole.y - 14); ctx.lineTo(editorHole.x, editorHole.y - 40); ctx.stroke();
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(editorHole.x, editorHole.y - 40);
    ctx.lineTo(editorHole.x + 14, editorHole.y - 32);
    ctx.lineTo(editorHole.x, editorHole.y - 24);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // cube start
    if (editorCube) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#8800cc';
      ctx.fillRect(editorCube.x - 22, editorCube.y - 22, 44, 44);
      ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2;
      ctx.strokeRect(editorCube.x - 22, editorCube.y - 22, 44, 44);
      ctx.restore();
    }

    // drag preview
    if (editorDragging && editorDragStart) {
      var mp = mousePos;
      var ddx = snap(mp.x) - editorDragStart.x;
      var ddy = snap(mp.y) - editorDragStart.y;
      var ppx = Math.min(editorDragStart.x, snap(mp.x));
      var ppy = Math.min(editorDragStart.y, snap(mp.y));
      var ppw = Math.abs(ddx) || SNAP, pph = Math.abs(ddy) || SNAP;
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ppx, ppy, ppw, pph);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.strokeRect(ppx, ppy, ppw, pph);
      ctx.restore();
    }

    // selection highlight
    if (editorSelected !== null) {
      var se = getEditorEntity(editorSelected);
      if (se) {
        ctx.save();
        ctx.strokeStyle = '#00ffee';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        if (se.w !== undefined && se.h !== undefined) {
          ctx.strokeRect(se.x - 2, se.y - 2, se.w + 4, se.h + 4);
        } else {
          var sr = se.r || se.size || 16;
          ctx.beginPath(); ctx.arc(se.x, se.y, sr + 4, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }

  /* ── Helpers ────────────────────────────────────────── */

  function roundRect(ctx2, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.lineTo(x + w - r, y);
    ctx2.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx2.lineTo(x + w, y + h - r);
    ctx2.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx2.lineTo(x + r, y + h);
    ctx2.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx2.lineTo(x, y + r);
    ctx2.quadraticCurveTo(x, y, x + r, y);
    ctx2.closePath();
  }

  /* ── Main loop ──────────────────────────────────────── */

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    if (dt <= 0) { dt = 0.016; }

    // ambient random meme timer — runs in all states
    if (!paused) {
      randomMemeTimer -= dt;
      if (randomMemeTimer <= 0) {
        randomMemeTimer = 20 + Math.random() * 15;
        showRandomMeme();
      }
    }

    if (gameState === 'playing' && !paused) {
      levelTime += dt;
      updatePhysics(dt);
      updateCube(dt);
      updateBonks(dt);
      updateStats();
      drawGame();
    } else if (gameState === 'paused') {
      drawGame();
    } else if (gameState === 'levelcomplete') {
      updateLevelComplete(dt);
      drawGame();
    } else if (gameState === 'gameover') {
      drawGame();
    } else if (gameState === 'menu') {
      drawMenu();
    } else if (gameState === 'editor') {
      drawEditor();
    } else if (gameState === 'loadlevel') {
      drawMenu();
    }
  }

  /* ── Exit ───────────────────────────────────────────── */

  function exitGame() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup',   onMouseUp);
    window.removeEventListener('resize',    resizeCanvas);
    document.removeEventListener('keydown', editorKeyHandler);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    var style = document.getElementById('tqg-style');
    if (style && style.parentNode) style.parentNode.removeChild(style);
    var portrait = document.getElementById('tqg-portrait');
    if (portrait && portrait.parentNode) portrait.parentNode.removeChild(portrait);
    if (typeof onExitCb === 'function') onExitCb();
  }

  /* ── Gameover click ─────────────────────────────────── */

  function handleGameoverClick() {
    gameState = 'menu';
  }

  /* ── Init ───────────────────────────────────────────── */

  function init(onExit) {
    onExitCb = onExit || null;
    injectCSS();
    buildDOM();
    preloadSprites();
    loadHowler(function() { initSounds(); });
    loadManifest();

    canvas.addEventListener('mousemove',   onMouseMove);
    canvas.addEventListener('mousedown',   onMouseDown);
    canvas.addEventListener('mouseup',     onMouseUp);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); onMouseDown(e); });

    // Touch controls — mirror mouse events using first touch point
    function fakeEvent(te) {
      var t = te.touches[0] || te.changedTouches[0];
      return { clientX: t.clientX, clientY: t.clientY, button: 0 };
    }
    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      onMouseDown(fakeEvent(e));
    }, { passive: false });
    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      onMouseMove(fakeEvent(e));
    }, { passive: false });
    canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      onMouseUp(fakeEvent(e));
    }, { passive: false });
    window.addEventListener('resize', function () {
      resizeCanvas();
      if (gameState === 'menu') buildMenuButtons();
    });

    canvas.addEventListener('click', function () {
      if (gameState === 'gameover') handleGameoverClick();
    });

    // Global keyboard: Escape / P for pause
    window.addEventListener('keydown', function(e) {
      if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && (gameState === 'playing' || gameState === 'paused')) {
        e.preventDefault();
        togglePause();
      }
    });

    lastTs = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  return { init: init };
})();
