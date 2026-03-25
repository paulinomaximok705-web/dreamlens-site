/* DreamLens — Content Page Init */
(function() {
  'use strict';

  function initStars() {
    const c = document.getElementById('dsStars');
    if (!c) return;
    const frag = document.createDocumentFragment();
    const n = window.innerWidth < 768 ? 70 : 130;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      s.className = 'ds-star';
      const sz = Math.random() * 2 + 0.5;
      s.style.cssText = [
        `width:${sz}px`,
        `height:${sz}px`,
        `left:${Math.random()*100}%`,
        `top:${Math.random()*100}%`,
        `--star-dur:${(Math.random()*4+2).toFixed(1)}s`,
        `--star-delay:${(Math.random()*5).toFixed(1)}s`,
        `--star-op:${(Math.random()*0.45+0.25).toFixed(2)}`
      ].join(';');
      frag.appendChild(s);
    }
    const shootCount = window.innerWidth < 768 ? 2 : 3;
    for (let i = 0; i < shootCount; i++) {
      const ss = document.createElement('div');
      ss.className = 'ds-shooting-star';
      ss.style.cssText = [
        `left:${Math.random() * 70}%`,
        `top:${Math.random() * 38}%`,
        `animation-delay:${(i * 3.1 + Math.random() * 1.6).toFixed(1)}s`,
        `animation-duration:${(Math.random() * 3 + 5.5).toFixed(1)}s`
      ].join(';');
      frag.appendChild(ss);
    }
    c.appendChild(frag);
  }

  function initMist() {
    const c = document.getElementById('dsMist');
    if (!c) return;
    [
      { color:'rgba(124,58,237,0.1)', size:500, x:'10%', y:'24%', dur:'25s' },
      { color:'rgba(236,72,153,0.07)', size:420, x:'85%', y:'48%', dur:'30s' },
      { color:'rgba(6,182,212,0.08)', size:350, x:'50%', y:'80%', dur:'20s' }
    ].forEach((o, i) => {
      const el = document.createElement('div');
      el.className = 'ds-mist-orb';
      el.style.cssText = [
        `width:${o.size}px`,
        `height:${o.size}px`,
        `left:${o.x}`,
        `top:${o.y}`,
        'transform:translate(-50%,-50%)',
        `background:${o.color}`,
        `animation-duration:${o.dur}`,
        `animation-delay:${i * -5}s`
      ].join(';');
      c.appendChild(el);
    });
  }

  function initNav() {
    const nav = document.getElementById('dsNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (nav) nav.classList.add('ds-nav--scrolled');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('ds-nav--open');
        toggle.setAttribute('aria-expanded', open);
      });
      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => links.classList.remove('ds-nav--open'));
      });
    }
  }

  function initReveal() {
    const els = document.querySelectorAll('.ds-reveal');
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('ds-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      els.forEach((el) => io.observe(el));
    } else {
      els.forEach((el) => el.classList.add('ds-in'));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initMist();
    initNav();
    initReveal();
  });
})();
