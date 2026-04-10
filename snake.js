window.TuwaiqSnake = (function () {

  var C = {
    bg:       '#4f29b7',
    grid:     'rgba(255,255,255,0.025)',
    head:     '#57e3d8',
    body:     '#3ab8af',
    foodA:    '#f4a664',
    foodB:    '#a380ff',
    text:     '#ededed',
    dim:      'rgba(237,237,237,0.38)',
    accent:   '#57e3d8',
  };

  var FONT = "'IBM Plex Sans Arabic', sans-serif";

  var canvas, ctx, overlay;
  var cw, cols, rows;
  var snake, dir, nextDir, food, foodIdx, score, speed, loopId, lastStep, gameState;
  var onExitCb, keyHandler;

  /* ── Math ─────────────────────────── */

  function lerp(a, b, t) { return a + (b - a) * t; }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /* ── Grid ─────────────────────────── */

  function computeGrid() {
    cw   = Math.round(window.innerWidth / 24);
    cols = Math.floor(window.innerWidth  / cw);
    rows = Math.floor(window.innerHeight / cw);
  }

  /* ── Logo square positions ────────── */

  function getLogoRects() {
    var el = document.querySelector('.hero .pixel-plus');
    if (!el) return null;
    var r  = el.getBoundingClientRect();
    var sq = r.width * 0.5;
    return [
      { cx: r.left  + sq * 0.5,          cy: r.top + sq * 0.5,                     size: sq, color: C.head  },
      { cx: r.right - sq * 0.5,          cy: r.top + r.height * 0.3333 + sq * 0.5, size: sq, color: C.foodA },
      { cx: r.left  + sq * 0.5,          cy: r.top + r.height * 0.6667 + sq * 0.5, size: sq, color: C.foodB },
    ];
  }

  /* ── Draw helpers ─────────────────── */

  function rrect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y,         x + r, y);
    ctx.closePath();
  }

  function drawSquare(cx, cy, size, color) {
    var s = size * 0.84;
    var r = s * 0.22;
    ctx.fillStyle = color;
    rrect(cx - s / 2, cy - s / 2, s, s, r);
    ctx.fill();
  }

  function drawBg() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (var x = 0; x <= cols; x++) {
      ctx.beginPath(); ctx.moveTo(x * cw, 0); ctx.lineTo(x * cw, rows * cw); ctx.stroke();
    }
    for (var y = 0; y <= rows; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cw); ctx.lineTo(cols * cw, y * cw); ctx.stroke();
    }
  }

  function segColor(i) {
    if (i === 0) return C.head;
    if (i === 1 && snake.length <= 6) return C.foodA;
    if (i === 2 && snake.length <= 6) return C.foodB;
    return C.body;
  }

  function drawSnake() {
    snake.forEach(function (seg, i) {
      drawSquare(seg.x * cw + cw / 2, seg.y * cw + cw / 2, cw, segColor(i));
    });
  }

  function drawFood() {
    var cx = food.x * cw + cw / 2;
    var cy = food.y * cw + cw / 2;
    drawSquare(cx, cy, cw, foodIdx === 0 ? C.foodA : C.foodB);
    var s = cw * 0.84;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    rrect(cx - s / 2 + s * 0.08, cy - s / 2 + s * 0.08, s * 0.32, s * 0.32, 3);
    ctx.fill();
  }

  function drawHUD() {
    var fs = Math.max(12, Math.min(15, canvas.width * 0.017));
    ctx.font = '700 ' + fs + 'px ' + FONT;
    ctx.fillStyle  = C.accent;
    ctx.textAlign  = 'left';
    ctx.fillText('Score  ' + score, 18, 18 + fs);
    ctx.font = '400 ' + (fs - 1) + 'px ' + FONT;
    ctx.fillStyle  = C.dim;
    ctx.textAlign  = 'right';
    ctx.fillText('ESC — exit', canvas.width - 18, 18 + fs);
  }

  /* ── Overlay & canvas fade ────────── */

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(14,5,46,0.96);z-index:9998;opacity:0;transition:opacity 0.55s ease;pointer-events:none;';
    document.body.appendChild(overlay);
  }

  function buildCanvas() {
    canvas = document.createElement('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;opacity:0;transition:opacity 0.55s ease;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }

  function fadeIn() {
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      canvas.style.opacity  = '1';
    });
  }

  function hideLogo() {
    var logo = document.querySelector('.hero .pixel-plus');
    if (!logo) return;
    logo.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    logo.style.transform  = 'scale(2.8)';
    logo.style.opacity    = '0';
  }

  function restoreLogo() {
    var logo = document.querySelector('.hero .pixel-plus');
    if (!logo) return;
    logo.style.transform = 'scale(1)';
    logo.style.opacity   = '1';
  }

  /* ── Assembly animation ───────────── */

  function runAssembly(logoRects, onDone) {
    var sx = Math.floor(cols / 2);
    var sy = Math.floor(rows / 2);

    var targets = [
      { cx: sx       * cw + cw / 2, cy: sy * cw + cw / 2, size: cw },
      { cx: (sx - 1) * cw + cw / 2, cy: sy * cw + cw / 2, size: cw },
      { cx: (sx - 2) * cw + cw / 2, cy: sy * cw + cw / 2, size: cw },
    ];

    var dur   = 680;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var t  = Math.min((ts - start) / dur, 1);
      var et = easeOutCubic(t);

      drawBg();

      logoRects.forEach(function (sq, i) {
        var tgt = targets[i];
        drawSquare(
          lerp(sq.cx,   tgt.cx,   et),
          lerp(sq.cy,   tgt.cy,   et),
          lerp(sq.size, tgt.size, et),
          sq.color
        );
      });

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        showWaitHint(onDone);
      }
    }

    requestAnimationFrame(frame);
  }

  function showWaitHint(onDone) {
    drawBg();
    drawSnake();

    var cx = canvas.width / 2;
    var cy = canvas.height * 0.74;
    var fs = Math.max(11, Math.min(14, canvas.width * 0.016));
    ctx.font      = '400 ' + fs + 'px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillStyle = C.dim;
    ctx.fillText('Press an arrow key to begin', cx, cy);

    var gone = false;
    function kick(e) {
      var map = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
      var d = map[e.key];
      if (!d) return;
      if (gone) return;
      gone = true;
      e.preventDefault();
      window.removeEventListener('keydown', kick);
      dir = nextDir = d;
      onDone();
    }
    window.addEventListener('keydown', kick);
    setTimeout(function () {
      if (gone) return;
      gone = true;
      window.removeEventListener('keydown', kick);
      onDone();
    }, 3000);
  }

  /* ── Game ─────────────────────────── */

  function initGame() {
    var sx = Math.floor(cols / 2);
    var sy = Math.floor(rows / 2);
    snake   = [{ x: sx, y: sy }, { x: sx - 1, y: sy }, { x: sx - 2, y: sy }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;
    speed   = 130;
    foodIdx = 0;
    lastStep = 0;
    spawnFood();
  }

  function spawnFood() {
    var pos;
    do { pos = { x: randInt(0, cols - 1), y: randInt(0, rows - 1) }; }
    while (snake.some(function (s) { return s.x === pos.x && s.y === pos.y; }));
    food = pos;
    foodIdx = foodIdx === 0 ? 1 : 0;
  }

  function step() {
    dir = { x: nextDir.x, y: nextDir.y };
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) return endGame();
    if (snake.some(function (s) { return s.x === head.x && s.y === head.y; })) return endGame();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      if (score % 5 === 0) speed = Math.max(60, speed - 8);
      spawnFood();
    } else {
      snake.pop();
    }
  }

  function loop(ts) {
    if (gameState !== 'running') return;
    loopId = requestAnimationFrame(loop);
    if (ts - lastStep > speed) { lastStep = ts; step(); }
    drawBg();
    drawFood();
    drawSnake();
    drawHUD();
  }

  /* ── Game over ────────────────────── */

  function drawGameOverScreen() {
    drawBg(); drawSnake();
    ctx.fillStyle = 'rgba(14,5,46,0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var cx = canvas.width / 2, cy = canvas.height / 2;
    var bw = Math.min(370, canvas.width * 0.72), bh = 148;
    ctx.fillStyle = 'rgba(14,5,46,0.95)';
    rrect(cx - bw / 2, cy - bh / 2, bw, bh, 18); ctx.fill();
    ctx.strokeStyle = C.foodA; ctx.lineWidth = 1.5;
    rrect(cx - bw / 2, cy - bh / 2, bw, bh, 18); ctx.stroke();

    var ts = Math.max(20, Math.min(28, canvas.width * 0.034));
    ctx.textAlign = 'center';
    ctx.font = '700 ' + ts + 'px ' + FONT; ctx.fillStyle = C.text;
    ctx.fillText('Game Over', cx, cy - 14);
    ctx.font = '500 ' + Math.round(ts * 0.62) + 'px ' + FONT; ctx.fillStyle = C.accent;
    ctx.fillText('Score  ' + score, cx, cy + 16);
    ctx.font = '400 ' + Math.round(ts * 0.5) + 'px ' + FONT; ctx.fillStyle = C.dim;
    ctx.fillText('Press any key to exit', cx, cy + 46);
  }

  function endGame() {
    gameState = 'over';
    cancelAnimationFrame(loopId);
    window.removeEventListener('keydown', keyHandler);
    drawGameOverScreen();
    window.addEventListener('keydown', function once() {
      window.removeEventListener('keydown', once);
      doExit();
    });
  }

  /* ── Exit ─────────────────────────── */

  function doExit() {
    gameState = 'exiting';
    cancelAnimationFrame(loopId);
    window.removeEventListener('keydown', keyHandler);

    canvas.style.transition = 'opacity 0.45s ease';
    canvas.style.opacity    = '0';

    setTimeout(function () {
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity    = '0';
      restoreLogo();

      setTimeout(function () {
        if (canvas  && canvas.parentNode)  canvas.parentNode.removeChild(canvas);
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        canvas = null; overlay = null;
        if (onExitCb) onExitCb();
      }, 520);
    }, 380);
  }

  /* ── Keyboard ─────────────────────── */

  function buildKeyHandler() {
    var map = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
    keyHandler = function (e) {
      if (e.key === 'Escape') { doExit(); return; }
      if (gameState !== 'running') return;
      var d = map[e.key];
      if (!d) return;
      e.preventDefault();
      if (d.x === -dir.x && d.y === -dir.y) return;
      nextDir = d;
    };
    window.addEventListener('keydown', keyHandler);
  }

  /* ── Public ───────────────────────── */

  function init(onExit) {
    onExitCb = onExit || null;

    var logoRects = getLogoRects();

    buildOverlay();
    buildCanvas();
    computeGrid();
    initGame();
    buildKeyHandler();

    hideLogo();

    drawBg();
    if (logoRects) {
      logoRects.forEach(function (sq) {
        drawSquare(sq.cx, sq.cy, sq.size, sq.color);
      });
    }

    fadeIn();

    setTimeout(function () {
      gameState = 'assembly';
      if (logoRects) {
        runAssembly(logoRects, function () {
          gameState = 'running';
          loopId = requestAnimationFrame(loop);
        });
      } else {
        gameState = 'running';
        loopId = requestAnimationFrame(loop);
      }
    }, 580);
  }

  return { init: init };

})();
