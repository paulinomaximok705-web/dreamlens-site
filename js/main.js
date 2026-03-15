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
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
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

// ---- 平滑锚点 ----
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ---- 初始化 ----
document.addEventListener('DOMContentLoaded', () => {
    generateStars();
    initNavbar();
    initMobileNav();
    initReveal();
    initSmoothScroll();

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
