(function () {
  var bgCanvas = document.getElementById('bg3d');
  if (!bgCanvas || !window.THREE) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var fgCanvas = document.getElementById('fg3d');
  var W = function () { return window.innerWidth; };
  var H = function () { return window.innerHeight; };

  function makeRenderer(canvas) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(W(), H());
    return r;
  }

  var renderer = makeRenderer(bgCanvas);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100);
  camera.position.set(0, 0, 10);

  var fgRenderer = null, fgScene = null, fgCamera = null;
  if (fgCanvas) {
    try {
      fgRenderer = makeRenderer(fgCanvas);
      fgScene = new THREE.Scene();
      fgCamera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100);
      fgCamera.position.set(0, 0, 10);
    } catch (e) {
      fgRenderer = null;
      fgCanvas.style.display = 'none';
    }
  }

  /* ---------- canvas textures ---------- */
  function canvasTex(draw, size) {
    var c = document.createElement('canvas');
    c.width = c.height = size || 256;
    var g = c.getContext('2d');
    draw(g, c.width, c.height);
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }

  function iconTexture(draw) {
    return canvasTex(function (g, s) {
      g.translate(s / 2, s / 2);
      var u = s / 128;
      g.scale(u, u);
      g.strokeStyle = '#ffffff';
      g.fillStyle = '#ffffff';
      g.lineWidth = 8;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.shadowColor = 'rgba(255,255,255,.85)';
      g.shadowBlur = 16;
      draw(g);
    }, 160);
  }

  var IG_ICONS = [
    iconTexture(function (g) {
      g.beginPath();
      g.moveTo(0, 30);
      g.bezierCurveTo(-44, -4, -30, -38, 0, -22);
      g.bezierCurveTo(30, -38, 44, -4, 0, 30);
      g.stroke();
    }),
    iconTexture(function (g) {
      g.beginPath();
      if (g.roundRect) g.roundRect(-38, -28, 76, 52, 18);
      else g.rect(-38, -28, 76, 52);
      g.stroke();
      g.beginPath();
      g.moveTo(-14, 24); g.lineTo(-20, 40); g.lineTo(2, 26);
      g.stroke();
      [-16, 0, 16].forEach(function (x) {
        g.beginPath(); g.arc(x, -2, 4, 0, Math.PI * 2); g.fill();
      });
    }),
    iconTexture(function (g) {
      g.beginPath();
      g.moveTo(-42, 6); g.lineTo(42, -24); g.lineTo(14, 36); g.lineTo(-2, 16); g.closePath();
      g.stroke();
      g.beginPath(); g.moveTo(-2, 16); g.lineTo(42, -24); g.stroke();
    }),
    iconTexture(function (g) {
      g.beginPath();
      g.moveTo(-20, -34); g.lineTo(20, -34); g.lineTo(20, 38); g.lineTo(0, 20); g.lineTo(-20, 38);
      g.closePath();
      g.stroke();
    })
  ];

  var WP_ICONS = [
    iconTexture(function (g) {
      g.font = '900 84px Georgia, "Times New Roman", serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('W', 0, 4);
    }),
    iconTexture(function (g) {
      g.beginPath(); g.arc(0, 0, 36, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.ellipse(0, 0, 16, 36, 0, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(-36, 0); g.lineTo(36, 0); g.stroke();
      g.beginPath(); g.moveTo(-31, -18); g.lineTo(31, -18); g.stroke();
      g.beginPath(); g.moveTo(-31, 18); g.lineTo(31, 18); g.stroke();
    }),
    iconTexture(function (g) {
      g.beginPath();
      g.moveTo(0, -40); g.lineTo(26, -12); g.lineTo(0, 40); g.lineTo(-26, -12); g.closePath();
      g.stroke();
      g.beginPath(); g.arc(0, -6, 7, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(0, 1); g.lineTo(0, 40); g.stroke();
    }),
    iconTexture(function (g) {
      g.beginPath();
      if (g.roundRect) g.roundRect(-38, -28, 76, 52, 18);
      else g.rect(-38, -28, 76, 52);
      g.stroke();
      g.beginPath();
      g.moveTo(14, 24); g.lineTo(20, 40); g.lineTo(-2, 26);
      g.stroke();
    })
  ];

  var igFaceTex = canvasTex(function (g, w, h) {
    var grad = g.createLinearGradient(0, h, w, 0);
    grad.addColorStop(0, '#ffd600');
    grad.addColorStop(0.35, '#ff7a00');
    grad.addColorStop(0.62, '#ff0169');
    grad.addColorStop(1, '#7638fa');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });

  var wpFaceTex = canvasTex(function (g, w, h) {
    var grad = g.createRadialGradient(w * 0.35, h * 0.3, 10, w / 2, h / 2, w * 0.62);
    grad.addColorStop(0, '#3f97c2');
    grad.addColorStop(1, '#123f5e');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.95)';
    g.lineWidth = w * 0.04;
    g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff';
    g.font = '900 ' + (w * 0.5) + 'px Georgia, "Times New Roman", serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('W', w / 2, h * 0.55);
  });
  wpFaceTex.center.set(0.5, 0.5);
  wpFaceTex.rotation = -Math.PI / 2;

  var glowTex = canvasTex(function (g, w, h) {
    var grad = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(255,120,170,.55)');
    grad.addColorStop(0.5, 'rgba(160,80,220,.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }, 256);

  /* ---------- center logos ---------- */
  function roundedRectShape(w, h, r) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  var whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  var igLogo = new THREE.Group();
  var igShape = roundedRectShape(2, 2, 0.55);
  igFaceTex.wrapS = igFaceTex.wrapT = THREE.ClampToEdgeWrapping;
  igFaceTex.repeat.set(0.5, 0.5);
  igFaceTex.offset.set(0.5, 0.5);
  var igBodyGeo = new THREE.ExtrudeGeometry(igShape, {
    depth: 0.3, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07,
    bevelSegments: 4, curveSegments: 22
  });
  igBodyGeo.center();
  var igBody = new THREE.Mesh(igBodyGeo, [
    new THREE.MeshBasicMaterial({ map: igFaceTex }),
    new THREE.MeshBasicMaterial({ color: 0x7a1560 })
  ]);
  igLogo.add(igBody);
  var igRing = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.09, 16, 48), whiteMat);
  igRing.position.z = 0.31;
  var igLens = new THREE.Mesh(new THREE.CircleGeometry(0.32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 }));
  igLens.position.z = 0.29;
  var igDot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), whiteMat);
  igDot.position.set(0.58, 0.58, 0.31);
  igLogo.add(igRing, igLens, igDot);
  igLogo.scale.setScalar(1.9);

  var wpLogo = new THREE.Group();
  var sideMat = new THREE.MeshBasicMaterial({ color: 0x0d2940 });
  var coin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.34, 56),
    [sideMat, new THREE.MeshBasicMaterial({ map: wpFaceTex }), new THREE.MeshBasicMaterial({ map: wpFaceTex })]
  );
  coin.rotation.x = Math.PI / 2;
  wpLogo.add(coin);
  var wpRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.045, 12, 60), whiteMat);
  wpRing.position.z = 0.02;
  wpLogo.add(wpRing);
  wpLogo.scale.setScalar(1.9);

  var logoRoot = new THREE.Group();
  scene.add(logoRoot);
  var tiltG = new THREE.Group();
  logoRoot.add(tiltG);
  var spinG = new THREE.Group();
  tiltG.add(spinG);
  spinG.add(igLogo);
  spinG.add(wpLogo);
  wpLogo.visible = false;

  var logoGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, opacity: 0.5, depthWrite: false
  }));
  logoGlow.scale.set(7.5, 7.5, 1);
  logoGlow.position.set(0, -0.4, -1.5);
  logoRoot.add(logoGlow);

  /* ---------- dust particles ---------- */
  function makeParticles(count, spread, size, color, opacity) {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: size, color: color, transparent: true, opacity: opacity,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    scene.add(pts);
    return pts;
  }
  var dust1 = makeParticles(260, 26, 0.05, 0xff8ab0, 0.6);
  var dust2 = makeParticles(140, 22, 0.03, 0xffffff, 0.4);

  /* ---------- floating icons ---------- */
  var icons = [];
  var currentSet = IG_ICONS;

  function boundsAt(z, cam) {
    var dist = cam.position.z - z;
    var hh = Math.tan((cam.fov / 2) * Math.PI / 180) * dist;
    return { hh: hh, hw: hh * cam.aspect };
  }

  function randomHome(b, minR) {
    var x, y, tries = 0;
    do {
      x = (Math.random() - 0.5) * 2 * b.hw * 0.86;
      y = (Math.random() - 0.5) * 2 * b.hh * 0.8;
      tries++;
    } while (Math.sqrt(x * x + y * y) < minR && tries < 20);
    return { x: x, y: y };
  }

  function makeIcon(layer, i) {
    var cam = layer === 'fg' ? fgCamera : camera;
    var scn = layer === 'fg' ? fgScene : scene;
    var z = layer === 'fg' ? 3 + Math.random() * 1.5 : -1 - Math.random() * 2.5;
    var mat = new THREE.SpriteMaterial({
      map: currentSet[i % currentSet.length], transparent: true,
      opacity: layer === 'fg' ? 0.95 : 0.5, depthWrite: false
    });
    var sp = new THREE.Sprite(mat);
    var b = boundsAt(z, cam);
    var home = randomHome(b, layer === 'fg' ? 1.9 : 1.3);
    sp.userData = {
      layer: layer,
      tx: home.x, ty: home.y,
      hx: home.x, hy: home.y,
      z: z,
      base: layer === 'fg' ? 0.85 + Math.random() * 0.5 : 0.4 + Math.random() * 0.35,
      shrink: 1,
      ax: 0.25 + Math.random() * 0.4, ay: 0.2 + Math.random() * 0.35,
      sx: 0.3 + Math.random() * 0.5, sy: 0.25 + Math.random() * 0.5,
      px: Math.random() * Math.PI * 2, py: Math.random() * Math.PI * 2,
      ox: 0, oy: 0,
      radius: layer === 'fg' ? 300 : 220,
      force: layer === 'fg' ? 0.055 : 0.02,
      rot: (Math.random() - 0.5) * 0.6
    };
    sp.position.set(home.x, home.y, z);
    sp.scale.setScalar(sp.userData.base);
    scn.add(sp);
    icons.push(sp);
    return sp;
  }

  if (fgRenderer) for (var fi = 0; fi < 6; fi++) makeIcon('fg', fi);
  for (var bi = 0; bi < 5; bi++) makeIcon('bg', bi);

  /* ---------- pointer ---------- */
  var pX = -9999, pY = -9999;
  var nx = 0, ny = 0, tnx = 0, tny = 0;
  window.addEventListener('mousemove', function (e) {
    pX = e.clientX; pY = e.clientY;
    tnx = (e.clientX / W()) * 2 - 1;
    tny = (e.clientY / H()) * 2 - 1;
  }, { passive: true });
  window.addEventListener('mouseout', function () { pX = -9999; pY = -9999; });

  /* ---------- flavor state ---------- */
  var spinProxy = { y: 0 };
  var blurProxy = { v: 0 };
  var iconScale = { v: 1 };
  var exitP = { y: 0, f: 0 };
  var THEMES = {
    instagram: {
      inner: '#3a1152', mid: '#190a31', outer: '#070410',
      g1: 'rgba(188,42,141,.17)', g2: 'rgba(255,110,80,.13)'
    },
    wordpress: {
      inner: '#0d3a5c', mid: '#07203a', outer: '#03070d',
      g1: 'rgba(46,140,200,.16)', g2: 'rgba(90,190,225,.11)'
    }
  };

  function applySpin() { spinG.rotation.y = spinProxy.y * Math.PI / 180; }
  function applyBlur() {
    var f = 'blur(' + blurProxy.v.toFixed(2) + 'px) saturate(' + (1 + blurProxy.v / 18).toFixed(2) + ')';
    bgCanvas.style.filter = f;
    if (fgCanvas) fgCanvas.style.filter = f;
  }
  function shuffleIcons(set) {
    currentSet = set;
    icons.forEach(function (ic, i) {
      ic.material.map = set[(i + 1) % set.length];
      ic.material.needsUpdate = true;
      var cam = ic.userData.layer === 'fg' ? fgCamera : camera;
      var b = boundsAt(ic.userData.z, cam);
      var home = randomHome(b, ic.userData.layer === 'fg' ? 2.1 : 1.4);
      ic.userData.tx = home.x;
      ic.userData.ty = home.y;
    });
  }

  function applyFlavorState(wp) {
    igLogo.visible = !wp;
    wpLogo.visible = wp;
    shuffleIcons(wp ? WP_ICONS : IG_ICONS);
    var T = THEMES[wp ? 'wordpress' : 'instagram'];
    gsap.to(document.body, {
      '--bg-inner': T.inner, '--bg-mid': T.mid, '--bg-outer': T.outer,
      duration: 1.2, ease: 'power2.inOut', overwrite: 'auto'
    });
    var g1 = document.querySelector('.glow-1');
    var g2 = document.querySelector('.glow-2');
    if (g1) gsap.to(g1, { backgroundColor: T.g1, duration: 1, ease: 'power2.inOut', overwrite: 'auto' });
    if (g2) gsap.to(g2, { backgroundColor: T.g2, duration: 1, ease: 'power2.inOut', overwrite: 'auto' });
  }

  /* ---------- pinned hero: swap plays while page holds, then releases ---------- */
  var hasHero = !!document.querySelector('.hero');
  if (hasHero && window.gsap && window.ScrollTrigger && window.matchMedia('(min-width: 881px)').matches) {
    gsap.registerPlugin(ScrollTrigger);
    var flipped = false;
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=2600',
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        onUpdate: function (self) {
          var wp = self.progress > 0.42;
          if (wp !== flipped) {
            flipped = wp;
            applyFlavorState(wp);
            try { window.dispatchEvent(new CustomEvent('flavorchange', { detail: wp ? 'wordpress' : 'instagram' })); } catch (e) {}
          }
        }
      }
    })
      .to(logoRoot.scale, { x: 1.14, y: 1.14, z: 1.14, duration: 0.24, ease: 'power1.inOut' }, 0)
      .to('.hero-content', { y: -50, duration: 0.24, ease: 'none' }, 0)
      .to(spinProxy, { y: '+=360', duration: 0.17, ease: 'power2.in', onUpdate: applySpin }, 0.25)
      .to(blurProxy, { v: 14, duration: 0.15, ease: 'power2.in', onUpdate: applyBlur }, 0.27)
      .to(iconScale, { v: 0.02, duration: 0.15, ease: 'power2.in' }, 0.27)
      .to(spinProxy, { y: '+=360', duration: 0.3, ease: 'power2.out', onUpdate: applySpin }, 0.42)
      .to(iconScale, { v: 1, duration: 0.22, ease: 'back.out(1.7)' }, 0.44)
      .to(blurProxy, { v: 0, duration: 0.2, ease: 'power2.out', onUpdate: applyBlur }, 0.44)
      .to({}, { duration: 0.14 }, 0.66)
      .to('.hero-content', { y: 90, autoAlpha: 0.15, duration: 0.18, ease: 'power1.in' }, 0.8)
      .to(exitP, { y: -6.5, f: 1, duration: 0.2, ease: 'power1.in' }, 0.8);
  }

  /* ---------- resize & scroll ---------- */
  function relayout() {
    icons.forEach(function (ic) {
      var cam = ic.userData.layer === 'fg' ? fgCamera : camera;
      var b = boundsAt(ic.userData.z, cam);
      ic.userData.tx = Math.max(-b.hw * 0.86, Math.min(b.hw * 0.86, ic.userData.tx));
      ic.userData.ty = Math.max(-b.hh * 0.8, Math.min(b.hh * 0.8, ic.userData.ty));
    });
  }

  window.addEventListener('resize', function () {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
    if (fgRenderer) {
      fgCamera.aspect = W() / H();
      fgCamera.updateProjectionMatrix();
      fgRenderer.setSize(W(), H());
    }
    relayout();
  });

  var clock = new THREE.Clock();
  var v = new THREE.Vector3();

  function updateIcons(dt, t) {
    for (var i = 0; i < icons.length; i++) {
      var ic = icons[i];
      var u = ic.userData;
      var cam = u.layer === 'fg' ? fgCamera : camera;
      var w = W(), h = H();
      u.hx += (u.tx - u.hx) * 0.045;
      u.hy += (u.ty - u.hy) * 0.045;
      var bx = u.hx + Math.sin(t * u.sx + u.px) * u.ax;
      var by = u.hy + Math.cos(t * u.sy + u.py) * u.ay;

      if (pX > -100) {
        v.set(bx, by, u.z).project(cam);
        var sx = (v.x * 0.5 + 0.5) * w;
        var sy = (-v.y * 0.5 + 0.5) * h;
        var dx = sx - pX, dy = sy - pY;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < u.radius && d > 0.001) {
          var f = (1 - d / u.radius) * u.force * (dt * 60);
          u.ox += (dx / d) * f;
          u.oy += (dy / d) * f;
        }
      }
      var damp = Math.pow(0.925, dt * 60);
      u.ox *= damp; u.oy *= damp;

      ic.position.set(bx + u.ox, by + u.oy, u.z);
      ic.scale.setScalar(u.base * u.shrink * iconScale.v);
      ic.material.rotation = Math.sin(t * 0.5 + u.px) * u.rot;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (document.hidden) return;
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    nx += (tnx - nx) * 0.05;
    ny += (tny - ny) * 0.05;

    var scroll = window.__lenis ? window.__lenis.scroll : (window.scrollY || 0);
    if (!hasHero) {
      var p = Math.min(1, scroll / (H() * 0.85));
      exitP.y = -p * 8;
      exitP.f = p;
    }

    logoRoot.position.y = exitP.y;
    spinG.position.y = Math.sin(t * 1.1) * 0.16;
    spinG.rotation.z = Math.sin(t * 0.5) * 0.03;
    tiltG.rotation.y = nx * 0.38;
    tiltG.rotation.x = ny * 0.26;

    dust1.rotation.y = t * 0.02;
    dust2.rotation.y = -t * 0.03;

    updateIcons(dt, t);

    bgCanvas.style.opacity = Math.max(0, 1 - exitP.f * 0.88).toFixed(3);
    if (fgCanvas) fgCanvas.style.opacity = Math.max(0, 1 - exitP.f).toFixed(3);

    renderer.render(scene, camera);
    if (fgRenderer) fgRenderer.render(fgScene, fgCamera);
  }
  animate();
})();
