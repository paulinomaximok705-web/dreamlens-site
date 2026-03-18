/* DreamLens — Analyze Page Init (UI, stars, nav) */
(function() {
  'use strict';

  function initStars() {
    const c = document.getElementById('dsStars');
    if (!c) return;
    const count = window.innerWidth < 768 ? 60 : 120;
    const f = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'ds-star';
      const sz = Math.random() * 2 + 0.5;
      s.style.cssText = [
        `width:${sz}px`, `height:${sz}px`,
        `left:${Math.random()*100}%`, `top:${Math.random()*100}%`,
        `--star-dur:${(Math.random()*4+2).toFixed(1)}s`,
        `--star-delay:${(Math.random()*5).toFixed(1)}s`,
        `--star-op:${(Math.random()*0.4+0.25).toFixed(2)}`
      ].join(';');
      f.appendChild(s);
    }
    c.appendChild(f);
  }

  function initMist() {
    const c = document.getElementById('dsMist');
    if (!c) return;
    [
      { color:'rgba(124,58,237,0.1)', size:400, x:'15%', y:'20%', dur:'22s' },
      { color:'rgba(6,182,212,0.07)', size:350, x:'80%', y:'60%', dur:'28s' },
    ].forEach((o,i) => {
      const el = document.createElement('div');
      el.className = 'ds-mist-orb';
      el.style.cssText = [
        `width:${o.size}px`,`height:${o.size}px`,
        `left:${o.x}`,`top:${o.y}`,
        `transform:translate(-50%,-50%)`,
        `background:${o.color}`,
        `animation-duration:${o.dur}`,
        `animation-delay:${i*-6}s`
      ].join(';');
      c.appendChild(el);
    });
  }

  function initNav() {
    const nav = document.getElementById('dsNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!nav) return;
    nav.classList.add('ds-nav--scrolled');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('ds-nav--open');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initMist();
    initNav();
  });
})();
