window.TuwaiqSnake = (function () {

  var FIREBASE_URL = 'https://tuwaiqsnake-default-rtdb.asia-southeast1.firebasedatabase.app/leaderboard.json';

  var C = {
    bg:     '#4f29b7',
    grid:   'rgba(255,255,255,0.025)',
    head:   '#57e3d8',
    body:   '#3ab8af',
    foodA:  '#f4a664',
    foodB:  '#a380ff',
    text:   '#ededed',
    dim:    'rgba(237,237,237,0.38)',
    accent: '#57e3d8',
  };

  var FONT = "'IBM Plex Sans Arabic', sans-serif";

  var canvas, ctx, overlay;
  var cw, cols, rows;
  var snake, dir, nextDir, food, foodIdx, score, speed, loopId, lastStep, gameState;
  var onExitCb, keyHandler, swipeHandler;
  var isMobile = false;

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
      { cx: r.left  + sq * 0.5,  cy: r.top + sq * 0.5,                     size: sq, color: C.head  },
      { cx: r.right - sq * 0.5,  cy: r.top + r.height * 0.3333 + sq * 0.5, size: sq, color: C.foodA },
      { cx: r.left  + sq * 0.5,  cy: r.top + r.height * 0.6667 + sq * 0.5, size: sq, color: C.foodB },
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
    ctx.font      = '700 ' + fs + 'px ' + FONT;
    ctx.fillStyle = C.accent;
    ctx.textAlign = 'left';
    ctx.fillText('Score  ' + score, 18, 18 + fs);
    if (isMobile) {
      drawExitBtn();
    } else {
      ctx.font      = '400 ' + (fs - 1) + 'px ' + FONT;
      ctx.fillStyle = C.dim;
      ctx.textAlign = 'right';
      ctx.fillText('ESC — exit', canvas.width - 18, 18 + fs);
    }
  }

  function exitBtnCenter() {
    var r = Math.max(20, Math.min(26, canvas.width * 0.036));
    return { x: canvas.width - 18 - r, y: 18 + r, r: r };
  }

  function drawExitBtn() {
    var b = exitBtnCenter();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1.2;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
    var arm = b.r * 0.38;
    ctx.strokeStyle = C.text;
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(b.x - arm, b.y - arm); ctx.lineTo(b.x + arm, b.y + arm);
    ctx.moveTo(b.x + arm, b.y - arm); ctx.lineTo(b.x - arm, b.y + arm);
    ctx.stroke();
  }

  /* ── Overlay & canvas ─────────────── */

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
    var dur = 680, start = null;

    function frame(ts) {
      if (!start) start = ts;
      var t  = Math.min((ts - start) / dur, 1);
      var et = easeOutCubic(t);
      drawBg();
      logoRects.forEach(function (sq, i) {
        var tgt = targets[i];
        drawSquare(lerp(sq.cx, tgt.cx, et), lerp(sq.cy, tgt.cy, et), lerp(sq.size, tgt.size, et), sq.color);
      });
      if (t < 1) { requestAnimationFrame(frame); } else { showWaitHint(onDone); }
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

    if (isMobile) {
      onDone();
    } else {
      function kick(e) {
        var map = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
        var d = map[e.key];
        if (!d || gone) return;
        gone = true;
        e.preventDefault();
        window.removeEventListener('keydown', kick);
        dir = nextDir = d;
        onDone();
      }
      window.addEventListener('keydown', kick);
    }
  }

  /* ── Game ─────────────────────────── */

  function initGame() {
    var sx = Math.floor(cols / 2), sy = Math.floor(rows / 2);
    snake   = [{ x: sx, y: sy }, { x: sx - 1, y: sy }, { x: sx - 2, y: sy }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0; speed = 130; foodIdx = 0; lastStep = 0;
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
    } else { snake.pop(); }
  }

  function loop(ts) {
    if (gameState !== 'running') return;
    loopId = requestAnimationFrame(loop);
    if (ts - lastStep > speed) { lastStep = ts; step(); }
    drawBg(); drawFood(); drawSnake(); drawHUD();
  }

  /* ── Leaderboard ──────────────────── */

  function fetchLeaderboard(onDone) {
    var xhr = new XMLHttpRequest();
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      xhr.abort();
      onDone([]);
    }, 4000);
    xhr.open('GET', FIREBASE_URL);
    xhr.onload = function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        var data = JSON.parse(xhr.responseText);
        onDone(Array.isArray(data) ? data : []);
      } catch (e) { onDone([]); }
    };
    xhr.onerror = function () {
      if (done) return;
      done = true;
      clearTimeout(timer);
      onDone([]);
    };
    xhr.send();
  }

  function saveLeaderboard(lb, onDone) {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', FIREBASE_URL);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () { if (onDone) onDone(true); };
    xhr.onerror = function () { if (onDone) onDone(false); };
    xhr.send(JSON.stringify(lb));
  }

  function insertScore(lb, name, s) {
    var arr = lb.slice();
    arr.push({ name: name.toUpperCase(), score: s });
    arr.sort(function (a, b) { return b.score - a.score; });
    return arr.slice(0, 3);
  }

  function qualifiesForBoard(lb, s) {
    if (s <= 0) return false;
    if (lb.length < 3) return true;
    return s > lb[lb.length - 1].score;
  }

  /* ── Game over screen ─────────────── */

  function drawGameOverScreen(lb, qualifies, currentScore) {
    drawBg(); drawSnake();
    ctx.fillStyle = 'rgba(14,5,46,0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var cx = canvas.width / 2, cy = canvas.height / 2;
    var bw = Math.min(370, canvas.width * 0.82);
    var hasBoard = lb !== null;
    var bh = hasBoard ? 278 : 148;

    ctx.fillStyle = 'rgba(14,5,46,0.95)';
    rrect(cx - bw / 2, cy - bh / 2, bw, bh, 18); ctx.fill();
    ctx.strokeStyle = C.foodA; ctx.lineWidth = 1.5;
    rrect(cx - bw / 2, cy - bh / 2, bw, bh, 18); ctx.stroke();

    var ts = Math.max(18, Math.min(26, canvas.width * 0.032));
    ctx.textAlign = 'center';

    var topY = cy - bh / 2 + ts + 14;
    ctx.font = '700 ' + ts + 'px ' + FONT; ctx.fillStyle = C.text;
    ctx.fillText('Game Over', cx, topY);

    ctx.font = '500 ' + Math.round(ts * 0.62) + 'px ' + FONT; ctx.fillStyle = C.accent;
    ctx.fillText('Score  ' + currentScore, cx, topY + Math.round(ts * 0.8));

    if (hasBoard) {
      var divY = topY + Math.round(ts * 1.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - bw * 0.38, divY); ctx.lineTo(cx + bw * 0.38, divY); ctx.stroke();

      var lbFs = Math.max(11, Math.min(13, canvas.width * 0.015));
      ctx.font = '700 ' + lbFs + 'px ' + FONT;
      ctx.fillStyle = 'rgba(237,237,237,0.45)';
      ctx.fillText('LEADERBOARD', cx, divY + lbFs + 6);

      var medals = ['①', '②', '③'];
      var rowH = Math.round(lbFs * 2.4);
      var rowStartY = divY + lbFs * 2.6;

      for (var i = 0; i < 3; i++) {
        var entry = lb[i] || null;
        var ry = rowStartY + i * rowH;
        var isNew = entry && entry.score === currentScore && qualifies && i === findNewRank(lb, currentScore);

        if (isNew) {
          ctx.fillStyle = 'rgba(87,227,216,0.1)';
          rrect(cx - bw * 0.42, ry - lbFs - 2, bw * 0.84, rowH, 6);
          ctx.fill();
        }

        ctx.font = '400 ' + lbFs + 'px ' + FONT;
        ctx.fillStyle = isNew ? C.accent : 'rgba(237,237,237,0.55)';
        ctx.textAlign = 'left';
        ctx.fillText(medals[i], cx - bw * 0.36, ry);

        ctx.textAlign = 'left';
        ctx.fillStyle = isNew ? C.accent : C.text;
        ctx.font = (isNew ? '700' : '500') + ' ' + lbFs + 'px ' + FONT;
        ctx.fillText(entry ? entry.name : '—', cx - bw * 0.22, ry);

        ctx.textAlign = 'right';
        ctx.fillStyle = isNew ? C.accent : 'rgba(237,237,237,0.7)';
        ctx.font = (isNew ? '700' : '400') + ' ' + lbFs + 'px ' + FONT;
        ctx.fillText(entry ? entry.score : '—', cx + bw * 0.4, ry);
      }

      if (!qualifies) {
        var exitFs = Math.max(10, Math.min(12, canvas.width * 0.013));
        ctx.font = '400 ' + exitFs + 'px ' + FONT;
        ctx.fillStyle = C.dim;
        ctx.textAlign = 'center';
        ctx.fillText(isMobile ? 'Tap to exit' : 'Press any key to exit', cx, cy + bh / 2 - 14);
      }
    } else {
      ctx.font = '400 ' + Math.round(ts * 0.5) + 'px ' + FONT; ctx.fillStyle = C.dim;
      ctx.fillText(isMobile ? 'Tap to exit' : 'Press any key to exit', cx, cy + 46);
    }
  }

  function findNewRank(lb, s) {
    for (var i = 0; i < lb.length; i++) {
      if (lb[i].score === s) return i;
    }
    return -1;
  }

  function drawFetchingScreen() {
    drawBg(); drawSnake();
    ctx.fillStyle = 'rgba(14,5,46,0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var cx = canvas.width / 2, cy = canvas.height / 2;
    var bw = Math.min(370, canvas.width * 0.82), bh = 148;
    ctx.fillStyle = 'rgba(14,5,46,0.95)';
    rrect(cx - bw / 2, cy - bh / 2, bw, bh, 18); ctx.fill();
    ctx.strokeStyle = C.foodA; ctx.lineWidth = 1.5;
    rrect(cx - bw / 2, cy - bh / 2, bw, bh, 18); ctx.stroke();
    var ts = Math.max(18, Math.min(26, canvas.width * 0.032));
    ctx.textAlign = 'center';
    ctx.font = '700 ' + ts + 'px ' + FONT; ctx.fillStyle = C.text;
    ctx.fillText('Game Over', cx, cy - 14);
    ctx.font = '500 ' + Math.round(ts * 0.62) + 'px ' + FONT; ctx.fillStyle = C.accent;
    ctx.fillText('Score  ' + score, cx, cy + 16);
    ctx.font = '400 ' + Math.round(ts * 0.45) + 'px ' + FONT; ctx.fillStyle = C.dim;
    ctx.fillText('Fetching scores…', cx, cy + 46);
  }

  /* ── Name entry overlay ───────────── */

  function showNameEntry(onSave) {
    var wrap = document.createElement('div');
    wrap.style.cssText = [
      'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;',
      'z-index:10000;pointer-events:none;',
    ].join('');

    var box = document.createElement('div');
    var bw = Math.min(320, window.innerWidth * 0.82);
    box.style.cssText = [
      'pointer-events:auto;',
      'width:' + bw + 'px;',
      'background:rgba(14,5,46,0.97);',
      'border:1.5px solid ' + C.foodA + ';',
      'border-radius:14px;',
      'padding:22px 24px 20px;',
      'font-family:' + FONT + ';',
      'text-align:center;',
      'margin-top:-60px;',
    ].join('');

    var title = document.createElement('div');
    title.textContent = 'New High Score!';
    title.style.cssText = 'color:' + C.accent + ';font-size:15px;font-weight:700;margin-bottom:4px;';

    var sub = document.createElement('div');
    sub.textContent = 'Enter your name (3–5 characters)';
    sub.style.cssText = 'color:rgba(237,237,237,0.5);font-size:11px;margin-bottom:14px;';

    var input = document.createElement('input');
    input.type        = 'text';
    input.maxLength   = 5;
    input.placeholder = 'e.g. YAS';
    input.autocomplete = 'off';
    input.style.cssText = [
      'width:100%;box-sizing:border-box;',
      'background:rgba(255,255,255,0.07);',
      'border:1.5px solid rgba(87,227,216,0.4);',
      'border-radius:8px;',
      'color:#ededed;',
      'font-family:' + FONT + ';',
      'font-size:20px;font-weight:700;',
      'text-align:center;letter-spacing:0.18em;text-transform:uppercase;',
      'padding:10px;outline:none;',
      'margin-bottom:12px;',
    ].join('');

    input.oninput = function () {
      input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    };

    var btn = document.createElement('button');
    btn.textContent = 'Save';
    btn.style.cssText = [
      'width:100%;padding:10px;',
      'background:' + C.accent + ';',
      'color:#0e052e;',
      'font-family:' + FONT + ';font-size:14px;font-weight:700;',
      'border:none;border-radius:8px;cursor:pointer;',
      'transition:opacity 0.15s;',
    ].join('');

    function attempt() {
      var val = input.value.trim().toUpperCase();
      if (val.length < 3) {
        input.style.borderColor = C.foodA;
        input.focus();
        return;
      }
      input.style.borderColor = 'rgba(87,227,216,0.4)';
      document.body.removeChild(wrap);
      onSave(val);
    }

    btn.onclick = attempt;
    input.onkeydown = function (e) { if (e.key === 'Enter') attempt(); };

    box.appendChild(title);
    box.appendChild(sub);
    box.appendChild(input);
    box.appendChild(btn);
    wrap.appendChild(box);
    document.body.appendChild(wrap);

    setTimeout(function () { input.focus(); }, 80);

    return wrap;
  }

  /* ── End game ─────────────────────── */

  function attachExitListener() {
    if (isMobile) {
      canvas.addEventListener('touchend', function once() {
        canvas.removeEventListener('touchend', once);
        doExit();
      });
    } else {
      window.addEventListener('keydown', function once() {
        window.removeEventListener('keydown', once);
        doExit();
      });
    }
  }

  function endGame() {
    gameState = 'over';
    cancelAnimationFrame(loopId);
    window.removeEventListener('keydown', keyHandler);
    removeSwipeHandler();

    drawFetchingScreen();

    fetchLeaderboard(function (lb) {
      if (gameState !== 'over') return;

      var qualifies = qualifiesForBoard(lb, score);
      var finalScore = score;

      drawGameOverScreen(lb, qualifies, finalScore);

      if (qualifies) {
        showNameEntry(function (name) {
          var newLb = insertScore(lb, name, finalScore);
          saveLeaderboard(newLb, function () {
            if (gameState !== 'over') return;
            drawGameOverScreen(newLb, true, finalScore);
            attachExitListener();
          });
        });
      } else {
        attachExitListener();
      }
    });
  }

  /* ── Exit ─────────────────────────── */

  function doExit() {
    gameState = 'exiting';
    cancelAnimationFrame(loopId);
    window.removeEventListener('keydown', keyHandler);
    removeSwipeHandler();

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

  /* ── Input handlers ───────────────── */

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

  function buildSwipeHandler() {
    var t0 = null;
    function onStart(e) {
      e.preventDefault();
      t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    function onEnd(e) {
      if (!t0) return;
      e.preventDefault();
      var dx   = e.changedTouches[0].clientX - t0.x;
      var dy   = e.changedTouches[0].clientY - t0.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      t0 = null;

      if (dist < 20) {
        var tc = e.changedTouches[0];
        var b  = exitBtnCenter();
        var dd = Math.sqrt((tc.clientX - b.x) * (tc.clientX - b.x) + (tc.clientY - b.y) * (tc.clientY - b.y));
        if (dd <= b.r + 10) { doExit(); }
        return;
      }

      if (gameState !== 'running') return;
      var d;
      if (Math.abs(dx) > Math.abs(dy)) { d = dx > 0 ? {x:1,y:0} : {x:-1,y:0}; }
      else                              { d = dy > 0 ? {x:0,y:1} : {x:0,y:-1}; }
      if (d.x === -dir.x && d.y === -dir.y) return;
      nextDir = d;
    }
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchend',   onEnd,   { passive: false });
    swipeHandler = { start: onStart, end: onEnd };
  }

  function removeSwipeHandler() {
    if (!swipeHandler || !canvas) return;
    canvas.removeEventListener('touchstart', swipeHandler.start);
    canvas.removeEventListener('touchend',   swipeHandler.end);
    swipeHandler = null;
  }

  /* ── Public ───────────────────────── */

  function init(onExit) {
    onExitCb = onExit || null;
    isMobile = !window.matchMedia('(pointer: fine)').matches;

    var logoRects = getLogoRects();

    buildOverlay();
    buildCanvas();
    computeGrid();
    initGame();

    if (isMobile) { buildSwipeHandler(); }
    else          { buildKeyHandler();   }

    hideLogo();

    drawBg();
    if (logoRects) {
      logoRects.forEach(function (sq) { drawSquare(sq.cx, sq.cy, sq.size, sq.color); });
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
