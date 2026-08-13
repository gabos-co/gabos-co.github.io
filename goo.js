// Az "under construction" felirat olvado hatasa vaszonra rajzolva.
//
// Miert nem CSS-szurovel: a bongesző a szurt reteget kepp alakitja, es iOS-en
// ezt lecsokkentett felbontason teszi, amitol lepcsos lesz a betu szele.
// Vasznon mi szabjuk meg a felbontast (keperno-suruseg szerint), ezert eles
// marad minden keszuleken.
//
// Az eljaras ugyanaz, mint a CSS-valtozatban volt: feher alapra fekete szoveg,
// arra elmosas es eros kontraszt. Ettol a betuk szele kikerekedik, es ahol
// ket forma elerheto kozelbe kerul, osszeolvadnak. A vaszon szorzo keveressel
// ul a lapon, igy a feher eltunik es a szurke hatter latszik.

(function () {
  var cv = document.getElementById('goo-canvas');
  if (!cv || !cv.getContext) return;

  var ctx = cv.getContext('2d');
  var off = document.createElement('canvas');
  var octx = off.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LINES = ['under', 'construction'];
  var W = 0, H = 0, dpr = 1, fontPx = 0, lineH = 0;

  // A CSS clamp(2.7rem, 12.5vw, 12rem) megfeleloje, hogy a vaszon es a
  // lathatatlan DOM-felirat pontosan egyforma legyen.
  function fontSize(w) {
    return Math.max(43.2, Math.min(w * 0.125, 192));
  }

  function layout() {
    var r = cv.getBoundingClientRect();
    W = Math.max(320, Math.round(r.width));
    H = Math.max(320, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 3);

    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    off.width = cv.width;
    off.height = cv.height;

    fontPx = fontSize(W);
    lineH = fontPx * 0.84;

    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawSource() {
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.fillStyle = '#FFFFFF';
    octx.fillRect(0, 0, W, H);
    octx.fillStyle = '#141412';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.font = '800 ' + fontPx + 'px "Geist", "Helvetica Neue", Helvetica, Arial, sans-serif';

    // A ket sor a vaszon fuggoleges kozepere kerul, ugyanugy mint a DOM-ban.
    var total = lineH * LINES.length;
    var top = H / 2 - total / 2 + lineH / 2;
    for (var i = 0; i < LINES.length; i++) {
      var y = top + i * lineH;
      // szoros betukoz: -0.055em, kezzel szedve
      drawTracked(octx, LINES[i], W / 2, y, -0.055 * fontPx);
    }
  }

  // A canvas nem ismeri a letterSpacing-et minden bongeszoben, ezert
  // betunkent rajzolunk, es magunk allitjuk a kozt.
  function drawTracked(c, text, cx, y, track) {
    var widths = [], total = 0;
    for (var i = 0; i < text.length; i++) {
      var w = c.measureText(text[i]).width;
      widths.push(w);
      total += w + (i < text.length - 1 ? track : 0);
    }
    var x = cx - total / 2;
    c.textAlign = 'left';
    for (var j = 0; j < text.length; j++) {
      c.fillText(text[j], x, y);
      x += widths[j] + track;
    }
    c.textAlign = 'center';
  }

  // Az olvadas merteke szabalytalan ritmusban no es apad (a CSS-valtozat
  // 17 masodperces kulcskockai ugyanezekkel az ertekekkel).
  var STOPS = [
    [0, 0.030], [0.09, 0.064], [0.15, 0.030], [0.27, 0.104], [0.33, 0.064],
    [0.38, 0.030], [0.52, 0.104], [0.57, 0.030], [0.66, 0.064], [0.71, 0.030],
    [0.84, 0.104], [0.92, 0.064], [1, 0.030]
  ];
  var CYCLE = 17000;

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function blurAt(ms) {
    var p = (ms % CYCLE) / CYCLE;
    for (var i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i];
        var t = (p - a[0]) / (b[0] - a[0] || 1);
        return (a[1] + (b[1] - a[1]) * easeInOut(t)) * fontPx;
      }
    }
    return STOPS[0][1] * fontPx;
  }

  // Ket ut: ha a vaszon ismeri a szurot, ott rajzoljuk (legjobb minoseg).
  // Ha nem (a Safari egy resze nem), akkor a vaszon csak az eles forrast
  // adja, es az elmosast a CSS teszi ra az elemre. Igy a forras mindenkeppen
  // teljes felbontasu marad, es a hatas sem marad el.
  var canFilter = (function () {
    var t = document.createElement('canvas').getContext('2d');
    t.filter = 'blur(2px)';
    return t.filter === 'blur(2px)';
  })();

  function render(ms) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (canFilter) {
      ctx.filter = 'blur(' + blurAt(ms).toFixed(2) + 'px) contrast(13)';
      ctx.drawImage(off, 0, 0, W, H);
      ctx.filter = 'none';
    } else {
      if (!cssDrawn) { ctx.drawImage(off, 0, 0, W, H); cssDrawn = true; }
      cv.style.setProperty('--gb', blurAt(ms).toFixed(2) + 'px');
    }
  }

  var cssDrawn = false;
  var raf = null, start = 0, last = 0, running = false;
  function loop(now) {
    if (!start) start = now;
    if (now - last > 33) { render(now - start); last = now; }
    raf = requestAnimationFrame(loop);
  }
  function play() { if (running || reduce) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  function boot() {
    layout();
    drawSource();
    cssDrawn = false;
    document.documentElement.classList.toggle('css-goo', !canFilter);
    if (reduce) render(0); else { stop(); start = 0; play(); }
  }

  // A vaszon csak akkor jo, ha a betu mar betoltodott.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else window.addEventListener('load', boot);
  boot();

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(boot, 180);
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : play();
  });
})();
