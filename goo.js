// Az "under construction" felirat olvado hatasa, vaszonra rajzolva.
//
// Miert igy: sem a CSS-szuro, sem a vaszon sajat szuroje (ctx.filter) nem
// megbizhato Safarin. Az egyik lecsokkentett felbontason raszterizal (recés
// betuszel), a masik szo nelkul figyelmen kivul hagyja a kerest (semmi nem
// tortenik). Ezert itt csak olyan muveletek szerepelnek, amit minden bongeszo
// tud: kepet kicsinyiteni, nagyitani es egymasra szorozni.
//
// Az eljaras:
//   1. eles forras: feher alapra fekete szoveg, keperno-suruseg szerinti meretben
//   2. hizlalas: a betuket sokszor egymasra rajzoljuk, kor menten eltolva.
//      Ettol a formak vastagodnak es a szomszedos betuk osszeernek, de a szel
//      eles marad -- nincs elmosas, tehat nincs mit lecsokkentett felbontason
//      raszterizalni. A kor sugara adja az olvadas merteket.
// A vaszon szorzo keveressel ul a lapon, igy a feher eltunik es a szurke
// hatter latszik.

(function () {
  var cv = document.getElementById('goo-canvas');
  if (!cv || !cv.getContext) return;

  var ctx = cv.getContext('2d');
  var src = document.createElement('canvas');    // eles forras
  var mid = document.createElement('canvas');    // visszanagyitott, kuszob elott
  var sctx = src.getContext('2d');
  var mctx = mid.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LINES = ['under', 'construction'];
  var W = 0, H = 0, dpr = 1, fontPx = 0, lineH = 0;

  // A CSS clamp(2.7rem, 12.5vw, 12rem) megfeleloje, hogy a vaszon es a
  // lathatatlan DOM-felirat pontosan egyforma legyen.
  function fontSize(w) { return Math.max(43.2, Math.min(w * 0.125, 192)); }

  function drawSource() {
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, W, H);
    sctx.fillStyle = '#141412';
    sctx.textBaseline = 'middle';
    sctx.font = '800 ' + fontPx + 'px "Geist", "Helvetica Neue", Helvetica, Arial, sans-serif';

    var total = lineH * LINES.length;
    var top = H / 2 - total / 2 + lineH / 2;
    for (var i = 0; i < LINES.length; i++) {
      drawTracked(sctx, LINES[i], W / 2, top + i * lineH, -0.055 * fontPx);
    }
  }

  // A vaszon nem ismeri mindenhol a letterSpacing-et, ezert betunkent rajzolunk.
  function drawTracked(c, text, cx, y, track) {
    var widths = [], total = 0, i;
    c.textAlign = 'left';
    for (i = 0; i < text.length; i++) {
      var w = c.measureText(text[i]).width;
      widths.push(w);
      total += w + (i < text.length - 1 ? track : 0);
    }
    var x = cx - total / 2;
    for (i = 0; i < text.length; i++) { c.fillText(text[i], x, y); x += widths[i] + track; }
  }

  function layout() {
    var r = cv.getBoundingClientRect();
    W = Math.max(320, Math.round(r.width));
    H = Math.max(320, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 3);

    cv.width = src.width = mid.width = Math.round(W * dpr);
    cv.height = src.height = mid.height = Math.round(H * dpr);

    fontPx = fontSize(W);
    lineH = fontPx * 0.84;
    drawSource();
  }

  // Az olvadas merteke szabalytalan ritmusban no es apad. Az ertek a
  // hizlalas sugara a betumeret aranyaban: 0 = eredeti, 0.09 = erosen osszefolyt.
  var STOPS = [
    [0, 0.004], [0.09, 0.040], [0.15, 0.004], [0.27, 0.082], [0.33, 0.040],
    [0.38, 0.004], [0.52, 0.082], [0.57, 0.004], [0.66, 0.040], [0.71, 0.004],
    [0.84, 0.082], [0.92, 0.040], [1, 0.004]
  ];
  var CYCLE = 17000;
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function radiusAt(ms) {
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

  // A hizlalas eltolasai: ket gyuru + kozep. Minel nagyobb a sugar, annal
  // jobban osszeernek a betuk.
  var RING = [];
  (function () {
    var i;
    for (i = 0; i < 14; i++) RING.push([Math.cos(i / 14 * Math.PI * 2), Math.sin(i / 14 * Math.PI * 2), 1]);
    for (i = 0; i < 8; i++) RING.push([Math.cos(i / 8 * Math.PI * 2), Math.sin(i / 8 * Math.PI * 2), 0.55]);
  })();

  function render(ms) {
    var r = radiusAt(ms) * dpr;

    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.globalCompositeOperation = 'source-over';
    mctx.clearRect(0, 0, mid.width, mid.height);
    mctx.drawImage(src, 0, 0);
    for (var i = 0; i < RING.length; i++) {
      mctx.drawImage(src, RING[i][0] * r * RING[i][2], RING[i][1] * r * RING[i][2]);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(mid, 0, 0);
  }

  var raf = null, start = 0, last = 0, running = false;
  function loop(now) {
    if (!start) start = now;
    if (now - last > 40) { render(now - start); last = now; }
    raf = requestAnimationFrame(loop);
  }
  function play() { if (running || reduce) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  function boot() {
    layout();
    if (reduce) { render(0); return; }
    stop(); start = 0; last = 0; play();
  }

  boot();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(boot, 180);
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : play();
  });
})();
