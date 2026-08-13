/* ============================================================
   SAIBUDEEN & ANISHA — LUXURY ISLAMIC WEDDING INVITATION
   Vanilla JavaScript — modular, commented, dependency-free
   ============================================================ */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. LOADING SCREEN
  ---------------------------------------------------------- */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    // Show the invitation message for a few seconds, then land directly
    // on the page. Fully automatic — no button, no close mark.
    setTimeout(() => loader.classList.add('hidden'), 3200);
  }

  /* ----------------------------------------------------------
     2. AMBIENT PARTICLE BACKGROUND (canvas)
     Layers: stars, golden dust, bokeh — all slow-moving.
  ---------------------------------------------------------- */
  function initParticleField() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function makeParticles() {
      const count = window.innerWidth < 700 ? 55 : 110;
      particles = Array.from({ length: count }, () => spawn());
    }

    function spawn() {
      const type = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: (type < 0.7 ? Math.random() * 1.4 + 0.4 : Math.random() * 2.6 + 1.2) * dpr,
        speedY: (Math.random() * 0.12 + 0.03) * dpr,
        speedX: (Math.random() - 0.5) * 0.05 * dpr,
        alpha: Math.random() * 0.5 + 0.15,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
        gold: type > 0.6
      };
    }

    let frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const twinkle = 0.5 + 0.5 * Math.sin(frame * p.twinkleSpeed + p.twinklePhase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(201,166,74,${(p.alpha * twinkle).toFixed(3)})`
          : `rgba(251,244,223,${(p.alpha * twinkle).toFixed(3)})`;
        ctx.shadowBlur = p.gold ? 6 : 2;
        ctx.shadowColor = p.gold ? 'rgba(201,166,74,0.6)' : 'transparent';
        ctx.fill();
      });
      if (!reducedMotion) requestAnimationFrame(draw);
    }

    resize();
    makeParticles();
    draw();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
  }

  /* ----------------------------------------------------------
     3. CURSOR GLOW + CLICK PARTICLE BURST
  ---------------------------------------------------------- */
  function initCursorEffects() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    if (window.matchMedia('(hover: none)').matches) return;

    window.addEventListener('pointermove', e => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });

    document.addEventListener('click', e => {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'burst-particle';
        p.style.left = e.clientX + 'px';
        p.style.top = e.clientY + 'px';
        document.body.appendChild(p);
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const dist = 30 + Math.random() * 40;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        p.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
        ], { duration: 650 + Math.random() * 300, easing: 'cubic-bezier(.22,.68,0,1)' })
          .onfinish = () => p.remove();
      }
    });
  }

  /* ----------------------------------------------------------
     4. SCROLL PROGRESS BAR
  ---------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = scrolled + '%';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     5. NAVBAR: scrolled state, mobile toggle, active section
  ---------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));

    // Active section highlighting via IntersectionObserver
    const navAnchors = links.querySelectorAll('a[data-section]');
    const sections = Array.from(navAnchors)
      .map(a => document.getElementById(a.dataset.section))
      .filter(Boolean);

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.toggle('active', a.dataset.section === entry.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(s => io.observe(s));
  }

  /* ----------------------------------------------------------
     6. SCROLL REVEAL (fade / slide-up on enter viewport)
  ---------------------------------------------------------- */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------
     7. MAGNETIC BUTTONS
  ---------------------------------------------------------- */
  function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------
     8. 3D TILT ON COUPLE CARDS
  ---------------------------------------------------------- */
  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const media = card.querySelector('.couple-card-media');
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        media.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => { media.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------
     9. COUNTDOWN TIMER (with flip-digit animation)
  ---------------------------------------------------------- */
  function initCountdown() {
    const target = new Date('2026-09-17T10:30:00+05:30').getTime();
    const els = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins: document.getElementById('cd-mins'),
      secs: document.getElementById('cd-secs')
    };
    if (!els.days) return;
    const prev = { days: '', hours: '', mins: '', secs: '' };

    function update() {
      const now = Date.now();
      const diff = Math.max(target - now, 0);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDigit(els.days, prev, 'days', d);
      setDigit(els.hours, prev, 'hours', h);
      setDigit(els.mins, prev, 'mins', m);
      setDigit(els.secs, prev, 'secs', s);
    }

    function setDigit(el, prevObj, key, value) {
      const str = String(value).padStart(2, '0');
      if (str !== prevObj[key]) {
        prevObj[key] = str;
        el.querySelector('span').textContent = str;
        if (!reducedMotion) {
          el.classList.remove('flip');
          void el.offsetWidth; // restart animation
          el.classList.add('flip');
        }
      }
    }

    update();
    setInterval(update, 1000);
  }

  /* ----------------------------------------------------------
     10. VENUE: copy address, buttons already link out via href
  ---------------------------------------------------------- */
  function initVenue() {
    const copyBtn = document.getElementById('copyAddressBtn');
    const feedback = document.getElementById('copyFeedback');
    if (!copyBtn) return;
    const address = 'Dr. Rajeshwari Mahal, Pattukkottai, Tamil Nadu';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(address);
        feedback.textContent = 'Address copied to clipboard.';
      } catch (err) {
        feedback.textContent = address;
      }
      feedback.classList.add('show');
      setTimeout(() => feedback.classList.remove('show'), 2500);
    });
  }

  /* ----------------------------------------------------------
     11. WISHES WALL
  ---------------------------------------------------------- */
  function initWishes() {
    const form = document.getElementById('wishForm');
    const wall = document.getElementById('wishesWall');
    if (!form) return;

    const seed = [
      { name: 'Family & Friends', text: 'May Allah bless this union with love, patience, and endless barakah.' },
      { name: 'Well-wishers', text: 'Wishing you a lifetime of happiness, faith, and togetherness.' }
    ];
    seed.forEach(addWishCard);

    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('wishName');
      const textInput = document.getElementById('wishText');
      const name = nameInput.value.trim();
      const text = textInput.value.trim();
      if (!name || !text) return;
      addWishCard({ name, text }, true);
      nameInput.value = '';
      textInput.value = '';
    });

    function addWishCard(wish, prepend) {
      const card = document.createElement('div');
      card.className = 'wish-card';
      const p = document.createElement('p');
      p.textContent = wish.text;
      const span = document.createElement('span');
      span.textContent = '— ' + wish.name;
      card.appendChild(p);
      card.appendChild(span);
      if (prepend && wall.firstChild) wall.insertBefore(card, wall.firstChild);
      else wall.appendChild(card);
    }
  }

  /* ----------------------------------------------------------
     12. MUSIC PLAYER
  ---------------------------------------------------------- */
  function initMusic() {
    const player = document.getElementById('musicPlayer');
    const toggle = document.getElementById('musicToggle');
    const audio = document.getElementById('bgAudio');
    const volume = document.getElementById('musicVolume');
    const iconPlay = document.getElementById('musicIconPlay');
    const iconPause = document.getElementById('musicIconPause');
    if (!player) return;

    audio.volume = Number(volume.value);

    toggle.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        player.classList.add('playing');
        iconPlay.hidden = true;
        iconPause.hidden = false;
        toggle.setAttribute('aria-pressed', 'true');
        toggle.setAttribute('aria-label', 'Pause background music');
      } else {
        audio.pause();
        player.classList.remove('playing');
        iconPlay.hidden = false;
        iconPause.hidden = true;
        toggle.setAttribute('aria-pressed', 'false');
        toggle.setAttribute('aria-label', 'Play background music');
      }
    });

    volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
  }

  /* ----------------------------------------------------------
     13. SCROLL-TO-TOP BUTTON
  ---------------------------------------------------------- */
  function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     INIT ALL
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    if (!reducedMotion) initParticleField();
    initCursorEffects();
    initScrollProgress();
    initNav();
    initScrollReveal();
    initMagneticButtons();
    initTilt();
    initCountdown();
    initVenue();
    initWishes();
    initMusic();
    initScrollTop();
  });
})();
