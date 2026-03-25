/* ====================================================
   DreamLens - main.js  全站公共脚本
==================================================== */

// ---- 星空生成 ----
function generateStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;
    const count = window.innerWidth > 768 ? 200 : 100;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star' + (Math.random() > 0.8 ? ' large' : '');
        star.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --duration: ${2 + Math.random() * 4}s;
            --delay: ${Math.random() * 5}s;
        `;
        container.appendChild(star);
    }
}

// ---- 导航滚动效果 ----
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

// ---- 移动端导航 ----
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        const icon = toggle.querySelector('i');
        icon.className = links.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });

    // 点击链接关闭菜单
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            const icon = toggle.querySelector('i');
            icon.className = 'fas fa-bars';
        });
    });
}

// ---- Reveal 动画（Intersection Observer）----
function initReveal() {
    const revealEls = document.querySelectorAll('.reveal, .ds-reveal');
    if (revealEls.length === 0) return;

    const markVisible = (el) => {
        if (el.classList.contains('ds-reveal')) {
            el.classList.add('ds-in');
        }
        if (el.classList.contains('reveal')) {
            el.classList.add('visible');
        }
    };

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(markVisible);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                markVisible(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
}

// ---- Toast 消息 ---- (supports both old .show and new .ds-toast--show)
function showToast(message, duration = 2800) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'ds-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    // Support both class patterns
    toast.classList.add('show');
    toast.classList.add('ds-toast--show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.remove('ds-toast--show');
    }, duration);
}

// ---- 内测反馈模板 ----
function getFeedbackTemplate(pageLabel = '当前页面') {
    return [
        'DreamLens 内测反馈',
        `页面：${pageLabel}`,
        `链接：${window.location.href}`,
        `时间：${new Date().toLocaleString('zh-CN')}`,
        `设备：${navigator.userAgent}`,
        '',
        '问题描述：',
        '',
        '复现步骤：',
        '1.',
        '2.',
        '3.',
        '',
        '期望结果：',
        '',
        '实际结果：',
        ''
    ].join('\n');
}

async function copyFeedbackTemplate(pageLabel = '当前页面') {
    const text = getFeedbackTemplate(pageLabel);
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            showToast('📝 反馈模板已复制，直接发给我即可');
            return true;
        }
    } catch (_) {}

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('📝 反馈模板已复制，直接发给我即可');
    return true;
}

function showConfirmDialog({
    title = '确认操作',
    message = '确定继续吗？',
    confirmText = '确认',
    cancelText = '取消',
    tone = 'default'
} = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ds-confirm';

        const panel = document.createElement('div');
        panel.className = `ds-confirm__panel${tone === 'danger' ? ' ds-confirm__panel--danger' : ''}`;
        panel.innerHTML = `
            <div class="ds-confirm__title">${title}</div>
            <div class="ds-confirm__desc">${message}</div>
            <div class="ds-confirm__actions">
                <button type="button" class="ds-btn ds-btn-ghost ds-btn-sm ds-confirm__cancel">${cancelText}</button>
                <button type="button" class="ds-btn ds-btn-sm ds-confirm__ok${tone === 'danger' ? ' ds-confirm__ok--danger' : ' ds-btn-primary'}">${confirmText}</button>
            </div>
        `;

        const cleanup = (result) => {
            overlay.remove();
            resolve(result);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup(false);
        });
        panel.querySelector('.ds-confirm__cancel').addEventListener('click', () => cleanup(false));
        panel.querySelector('.ds-confirm__ok').addEventListener('click', () => cleanup(true));

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    });
}

// ---- 平滑锚点 ----
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initBetaLoginNotice() {
    const betaLoginTriggers = document.querySelectorAll('[data-beta-login]');
    if (betaLoginTriggers.length === 0) return;

    betaLoginTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            showToast('登录暂未开放，当前网站仍处于内测阶段，账号登录功能暂未开放，敬请期待。', 3600);
        });
    });
}

function ensureSiteWarning() {
    const warningText = '内测版 · 数据仅保存在当前浏览器 · 本产品不替代专业心理咨询';

    const buildWarning = () => {
        const footer = document.createElement('footer');
        footer.className = 'ds-site-warning ds-z1';
        footer.innerHTML = `
            <p>© 2026 DreamLens</p>
            <p>${warningText}</p>
        `;
        return footer;
    };

    const syncWarningText = (container) => {
        const items = container.querySelectorAll('p');
        if (items[0]) items[0].textContent = '© 2026 DreamLens';
        if (items[1]) {
            items[1].textContent = warningText;
        } else {
            const warning = document.createElement('p');
            warning.textContent = warningText;
            container.appendChild(warning);
        }
    };

    const indexBottom = document.querySelector('.idx-footerband__bottom');
    if (indexBottom) {
        syncWarningText(indexBottom);
        return;
    }

    const subBandBottom = document.querySelector('.sub-band__bottom');
    if (subBandBottom) {
        subBandBottom.style.display = 'none';
        const subBand = subBandBottom.closest('.sub-band');
        if (subBand && !subBand.nextElementSibling?.classList.contains('ds-site-warning')) {
            subBand.insertAdjacentElement('afterend', buildWarning());
        }
        return;
    }

    const footerBottom = document.querySelector('.ds-footer__bottom');
    if (footerBottom) {
        syncWarningText(footerBottom);
        return;
    }

    if (document.querySelector('.ds-site-warning')) return;

    const host = document.querySelector('.ds-subpage-shell') || document.body;
    host.appendChild(buildWarning());
}

// ---- Dream ambient music ----
class DreamAudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.padGain = null;
        this.chimeGain = null;
        this.padOscillators = [];
        this.padLfo = null;
        this.padLfoGain = null;
        this.chimeTimer = null;
        this.progressTimer = null;
        this.currentChord = 0;
        this.isReady = false;
        this.isPlaying = false;
        this.chords = [
            [174.61, 207.65, 261.63],
            [164.81, 207.65, 246.94],
            [155.56, 196.0, 233.08],
            [146.83, 185.0, 220.0]
        ];
    }

    async setup() {
        if (this.isReady) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        this.audioContext = new AudioCtx();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.0;
        this.masterGain.connect(this.audioContext.destination);

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 760;
        filter.Q.value = 1.1;
        filter.connect(this.masterGain);

        this.padGain = this.audioContext.createGain();
        this.padGain.gain.value = 0.16;
        this.padGain.connect(filter);

        this.chimeGain = this.audioContext.createGain();
        this.chimeGain.gain.value = 0.0;
        this.chimeGain.connect(filter);

        this.padLfo = this.audioContext.createOscillator();
        this.padLfo.type = 'sine';
        this.padLfo.frequency.value = 0.05;
        this.padLfoGain = this.audioContext.createGain();
        this.padLfoGain.gain.value = 0.02;
        this.padLfo.connect(this.padLfoGain);
        this.padLfoGain.connect(this.masterGain.gain);
        this.padLfo.start();

        this.startPadLayer();
        this.isReady = true;
    }

    startPadLayer() {
        const now = this.audioContext.currentTime;
        this.padOscillators = this.chords[0].map((frequency, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = index === 1 ? 'triangle' : 'sine';
            osc.frequency.value = frequency;
            gain.gain.value = 0.034 + index * 0.006;
            osc.connect(gain);
            gain.connect(this.padGain);
            osc.start(now);
            return { osc, gain };
        });
    }

    transitionChord(index) {
        if (!this.audioContext || !this.padOscillators.length) return;
        const now = this.audioContext.currentTime;
        this.currentChord = index % this.chords.length;
        const nextChord = this.chords[this.currentChord];
        this.padOscillators.forEach((node, idx) => {
            node.osc.frequency.cancelScheduledValues(now);
            node.osc.frequency.linearRampToValueAtTime(nextChord[idx], now + 5.2);
        });
    }

    scheduleProgression() {
        clearInterval(this.progressTimer);
        this.progressTimer = setInterval(() => {
            this.transitionChord(this.currentChord + 1);
        }, 12000);
    }

    scheduleChimes() {
        const playChime = () => {
            if (!this.isPlaying || !this.audioContext) return;
            const now = this.audioContext.currentTime;
            const source = this.audioContext.createOscillator();
            const shimmer = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const shimmerGain = this.audioContext.createGain();
            const base = this.chords[this.currentChord][Math.floor(Math.random() * 3)];
            const note = base * (Math.random() > 0.7 ? 1.5 : 1);

            source.type = 'sine';
            shimmer.type = 'sine';
            source.frequency.value = note;
            shimmer.frequency.value = note * 0.5025;

            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.018, now + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);

            shimmerGain.gain.setValueAtTime(0.0, now);
            shimmerGain.gain.linearRampToValueAtTime(0.01, now + 0.9);
            shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.2);

            source.connect(gain);
            shimmer.connect(shimmerGain);
            gain.connect(this.chimeGain);
            shimmerGain.connect(this.chimeGain);

            source.start(now);
            shimmer.start(now);
            source.stop(now + 7.2);
            shimmer.stop(now + 7.6);

            const nextDelay = 12000 + Math.random() * 12000;
            this.chimeTimer = window.setTimeout(playChime, nextDelay);
        };

        clearTimeout(this.chimeTimer);
        this.chimeTimer = window.setTimeout(playChime, 3200);
    }

    async enable() {
        await this.setup();
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.14, this.audioContext.currentTime + 2.4);
        this.isPlaying = true;
        this.scheduleProgression();
        this.scheduleChimes();
    }

    bindAutostartFallback() {
        const resumeOnGesture = async () => {
            window.removeEventListener('pointerdown', resumeOnGesture);
            window.removeEventListener('keydown', resumeOnGesture);
            await this.enable();
        };
        window.addEventListener('pointerdown', resumeOnGesture, { once: true, passive: true });
        window.addEventListener('keydown', resumeOnGesture, { once: true });
    }

    async init() {
        try {
            await this.enable();
        } catch (_) {
            this.bindAutostartFallback();
            return;
        }
        if (!this.isPlaying) {
            this.bindAutostartFallback();
        }
    }
}

// ---- 初始化 ----
document.addEventListener('DOMContentLoaded', () => {
    generateStars();
    initNavbar();
    initMobileNav();
    initReveal();
    initSmoothScroll();
    initBetaLoginNotice();
    ensureSiteWarning();
    const dreamAudio = new DreamAudioEngine();
    dreamAudio.init();
    window.dreamAudio = dreamAudio;

    // 为主要区块添加 reveal 类
    const sections = document.querySelectorAll('section:not(.hero), .input-card, .pricing-card, .testimonial-card');
    sections.forEach((el, i) => {
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
            el.style.transitionDelay = `${(i % 4) * 0.08}s`;
        }
    });
    // 重新初始化 reveal
    initReveal();
});

// 暴露给 HTML inline 调用的全局方法
window.showToast = showToast;
window.copyFeedbackTemplate = copyFeedbackTemplate;
window.showConfirmDialog = showConfirmDialog;
