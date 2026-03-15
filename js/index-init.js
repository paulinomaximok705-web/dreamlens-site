/* DreamLens — Index Page Init */
(function() {
  'use strict';

  /* ── Stars ── */
  function initStars() {
    const container = document.getElementById('dsStars');
    if (!container) return;
    const count = window.innerWidth < 768 ? 80 : 160;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'ds-star';
      const size = Math.random() * 2.5 + 0.5;
      s.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `--star-dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
        `--star-delay:${(Math.random() * 5).toFixed(1)}s`,
        `--star-op:${(Math.random() * 0.5 + 0.3).toFixed(2)}`
      ].join(';');
      frag.appendChild(s);
    }
    /* shooting stars */
    for (let i = 0; i < 3; i++) {
      const ss = document.createElement('div');
      ss.className = 'ds-shooting-star';
      ss.style.cssText = [
        `left:${Math.random() * 60}%`,
        `top:${Math.random() * 40}%`,
        `animation-delay:${(i * 3 + Math.random() * 2).toFixed(1)}s`,
        `animation-duration:${(Math.random() * 4 + 5).toFixed(1)}s`
      ].join(';');
      frag.appendChild(ss);
    }
    container.appendChild(frag);
  }

  /* ── Mist orbs ── */
  function initMist() {
    const container = document.getElementById('dsMist');
    if (!container) return;
    const orbs = [
      { color: 'rgba(124,58,237,0.12)', size: 500, x: '20%', y: '30%', dur: '20s' },
      { color: 'rgba(6,182,212,0.09)',  size: 400, x: '70%', y: '60%', dur: '26s' },
      { color: 'rgba(236,72,153,0.08)', size: 350, x: '50%', y: '80%', dur: '18s' },
      { color: 'rgba(245,158,11,0.06)', size: 300, x: '85%', y: '20%', dur: '22s' },
    ];
    orbs.forEach((o, i) => {
      const el = document.createElement('div');
      el.className = 'ds-mist-orb';
      el.style.cssText = [
        `width:${o.size}px`, `height:${o.size}px`,
        `left:${o.x}`, `top:${o.y}`,
        `transform:translate(-50%,-50%)`,
        `background:${o.color}`,
        `animation-duration:${o.dur}`,
        `animation-delay:${i * -4}s`
      ].join(';');
      container.appendChild(el);
    });
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    const els = document.querySelectorAll('.ds-reveal');
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('ds-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(el => io.observe(el));
    } else {
      els.forEach(el => el.classList.add('ds-in'));
    }
  }

  /* ── Navbar ── */
  function initNav() {
    const nav = document.getElementById('dsNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('ds-nav--scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('ds-nav--open');
        toggle.setAttribute('aria-expanded', open);
      });
      /* close on link click */
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => links.classList.remove('ds-nav--open'));
      });
    }

    /* smooth scroll for anchor links */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Parallax tilt on orb ── */
  function initOrbTilt() {
    const orb = document.querySelector('.idx-orb');
    if (!orb || window.innerWidth < 900) return;
    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      orb.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg)`;
    });
    document.addEventListener('mouseleave', () => {
      orb.style.transform = '';
    });
  }

  /* ── Number count-up ── */
  function initCountUp() {
    const nums = document.querySelectorAll('.idx-hero__stat-num');
    if (!nums.length) return;

    const parseTarget = (el) => {
      const text = el.textContent.trim();
      const match = text.match(/[\d,]+/);
      if (!match) return null;
      const raw = match[0].replace(/,/g, '');
      return { value: parseInt(raw), suffix: text.replace(match[0], ''), prefix: text.startsWith(match[0]) ? '' : text.split(match[0])[0] };
    };

    const animateNum = (el, target, suffix, prefix, duration) => {
      const start = performance.now();
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * ease);
        el.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const info = parseTarget(e.target);
        if (info) animateNum(e.target, info.value, info.suffix, info.prefix, 1800);
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initMist();
    initReveal();
    initNav();
    initOrbTilt();
    initCountUp();
  });
})();
