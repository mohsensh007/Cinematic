(function () {
  var faDigits = function (s) {
    return String(s).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; });
  };
  var pad2 = function (n) { return n < 10 ? '0' + n : '' + n; };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!window.gsap || !window.Lenis) {
    document.documentElement.classList.remove('js');
    var pl = document.querySelector('.preloader');
    if (pl) pl.remove();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  window.__lenis = new Lenis({ duration: 1.15, smoothWheel: !reduced });
  var lenis = window.__lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  function splitWords(el) {
    if (el.dataset.splitDone) return;
    function processNode(node) {
      var frag = document.createDocumentFragment();
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var words = child.textContent.split(/\s+/).filter(Boolean);
          words.forEach(function (w, i) {
            if (i > 0) frag.appendChild(document.createTextNode(' '));
            var outer = document.createElement('span');
            outer.className = 'w';
            var inner = document.createElement('span');
            inner.className = 'wi';
            inner.textContent = w;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
        } else if (child.nodeType === 1) {
          if (child.tagName === 'BR') { frag.appendChild(child); return; }
          processNode(child);
          frag.appendChild(child);
        }
      });
      while (node.firstChild) node.removeChild(node.firstChild);
      node.appendChild(frag);
    }
    processNode(el);
    el.dataset.splitDone = '1';
  }
  document.querySelectorAll('[data-split]').forEach(splitWords);

  var preloader = document.querySelector('.preloader');
  var pctEl = document.querySelector('.pre-pct');
  var barEl = document.querySelector('.pre-bar i');

  function heroIntro() {
    if (!document.querySelector('.hero-left')) {
      gsap.to('.nav', { y: 0, opacity: 1, duration: 0.8 });
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.nav', { y: 0, opacity: 1, duration: 0.8 }, 0)
      .from('.hero-chip', { y: 24, opacity: 0, duration: 0.7 }, 0.05)
      .to('.main-title .wi', { y: 0, duration: 1, stagger: 0.09, ease: 'expo.out' }, 0.1)
      .from('.hero-desc', { y: 30, opacity: 0, duration: 0.8 }, 0.5)
      .from('.cta-group > *', { y: 26, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.62)
      .from('.award-badge', { y: 24, opacity: 0, duration: 0.7 }, 0.82)
      .to('.side-title .wi', { y: 0, duration: 1, stagger: 0.09, ease: 'expo.out' }, 0.35)
      .from('.card', { y: 44, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(1.6)' }, 0.55)
      .from('.hero-scroll', { opacity: 0, duration: 0.8 }, 1.15);
  }

  if (preloader) {
    lenis.stop();
    var progress = { v: 0 };
    var preTl = gsap.timeline({
      onComplete: function () {
        gsap.timeline()
          .to('.pre-inner', { opacity: 0, y: -40, filter: 'blur(8px)', duration: 0.5, ease: 'power2.in' })
          .to(preloader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.15')
          .add(function () {
            preloader.remove();
            lenis.start();
            heroIntro();
          }, '-=0.55');
      }
    });
    preTl.to(progress, {
      v: 100, duration: 1.6, ease: 'power2.inOut',
      onUpdate: function () {
        var v = Math.round(progress.v);
        if (pctEl) pctEl.textContent = faDigits(v) + '٪';
        if (barEl) barEl.style.transform = 'scaleX(' + v / 100 + ')';
      }
    });
  } else {
    lenis.start();
    heroIntro();
  }

  gsap.set('.nav', { y: -30, opacity: 0 });

  var nav = document.querySelector('.nav');
  ScrollTrigger.create({
    start: 60,
    onToggle: function (self) { nav.classList.toggle('scrolled', self.isActive); }
  });

  var burger = document.querySelector('.burger');
  var mmenu = document.querySelector('.mmenu');
  if (burger && mmenu) {
    var menuOpen = false;
    burger.addEventListener('click', function () {
      menuOpen = !menuOpen;
      burger.classList.toggle('open', menuOpen);
      mmenu.classList.toggle('open', menuOpen);
      if (menuOpen) {
        lenis.stop();
        gsap.to('.mmenu a.mlink', { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.15, ease: 'power3.out' });
      } else {
        lenis.start();
        gsap.set('.mmenu a.mlink', { opacity: 0, y: 30 });
      }
    });
    mmenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menuOpen = false;
        burger.classList.remove('open');
        mmenu.classList.remove('open');
        lenis.start();
        gsap.set('.mmenu a.mlink', { opacity: 0, y: 30 });
      });
    });
  }

  if (window.matchMedia('(pointer: fine)').matches) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
      var cx = -100, cy = -100, rx = -100, ry = -100;
      window.addEventListener('mousemove', function (e) {
        cx = e.clientX; cy = e.clientY;
        dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      }, { passive: true });
      gsap.ticker.add(function () {
        rx += (cx - rx) * 0.16;
        ry += (cy - ry) * 0.16;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      });
      document.querySelectorAll('a, button, .tilt, .faq-q, .client-chip').forEach(function (el) {
        el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
        el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
      });
    }
  }

  document.querySelectorAll('.tilt').forEach(function (card) {
    if (window.matchMedia('(min-width: 881px)').matches && card.closest('.services')) return;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      var rx = (py - 0.5) * -10;
      var ry = (px - 0.5) * 10;
      card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    if (window.matchMedia('(min-width: 881px)').matches && (el.closest('.services') || el.closest('.why'))) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    var delay = parseFloat(el.dataset.delay || 0);
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, delay: delay, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  document.querySelectorAll('[data-split]').forEach(function (el) {
    if (el.closest('.hero')) return;
    if (window.matchMedia('(min-width: 881px)').matches && el.closest('.services')) return;
    gsap.to(el.querySelectorAll('.wi'), {
      y: 0, duration: 1, stagger: 0.07, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  document.querySelectorAll('[data-speed]').forEach(function (el) {
    var speed = parseFloat(el.dataset.speed || 0.1);
    gsap.to(el, {
      yPercent: speed * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
  });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || '';
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: end, duration: 2, ease: 'power2.out',
          onUpdate: function () {
            el.textContent = faDigits(Math.round(obj.v)) + suffix;
          }
        });
      }
    });
  });

  /* ---------- pinned services: page holds, cards appear one-by-one ---------- */
  var svcSection = document.querySelector('.services');
  if (svcSection && window.matchMedia('(min-width: 881px)').matches) {
    var svcHead = svcSection.querySelector('.sec-head');
    var svcCards = gsap.utils.toArray('.svc-card', svcSection);
    var svcTl = gsap.timeline({
      scrollTrigger: {
        trigger: svcSection,
        start: 'top top',
        end: '+=2200',
        scrub: 0.7,
        pin: true,
        anticipatePin: 1
      }
    });
    if (svcHead) {
      svcTl.fromTo(svcHead,
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0);
      svcTl.to(svcHead.querySelectorAll('.wi'),
        { y: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }, 0.05);
    }
    svcCards.forEach(function (card, i) {
      svcTl.fromTo(card,
        { autoAlpha: 0, y: 90, rotationY: -55, transformPerspective: 900, scale: 0.9, filter: 'blur(12px)' },
        { autoAlpha: 1, y: 0, rotationY: 0, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' },
        0.4 + i * 0.28);
    });
    svcTl.to({}, { duration: 0.5 });
  }

  /* ---------- flavor cards (switch driven by scroll in three-scene) ---------- */
  var flavorCards = document.querySelectorAll('.product-carousel .card');
  window.addEventListener('flavorchange', function (e) {
    flavorCards.forEach(function (c) { c.classList.toggle('active', c.dataset.flavor === e.detail); });
  });

  /* ---------- rising bubbles ---------- */
  (function () {
    var box = document.getElementById('bubbles');
    if (!box || reduced) return;
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var grad = g.createRadialGradient(24, 22, 4, 32, 32, 29);
    grad.addColorStop(0, 'rgba(255,255,255,.5)');
    grad.addColorStop(0.3, 'rgba(255,255,255,.1)');
    grad.addColorStop(0.85, 'rgba(255,255,255,.05)');
    grad.addColorStop(1, 'rgba(255,255,255,.4)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(32, 32, 29, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.45)';
    g.lineWidth = 2;
    g.beginPath(); g.arc(32, 32, 29, 0, Math.PI * 2); g.stroke();
    var url = c.toDataURL();
    setInterval(function () {
      if (document.hidden || box.children.length > 26) return;
      var img = document.createElement('img');
      img.src = url;
      img.className = 'bubble-img';
      img.alt = '';
      var size = 12 + Math.random() * 38;
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.style.left = (Math.random() * 100) + '%';
      img.style.animationDuration = (6 + Math.random() * 9) + 's';
      img.addEventListener('animationend', function () { img.remove(); });
      box.appendChild(img);
    }, 400);
  })();

  /* ---------- walking man journey: pinned, GIF enters + items appear one-by-one ---------- */
  var walk = document.querySelector('.walk');
  if (walk && window.matchMedia('(min-width: 881px)').matches) {
    var man = walk.querySelector('.walk-man');
    var manImg = man ? man.querySelector('img') : null;
    var stage = walk.querySelector('.walk-stage');
    var ground = walk.querySelector('.walk-ground');
    var items = gsap.utils.toArray('.walk-item');
    var walkFill = walk.querySelector('.walk-fill');
    var walkCounter = walk.querySelector('.walk-count');

    var walkTl = gsap.timeline({
      scrollTrigger: {
        trigger: walk,
        start: 'top top',
        end: '+=3400',
        scrub: 0.8,
        pin: '.walk-pin',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var q = Math.min(items.length - 1, Math.floor(self.progress * items.length));
          if (walkCounter) walkCounter.textContent = faDigits(pad2(q + 1)) + ' / ' + faDigits(pad2(items.length));
          if (walkFill) walkFill.style.transform = 'scaleX(' + self.progress + ')';
        }
      }
    });

    if (manImg) walkTl.fromTo(manImg,
      { x: 170 }, { x: 0, duration: 0.9, ease: 'power3.out' }, 0);
    if (man) {
      walkTl.fromTo(man,
        { autoAlpha: 0, scale: 0.6, rotationY: -45, transformPerspective: 1000, filter: 'blur(16px)' },
        { autoAlpha: 1, scale: 0.85, rotationY: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, 0);
      walkTl.fromTo(man,
        { x: 0 },
        { x: function () { return -(stage.offsetWidth * 0.42); }, ease: 'none', duration: 4.2 }, 0);
      walkTl.to(man, { scale: 1.06, ease: 'none', duration: 3.4 }, 0.9);
    }
    if (ground) walkTl.fromTo(ground,
      { scaleX: 0, transformOrigin: 'right center' },
      { scaleX: 1, duration: 1.2, ease: 'power1.inOut' }, 0.15);

    items.forEach(function (item, i) {
      walkTl.fromTo(item,
        { autoAlpha: 0, filter: 'blur(16px)', x: 90, y: 26, rotationY: 65, transformPerspective: 900, scale: 0.86 },
        { autoAlpha: 1, filter: 'blur(0px)', x: 0, y: 0, rotationY: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
        0.55 + i * 0.95);
    });
    walkTl.to('.walk-stage', { y: -46, duration: 0.3, ease: 'power1.in' }, 4.15);
  }

  /* pinned why must be created AFTER walk: pin spacers shift later triggers'
     start positions, so creation order has to match document order */
  var why = document.querySelector('.why');
  if (why && window.matchMedia('(min-width: 881px)').matches) {
    var whyCards = gsap.utils.toArray('.why-card', why);
    if (whyCards.length) {
      var whyTl = gsap.timeline({
        scrollTrigger: {
          trigger: why,
          start: 'top top',
          end: '+=' + (whyCards.length * 950),
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      whyCards.forEach(function (card, i) {
        if (i > 0) {
          whyTl.fromTo(card,
            { y: function () { return window.innerHeight * 0.95; } },
            { y: 0, duration: 0.8, ease: 'power2.out' },
            (i - 1) * 0.9 + 0.1);
          for (var j = 0; j < i; j++) {
            whyTl.to(whyCards[j],
              { scale: 1 - (i - j) * 0.05, y: -(i - j) * 44, duration: 0.45, ease: 'power1.inOut' },
              (i - 1) * 0.9 + 0.4);
          }
        }
      });
      whyTl.to({}, { duration: 0.4 });
    }
  }

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        gsap.to(other.querySelector('.faq-a'), { maxHeight: 0, duration: 0.45, ease: 'power3.inOut' });
      });
      if (!isOpen) {
        item.classList.add('open');
        gsap.to(a, { maxHeight: a.scrollHeight, duration: 0.5, ease: 'power3.out' });
      }
    });
  });

  var toast = document.querySelector('.toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector('.t-msg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 4200);
  }

  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = form.querySelector('input[type="tel"]');
      if (phone && phone.value && !/^[0-9\-\+\*\#]{8,}$/.test(phone.value.replace(/^\s+|\s+$/g, ''))) {
        showToast('شماره تماس واردشده معتبر نیست؛ لطفاً دوباره بررسی کنید.');
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        var original = btn.textContent;
        btn.textContent = 'در حال ارسال...';
        setTimeout(function () {
          btn.disabled = false;
          btn.textContent = original;
          form.reset();
          showToast('درخواست شما با موفقیت ثبت شد؛ کارشناسان بیست نگار به‌زودی با شما تماس می‌گیرند.');
        }, 900);
      }
    });
  });

  var yEl = document.querySelector('[data-year]');
  if (yEl) yEl.textContent = faDigits(new Date().toLocaleDateString('fa-IR', { year: 'numeric' }));

  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });
})();
