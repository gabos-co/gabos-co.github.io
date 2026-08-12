// Az Alpok Water jel térben, kódból újraépítve.
//
// Nem a kép kivágása és nem letöltött modell: a formát ugyanúgy rajzoljuk meg
// görbékből, ahogy a jel készült — hegy, benne a víz cseppje negatív térben —,
// majd kihúzzuk mélységbe. Emiatt bármekkorára skálázható és marad éles.
//
// Three.js r180, MIT, helyben (vendor/three.module.min.js). Semmit nem tölt le futás közben.

import * as THREE from './vendor/three.module.min.js';

const host = document.querySelector('#mark3d');
if (host) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- a jel kontúrja ---------------------------------------------------
  // A hegy: bal oldalt meredek él, jobbra ívelt lejtő, alul vízszintes talp.
  const mountain = new THREE.Shape();
  mountain.moveTo(-1.00, -0.86);
  mountain.lineTo(-0.06, 0.92);          // fel a csúcsra
  mountain.bezierCurveTo(0.16, 1.02, 0.34, 0.96, 0.44, 0.74);
  mountain.lineTo(1.06, -0.86);          // le a jobb lábhoz
  mountain.lineTo(-1.00, -0.86);         // talp
  mountain.closePath();

  // A csepp: kör alsó test, felül kihúzott hegy. Negatív térben ül a hegyben.
  const drop = new THREE.Path();
  const dx = -0.30, dy = -0.34, r = 0.30;
  drop.moveTo(dx, dy + 0.62);                                  // a csepp hegye
  drop.bezierCurveTo(dx + 0.20, dy + 0.26, dx + r, dy + 0.18, dx + r, dy);
  drop.bezierCurveTo(dx + r, dy - r * 0.94, dx - r, dy - r * 0.94, dx - r, dy);
  drop.bezierCurveTo(dx - r, dy + 0.18, dx - 0.20, dy + 0.26, dx, dy + 0.62);
  mountain.holes.push(drop);

  const geo = new THREE.ExtrudeGeometry(mountain, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 4,
    curveSegments: 48,
  });
  geo.center();

  const scene = new THREE.Scene();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1c22,
    roughness: 0.34,
    metalness: 0.12,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Fény: egy fő oldalról, egy halvány ellenfény, hogy a bevel éle látszódjon.
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9c8c2, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2.6, 3.2, 3.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd8ff, 1.1);
  rim.position.set(-3, -1.2, -2);
  scene.add(rim);

  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  cam.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.appendChild(renderer.domElement);

  function resize() {
    const r2 = host.getBoundingClientRect();
    const w = Math.max(160, r2.width), h = Math.max(160, r2.height);
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Az egér csak megbillenti, nem rántja. Érintésen nincs hover, ott a lassú
  // saját forgás viszi. Billentyűvel is fordítható, hogy ne csak egérrel menjen.
  let tx = 0, ty = 0, cx = 0, cy = 0, spin = 0;
  window.addEventListener('pointermove', (e) => {
    const r2 = host.getBoundingClientRect();
    tx = ((e.clientY - (r2.top + r2.height / 2)) / window.innerHeight) * 0.5;
    ty = ((e.clientX - (r2.left + r2.width / 2)) / window.innerWidth) * 0.7;
  }, { passive: true });

  host.tabIndex = 0;
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label',
    'Az Alpok Water jele térben: hegy, benne a víz cseppje negatív térben.');
  host.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { ty -= 0.25; e.preventDefault(); }
    if (e.key === 'ArrowRight') { ty += 0.25; e.preventDefault(); }
  });

  let running = false, raf = null;
  function frame() {
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    if (!reduce) spin += 0.0022;
    mesh.rotation.x = cx;
    mesh.rotation.y = cy + spin;
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  }
  function play() { if (running) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  if (reduce) { mesh.rotation.set(0.1, -0.5, 0); renderer.render(scene, cam); }
  else {
    play();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e) => (e[0].isIntersecting ? play() : stop()), { threshold: 0.05 })
        .observe(host);
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
  }
}
