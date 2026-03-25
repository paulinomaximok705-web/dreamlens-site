/* DreamLens — Pricing Page JS */
(function() {
  'use strict';

  /* ── Stars & Mist ── */
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
        `width:${sz}px`, `height:${sz}px`,
        `left:${Math.random()*100}%`, `top:${Math.random()*100}%`,
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
      { color:'rgba(124,58,237,0.1)', size:500, x:'10%', y:'25%', dur:'25s' },
      { color:'rgba(236,72,153,0.07)', size:400, x:'85%', y:'50%', dur:'30s' },
      { color:'rgba(6,182,212,0.08)', size:350, x:'50%', y:'80%', dur:'20s' },
    ].forEach((o,i) => {
      const el = document.createElement('div');
      el.className = 'ds-mist-orb';
      el.style.cssText = [
        `width:${o.size}px`, `height:${o.size}px`,
        `left:${o.x}`, `top:${o.y}`,
        `transform:translate(-50%,-50%)`,
        `background:${o.color}`,
        `animation-duration:${o.dur}`,
        `animation-delay:${i*-5}s`
      ].join(';');
      c.appendChild(el);
    });
  }

  /* ── Nav ── */
  function initNav() {
    const nav = document.getElementById('dsNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!nav) return;
    nav.classList.add('ds-nav--scrolled');
    if (toggle && links) {
      toggle.addEventListener('click', () => links.classList.toggle('ds-nav--open'));
    }
  }

  /* ── Reveal ── */
  function initReveal() {
    const els = document.querySelectorAll('.ds-reveal');
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('ds-in'); io.unobserve(e.target) }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      els.forEach(el => io.observe(el));
    } else {
      els.forEach(el => el.classList.add('ds-in'));
    }
  }

  /* ── Billing Toggle ── */
  let isAnnual = false;
  const plans = {
    basic:   { monthly: '¥29', annual: '¥20', annualTotal: '¥244/年' },
    pro:     { monthly: '¥79', annual: '¥55', annualTotal: '¥664/年' },
    premium: { monthly: '¥159', annual: '¥111', annualTotal: '¥1336/年' }
  };

  function toggleBilling() {
    isAnnual = !isAnnual;
    const btn = document.getElementById('billingToggle');
    const labelM = document.getElementById('labelMonthly');
    const labelA = document.getElementById('labelAnnual');
    if (btn) btn.classList.toggle('active', isAnnual);
    if (labelM) labelM.classList.toggle('active', !isAnnual);
    if (labelA) labelA.classList.toggle('active', isAnnual);

    Object.entries(plans).forEach(([key, val]) => {
      const priceEl  = document.getElementById(key + 'Price');
      const periodEl = document.getElementById(key + 'Period');
      const noteEl   = document.getElementById(key + 'AnnualNote');
      if (priceEl)  priceEl.textContent  = isAnnual ? val.annual   : val.monthly;
      if (periodEl) periodEl.textContent = isAnnual ? '/月' : '/月';
      if (noteEl)   noteEl.style.display = isAnnual ? 'block' : 'none';
    });
  }

  /* ── FAQ ── */
  function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.pr-faq__item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  }

  /* ── Upgrade Modal ── */
  const modalData = {
    free:    { icon:'🌟', name:'免费体验',  price:'¥0',   period:'永久',   desc:'感受 AI 梦境解析的神奇体验' },
    basic:   { icon:'🌙', name:'升级基础版', price:'¥29',  period:'/月',   desc:'解锁梦境日记功能和更多解析次数' },
    pro:     { icon:'⭐', name:'升级进阶版', price:'¥79',  period:'/月',   desc:'解锁梦境艺术生成、多维象征解读和梦境日记功能' },
    premium: { icon:'👑', name:'升级高级版', price:'¥159', period:'/月',   desc:'解锁全部功能，包括个性化行动建议和情绪健康追踪' }
  };

  function openUpgradeModal(plan) {
    const data = modalData[plan] || modalData.pro;
    const modal = document.getElementById('upgradeModal');
    if (!modal) return;
    document.getElementById('modalPlanIcon').textContent  = data.icon;
    document.getElementById('modalPlanName').textContent  = data.name;
    const amountEl = document.getElementById('modalPlanPrice').querySelector('.pr-modal__price-amount');
    const periodEl = document.getElementById('modalPlanPrice').querySelector('.pr-modal__price-period');
    if (amountEl) amountEl.textContent = data.price;
    if (periodEl) periodEl.textContent = data.period;
    modal.querySelector('.pr-modal__desc').textContent = data.desc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeUpgradeModal(e) {
    if (e && e.target !== document.getElementById('upgradeModal') && !e.target.closest('.pr-modal__close')) return;
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  /* ── Toast ── */
  function showToast(msg, dur = 2800) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('ds-toast--show');
    setTimeout(() => t.classList.remove('ds-toast--show'), dur);
  }

  /* ── Payment btn demo ── */
  function initPaymentBtns() {
    document.querySelectorAll('.pr-modal__pay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('📝 已切换到升级意向登记页');
      });
    });
  }

  /* ── Expose globals ── */
  window.toggleBilling     = toggleBilling;
  window.toggleFaq         = toggleFaq;
  window.openUpgradeModal  = openUpgradeModal;
  window.closeUpgradeModal = closeUpgradeModal;

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initMist();
    initNav();
    initReveal();
    initPaymentBtns();
    // Set monthly as active by default
    const labelM = document.getElementById('labelMonthly');
    if (labelM) labelM.classList.add('active');
  });

  /* ── Keyboard close ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeUpgradeModal({ target: document.getElementById('upgradeModal') });
  });
})();
