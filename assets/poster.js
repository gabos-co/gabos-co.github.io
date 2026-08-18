/* gabos.co — plakat-mezo
 *
 * Ket "vilag" fekszik egymason, es mindketto a masik szinevel kapja a foltokat:
 *
 *   1. kek vilag  : a felso es also pirula meg a kozepso sav. Erre zold foltok.
 *   2. zold vilag : a nagy G betuforma. Erre kek foltok.
 *
 * A foltok mindket vilagban ugyanazok, csak a szinuk fordul. Ezert eleg egy
 * mozgo folt-keszlet: ahol zold a hatter, ott kek folt latszik, ahol kek, ott
 * zold. A vagast a "source-atop" vegzi ket segedvaszonon, igy nem kell maszk
 * SVG, es a betuformat nem kell utvonalla alakitani.
 *
 * A statikus retegek (pirulak, betu) egyszer rajzolodnak ki es kepkent
 * ismetlodnek, kepkockankent csak a foltok kerulnek rajuk. Meretvaltasnal
 * es betutoltesnel epul ujra minden.
 */
(function () {
  var host = document.querySelector('.poster');
  if (!host) return;
  var cv = host.querySelector('.poster-cv');
  if (!cv || !cv.getContext) return;

  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = getComputedStyle(host);
  var BG    = (css.getPropertyValue('--poster-bg')    || '#000000').trim();
  var GREEN = (css.getPropertyValue('--poster-green') || '#00C46E').trim();
  var BLUE  = (css.getPropertyValue('--poster-blue')  || '#2D55C8').trim();
  var GLYPH = (host.getAttribute('data-glyph') || 'G');

  var W = 0, H = 0, dpr = 1, R = 60;
  var blueLayer, blueCtx, glyphLayer, glyphCtx, worldA, ctxA, worldB, ctxB;

  /* A foltok: alappozicio a doboz aranyaban, sajat lengessel es utemmel.
   * Rogzitett lista, nem veletlen -- igy minden ujraepitesnel ugyanaz a kep. */
  var BLOBS = [
    { x: 0.13, y: 0.07, ax: 0.05, ay: 0.04, sx: 0.31, sy: 0.23, ph: 0.0, r: 0.95 },
    { x: 0.46, y: 0.05, ax: 0.06, ay: 0.03, sx: 0.24, sy: 0.35, ph: 1.1, r: 0.80 },
    { x: 0.83, y: 0.09, ax: 0.04, ay: 0.05, sx: 0.28, sy: 0.19, ph: 2.3, r: 1.05 },
    { x: 0.24, y: 0.21, ax: 0.05, ay: 0.05, sx: 0.19, sy: 0.29, ph: 3.4, r: 1.10 },
    { x: 0.68, y: 0.18, ax: 0.06, ay: 0.04, sx: 0.33, sy: 0.21, ph: 0.7, r: 0.90 },
    { x: 0.09, y: 0.34, ax: 0.04, ay: 0.06, sx: 0.22, sy: 0.26, ph: 4.2, r: 1.00 },
    { x: 0.90, y: 0.33, ax: 0.05, ay: 0.05, sx: 0.26, sy: 0.31, ph: 1.9, r: 0.85 },
    { x: 0.37, y: 0.42, ax: 0.06, ay: 0.05, sx: 0.17, sy: 0.24, ph: 5.0, r: 1.15 },
    { x: 0.61, y: 0.47, ax: 0.05, ay: 0.06, sx: 0.29, sy: 0.18, ph: 2.6, r: 0.95 },
    { x: 0.16, y: 0.56, ax: 0.05, ay: 0.04, sx: 0.21, sy: 0.33, ph: 0.4, r: 1.05 },
    { x: 0.86, y: 0.58, ax: 0.04, ay: 0.05, sx: 0.35, sy: 0.22, ph: 3.9, r: 0.90 },
    { x: 0.44, y: 0.66, ax: 0.06, ay: 0.05, sx: 0.20, sy: 0.27, ph: 1.4, r: 1.00 },
    { x: 0.71, y: 0.74, ax: 0.05, ay: 0.06, sx: 0.30, sy: 0.20, ph: 4.7, r: 1.10 },
    { x: 0.11, y: 0.79, ax: 0.05, ay: 0.04, sx: 0.23, sy: 0.28, ph: 2.0, r: 0.85 },
    { x: 0.34, y: 0.90, ax: 0.06, ay: 0.04, sx: 0.27, sy: 0.32, ph: 5.5, r: 1.05 },
    { x: 0.79, y: 0.93, ax: 0.05, ay: 0.05, sx: 0.18, sy: 0.25, ph: 3.1, r: 0.95 }
  ];

  function surface(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function stadium(c, x, y, w, h) {
    var r = Math.min(h, w) / 2;
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else {
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.arcTo(x + w, y, x + w, y + r, r);
      c.lineTo(x + w, y + h - r);
      c.arcTo(x + w, y + h, x + w - r, y + h, r);
      c.lineTo(x + r, y + h);
      c.arcTo(x, y + h, x, y + h - r, r);
      c.lineTo(x, y + r);
      c.arcTo(x, y, x + r, y, r);
    }
    c.closePath();
    c.fill();
  }

  /* A kek vilag: ket pirula a lap ket vegen, es egy allo sav kozepen.
     A sav a betu lyukaiban latszik at, ezert fut vegig teljes magassagban. */
  function paintBlue(c) {
    c.clearRect(0, 0, W, H);
    c.fillStyle = BLUE;
    var inset = W * 0.018;
    var ph = H * 0.135;
    stadium(c, inset, H * 0.022, W - inset * 2, ph);
    stadium(c, inset, H - H * 0.022 - ph, W - inset * 2, ph);
    c.fillRect(W * 0.395, 0, W * 0.145, H);
  }

  /* A zold vilag: egyetlen betuforma, magassagra igazitva, vizszintesen a
     dobozhoz nyujtva. A nyujtast korlatozzuk, kulonben keskeny kepernyon
     osszelapulna; ilyenkor inkabb kifut a szelen, mint egy vagott plakat. */
  function paintGlyph(c) {
    c.clearRect(0, 0, W, H);
    c.fillStyle = GREEN;
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    var MIN_SX = 0.62, MAX_SX = 1.42;              // ennel jobban nem lapitjuk/nyujtjuk
    var size = H * 0.92 / 0.72;                    // 0.72: a Geist nagybetu-magassaga
    c.font = '800 ' + size + 'px "Geist", Helvetica, Arial, sans-serif';
    var natural = c.measureText(GLYPH).width || size * 0.78;
    var sx = (W * 0.98) / natural;

    // Keskeny, magas dobozban (telefon allo helyzetben) nem lapitjuk ossze a
    // betut, hanem kisebbre vesszuk: igy megmarad az aranya es a pirulak is
    // latszanak alatta-folotte.
    if (sx < MIN_SX) {
      size *= sx / MIN_SX;
      c.font = '800 ' + size + 'px "Geist", Helvetica, Arial, sans-serif';
      natural = c.measureText(GLYPH).width || size * 0.78;
      sx = MIN_SX;
    }
    sx = Math.min(MAX_SX, Math.max(MIN_SX, sx));

    c.save();
    c.translate(W / 2, H * 0.5);
    c.scale(sx, 1);
    c.fillText(GLYPH, 0, size * 0.035);            // optikai kozepre igazitas
    c.restore();
  }

  function paintBlobs(c, color, t) {
    for (var i = 0; i < BLOBS.length; i++) {
      var b = BLOBS[i];
      var x = (b.x + b.ax * Math.sin(t * b.sx + b.ph)) * W;
      var y = (b.y + b.ay * Math.cos(t * b.sy + b.ph * 0.7)) * H;
      var r = R * b.r * (1 + 0.18 * Math.sin(t * b.sy * 1.3 + b.ph));
      var g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(0.34, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
  }

  /* A "source-atop" csak ott hagyja meg a foltot, ahol mar van festek:
     igy a zold folt a pirulan belul marad, a kek pedig a betun belul. */
  function world(c, base, color, t) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.drawImage(base, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    paintBlobs(c, color, t);
    c.globalCompositeOperation = 'source-over';
  }

  function draw(t) {
    world(ctxA, blueLayer, GREEN, t);
    world(ctxB, glyphLayer, BLUE, t);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(worldA, 0, 0);
    ctx.drawImage(worldB, 0, 0);
  }

  function build() {
    var box = host.getBoundingClientRect();
    W = Math.max(280, Math.round(box.width));
    H = Math.max(320, Math.round(box.height));
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    R = Math.hypot(W, H) * 0.055;

    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';

    blueLayer = surface(W, H);  blueCtx = blueLayer.getContext('2d');
    glyphLayer = surface(W, H); glyphCtx = glyphLayer.getContext('2d');
    worldA = surface(W, H);     ctxA = worldA.getContext('2d');
    worldB = surface(W, H);     ctxB = worldB.getContext('2d');

    paintBlue(blueCtx);
    paintGlyph(glyphCtx);
  }

  var raf = null, start = 0, running = false, last = 0;

  function loop(now) {
    if (!start) start = now;
    if (now - last > 32) {                 // ~30 kep/mp: ennyi eleg a lassu lengeshez
      draw((now - start) / 1000);
      last = now;
    }
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (running || reduce) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  build();
  draw(0);

  if (reduce) {
    // mozgas nelkul is teljes ertekű a kep, csak all
  } else {
    play();
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : play();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        e[0].isIntersecting ? play() : stop();
      }, { threshold: 0.02 }).observe(host);
    }
  }

  var rt;
  function refresh() { build(); draw(reduce ? 0 : (performance.now() - start) / 1000); }
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(refresh, 150);
  }, { passive: true });

  // A betuforma csak akkor helyes, ha a Geist mar betoltott.
  if (document.fonts && document.fonts.load) {
    document.fonts.load('800 200px "Geist"').then(refresh).catch(function () {});
  }
})();
