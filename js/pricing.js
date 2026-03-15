/* ====================================================
   DreamLens - pricing.js  套餐定价页面逻辑
==================================================== */

let isYearly = false;

// 月付/年付切换
function toggleBilling() {
    isYearly = !isYearly;
    const toggle = document.getElementById('billingToggle');
    toggle.classList.toggle('active', isYearly);

    // 更新价格显示
    document.querySelectorAll('.price-monthly').forEach(el => {
        const monthly = parseInt(el.dataset.monthly);
        const yearly = parseInt(el.dataset.yearly);
        if (isYearly) {
            el.textContent = `¥${yearly}`;
        } else {
            el.textContent = `¥${monthly}`;
        }
    });

    // 显示/隐藏年付说明
    document.querySelectorAll('.price-yearly-note').forEach(el => {
        el.style.display = isYearly ? 'block' : 'none';
    });

    showToast(isYearly ? '✨ 已切换为年付，节省30%！' : '已切换为月付');
}

// 套餐数据
const PLAN_DATA = {
    basic: {
        emoji: '🌙',
        name: '基础版',
        desc: '每月15次深度解析，含梦境日记与情绪追踪',
        monthlyPrice: 29,
        yearlyPrice: 240,
        features: ['每月15次梦境解析', '深度AI文字分析报告', '多维象征解读', '荣格原型识别', '梦境日记功能', '情绪趋势图表'],
        btnClass: 'basic-btn',
        btnStyle: ''
    },
    pro: {
        emoji: '⭐',
        name: '进阶版',
        desc: '每月50次解析，含梦境艺术生成，最受欢迎',
        monthlyPrice: 79,
        yearlyPrice: 660,
        features: ['每月50次梦境解析', '专业深度分析报告', '全维度象征&原型解读', '东西方融合解析', '梦境日记+模式追踪', '梦境艺术作品生成🎨', '情绪健康趋势分析'],
        btnClass: 'pro-btn',
        btnStyle: ''
    },
    premium: {
        emoji: '👑',
        name: '高级版',
        desc: '无限解析、个性化行动建议、高清艺术画作',
        monthlyPrice: 159,
        yearlyPrice: 1332,
        features: ['无限次梦境解析', '专业级深度报告（PDF导出）', '全维度多学派解析', '梦境模式深度分析（月报）', '高清梦境艺术画作（可下载）', '个性化行动建议✨', '情绪健康预警系统', '优先客服&专属顾问'],
        btnClass: 'premium-btn',
        btnStyle: 'background: linear-gradient(135deg, #f59e0b, #ef4444);'
    }
};

// 选择套餐 - 打开弹窗
function choosePlan(planKey) {
    const plan = PLAN_DATA[planKey];
    if (!plan) return;

    document.getElementById('modalEmoji').textContent = plan.emoji;
    document.getElementById('modalTitle').textContent = `升级 ${plan.name}`;
    document.getElementById('modalDesc').textContent = plan.desc;

    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const period = isYearly ? '/年' : '/月';
    document.getElementById('modalPrice').textContent = `¥${price}${period}`;

    const featuresHtml = `<ul style="list-style:none;">${
        plan.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')
    }</ul>`;
    document.getElementById('modalFeatureList').innerHTML = featuresHtml;

    const payBtn = document.getElementById('modalPayBtn');
    payBtn.className = `plan-btn ${plan.btnClass}`;
    payBtn.style.cssText = `width: 100%; margin-bottom: 12px; ${plan.btnStyle}`;
    payBtn.onclick = () => confirmPayment(planKey);

    document.getElementById('modalOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 确认支付（演示）
function confirmPayment(planKey) {
    const plan = PLAN_DATA[planKey];
    closeModal();
    // 模拟支付流程
    showPaymentDemo(plan);
}

function showPaymentDemo(plan) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(12px);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
    `;

    overlay.innerHTML = `
        <div style="
            background: #11101e;
            border: 1px solid rgba(167,139,250,0.3);
            border-radius: 24px;
            padding: 40px;
            max-width: 360px;
            width: 100%;
            text-align: center;
        ">
            <div style="font-size: 3rem; margin-bottom: 16px;">💳</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.2rem; margin-bottom: 8px; color: var(--text-primary);">
                订阅 ${plan.name}
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 24px;">
                这是演示版本，实际产品将接入支付宝/微信支付
            </p>
            <div style="
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.07);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <span>${plan.name}</span>
                    <span>${isYearly ? '年付' : '月付'}</span>
                </div>
                <div style="font-size: 1.8rem; font-weight: 700; background: var(--gradient-dream); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    ¥${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </div>
            </div>
            <button onclick="this.closest('[style]').remove(); showToast('🎉 模拟订阅成功！欢迎使用 ${plan.name}')" style="
                width: 100%;
                padding: 14px;
                background: var(--gradient-purple);
                color: white;
                border: none;
                border-radius: 50px;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 12px;
                font-family: var(--font-sans);
            ">
                <i class="fas fa-check"></i> 确认订阅（演示）
            </button>
            <button onclick="this.closest('[style]').remove()" style="
                background: none; border: none;
                color: var(--text-muted);
                cursor: pointer;
                font-size: 0.82rem;
                font-family: var(--font-sans);
            ">取消</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

// 关闭弹窗
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

// FAQ 展开/收起
function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    // 关闭所有
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    // 如果本来是关闭的，则打开
    if (!isOpen) item.classList.add('open');
}

// 暴露全局
window.toggleBilling = toggleBilling;
window.choosePlan = choosePlan;
window.closeModal = closeModal;
window.toggleFaq = toggleFaq;
