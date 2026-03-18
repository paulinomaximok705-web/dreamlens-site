/* ====================================================
   DreamLens — diary.js
   梦境日记页完整逻辑
   功能：列表展示、搜索过滤、手动记录、详情查看、
         编辑删除、情绪趋势图、导出
==================================================== */

/* ──────────────────────────────────────────────────
   常量
────────────────────────────────────────────────── */
const STORAGE_KEY  = 'dreamlens_diary';
const PAGE_SIZE    = 9;

const THEME_LABELS = {
    water:  '🌊 水域梦境', chase: '🏃 追逐梦境', fall:  '🍂 坠落蜕变',
    fly:    '🕊️ 飞翔自由', forest:'🌳 森林迷途', house: '🏠 家与空间',
    light:  '✨ 光与洞见', death: '💫 终结新生', general:'🌙 其他梦境'
};

const EMOTION_COLORS = {
    安宁:'#8b5cf6', 焦虑:'#f59e0b', 兴奋:'#06b6d4',
    悲伤:'#3b82f6', 困惑:'#a78bfa', 恐惧:'#ef4444',
    释然:'#10b981', 疲惫:'#6b7280'
};

const EMOTION_EMOJIS = {
    安宁:'😌', 焦虑:'😰', 兴奋:'🤩', 悲伤:'😢',
    困惑:'😵', 恐惧:'😱', 释然:'🥹', 疲惫:'😫'
};

/* ──────────────────────────────────────────────────
   状态
────────────────────────────────────────────────── */
let allDreams        = [];   // 全部日记条目
let filteredDreams   = [];   // 筛选后
let currentPage      = 1;
let currentDetailId  = null;
let editingId        = null;
let writeEmotion     = '';
let chartInstance    = null;
let chartVisible     = true;
let searchDebounce   = null;

/* ──────────────────────────────────────────────────
   LocalStorage 读写
────────────────────────────────────────────────── */
function loadDreams() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

function saveDreams(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { showToast('⚠️ 存储空间已满，无法保存'); }
}

/* ──────────────────────────────────────────────────
   初始化页面
────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initStars();
    initMist();
    setDefaultDate();
    initSearch();

    allDreams = loadDreams();
    filteredDreams = [...allDreams];
    renderStats();
    renderList();
    renderChart();
});

/* ── 星空 & 雾气（与 analyze-init.js 逻辑一致） ── */
function initStars() {
    const c = document.getElementById('dsStars');
    if (!c) return;
    const n = window.innerWidth < 768 ? 60 : 120;
    const f = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
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
    [{ color:'rgba(124,58,237,0.1)', size:400, x:'15%', y:'20%', dur:'22s' },
     { color:'rgba(6,182,212,0.07)', size:350, x:'80%', y:'60%', dur:'28s' }]
    .forEach((o, i) => {
        const el = document.createElement('div');
        el.className = 'ds-mist-orb';
        el.style.cssText = [
            `width:${o.size}px`, `height:${o.size}px`,
            `left:${o.x}`, `top:${o.y}`,
            `transform:translate(-50%,-50%)`,
            `background:${o.color}`,
            `animation-duration:${o.dur}`,
            `animation-delay:${i*-6}s`
        ].join(';');
        c.appendChild(el);
    });
}

function initNav() {
    const nav    = document.getElementById('dsNav');
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (!nav) return;
    nav.classList.add('ds-nav--scrolled');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('ds-nav--open'));
    }
}

/* ── 设置默认日期为今天 ── */
function setDefaultDate() {
    const d = document.getElementById('writeDate');
    if (d) d.value = new Date().toISOString().split('T')[0];
}

/* ── 搜索防抖 ── */
function initSearch() {
    const input  = document.getElementById('dySearchInput');
    const clearB = document.getElementById('dySearchClear');
    if (!input) return;

    input.addEventListener('input', () => {
        clearTimeout(searchDebounce);
        clearB.style.display = input.value ? 'block' : 'none';
        searchDebounce = setTimeout(() => {
            currentPage = 1;
            applyFilters();
        }, 280);
    });
}

/* ──────────────────────────────────────────────────
   统计数字渲染
────────────────────────────────────────────────── */
function renderStats() {
    const list = allDreams;

    // 总数
    setStatNum('statTotal', list.length);

    // 记录天数（去重日期）
    const days = new Set(list.map(d => d.date)).size;
    setStatNum('statDays', days);

    // 最常见情绪
    if (list.length > 0) {
        const emoCount = {};
        list.forEach(d => { if (d.emotion) emoCount[d.emotion] = (emoCount[d.emotion] || 0) + 1; });
        const topEmo = Object.entries(emoCount).sort((a,b) => b[1]-a[1])[0];
        document.getElementById('statEmotion').textContent =
            topEmo ? `${EMOTION_EMOJIS[topEmo[0]] || ''}${topEmo[0]}` : '—';
    }

    // 最常见主题
    if (list.length > 0) {
        const themeCount = {};
        list.forEach(d => { if (d.theme) themeCount[d.theme] = (themeCount[d.theme] || 0) + 1; });
        const topTheme = Object.entries(themeCount).sort((a,b) => b[1]-a[1])[0];
        if (topTheme) {
            const label = THEME_LABELS[topTheme[0]] || topTheme[0];
            document.getElementById('statTheme').textContent = label.slice(0,6);
        }
    }
}

function setStatNum(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    // 数字滚动动画
    const target = typeof val === 'number' ? val : 0;
    if (typeof val !== 'number') { el.textContent = val; return; }
    let cur = 0;
    const step = Math.max(1, Math.floor(target / 20));
    const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur;
        if (cur >= target) clearInterval(timer);
    }, 40);
}

/* ──────────────────────────────────────────────────
   筛选 & 排序
────────────────────────────────────────────────── */
function applyFilters() {
    const query  = (document.getElementById('dySearchInput')?.value || '').trim().toLowerCase();
    const emo    = document.getElementById('dyFilterEmotion')?.value || '';
    const theme  = document.getElementById('dyFilterTheme')?.value  || '';
    const sort   = document.getElementById('dySort')?.value || 'newest';

    filteredDreams = allDreams.filter(d => {
        if (emo   && d.emotion !== emo)   return false;
        if (theme && d.theme   !== theme) return false;
        if (query) {
            const hay = `${d.title||''} ${d.text||''} ${d.emotion||''} ${d.theme||''}`.toLowerCase();
            if (!hay.includes(query)) return false;
        }
        return true;
    });

    filteredDreams.sort((a, b) =>
        sort === 'oldest' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    );

    currentPage = 1;
    renderList();
}

function resetFilters() {
    document.getElementById('dySearchInput').value  = '';
    document.getElementById('dyFilterEmotion').value = '';
    document.getElementById('dyFilterTheme').value   = '';
    document.getElementById('dySort').value           = 'newest';
    document.getElementById('dySearchClear').style.display = 'none';
    filteredDreams = [...allDreams];
    currentPage = 1;
    renderList();
}

function clearSearch() {
    document.getElementById('dySearchInput').value = '';
    document.getElementById('dySearchClear').style.display = 'none';
    currentPage = 1;
    applyFilters();
}

/* ──────────────────────────────────────────────────
   列表渲染
────────────────────────────────────────────────── */
function renderList() {
    const emptyEl    = document.getElementById('dyEmpty');
    const noResultEl = document.getElementById('dyNoResult');
    const cardsEl    = document.getElementById('dyCards');
    const pageEl     = document.getElementById('dyPagination');

    // 无数据
    if (allDreams.length === 0) {
        emptyEl.style.display    = 'flex';
        noResultEl.style.display = 'none';
        cardsEl.innerHTML        = '';
        pageEl.style.display     = 'none';
        return;
    }
    emptyEl.style.display = 'none';

    // 无搜索结果
    if (filteredDreams.length === 0) {
        noResultEl.style.display = 'flex';
        cardsEl.innerHTML        = '';
        pageEl.style.display     = 'none';
        return;
    }
    noResultEl.style.display = 'none';

    // 分页切片
    const totalPages = Math.ceil(filteredDreams.length / PAGE_SIZE);
    const start      = (currentPage - 1) * PAGE_SIZE;
    const slice      = filteredDreams.slice(start, start + PAGE_SIZE);

    // 渲染卡片
    cardsEl.innerHTML = slice.map((d, idx) => buildCard(d, idx)).join('');

    // 分页控件
    if (totalPages > 1) {
        pageEl.style.display = 'flex';
        document.getElementById('dyPageInfo').textContent = `${currentPage} / ${totalPages}`;
        document.getElementById('dyPrevBtn').disabled = currentPage <= 1;
        document.getElementById('dyNextBtn').disabled = currentPage >= totalPages;
    } else {
        pageEl.style.display = 'none';
    }
}

/* ── 构建单张卡片 HTML ── */
function buildCard(d, idx) {
    const emojiMap = EMOTION_EMOJIS;
    const emoLabel = d.emotion ? `${emojiMap[d.emotion] || ''}${d.emotion}` : '未记录情绪';
    const snippet  = (d.text || '').slice(0, 120).replace(/\n/g, ' ');
    const themeLabel = THEME_LABELS[d.theme] || '';
    const hasAI    = !!(d.analysis && (d.analysis.summary || d.analysis.psychology));
    const delay    = `animation-delay:${idx * 0.05}s`;

    return `
    <div class="dy-card" style="${delay}" onclick="openDetail('${d.id}')">
      ${hasAI ? '<span class="dy-card__ai-badge">✨ AI解析</span>' : ''}
      <div class="dy-card__head">
        <div class="dy-card__title">${escHtml(d.title || '无标题梦境')}</div>
        <div class="dy-card__date">${d.date || ''}</div>
      </div>
      ${d.emotion ? `<div class="dy-card__emotion">${emoLabel}</div>` : ''}
      <div class="dy-card__snippet">${escHtml(snippet)}${snippet.length < (d.text||'').length ? '…' : ''}</div>
      <div class="dy-card__footer">
        <div class="dy-card__tags">
          ${themeLabel ? `<span class="dy-card__tag">${themeLabel}</span>` : ''}
        </div>
        <div class="dy-card__actions" onclick="event.stopPropagation()">
          <button class="dy-card__btn" title="编辑" onclick="editEntry('${d.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="dy-card__btn dy-card__btn--del" title="删除" onclick="deleteEntry('${d.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
}

function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ──────────────────────────────────────────────────
   分页
────────────────────────────────────────────────── */
function changePage(delta) {
    const total = Math.ceil(filteredDreams.length / PAGE_SIZE);
    currentPage = Math.max(1, Math.min(total, currentPage + delta));
    renderList();
    document.querySelector('.dy-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ──────────────────────────────────────────────────
   情绪趋势图
────────────────────────────────────────────────── */
function renderChart() {
    const wrap = document.getElementById('dyChartWrap');
    if (!wrap) return;

    if (allDreams.length < 2) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    const recent   = [...allDreams].sort((a,b) => a.timestamp - b.timestamp).slice(-20);
    const labels   = recent.map(d => d.date ? d.date.slice(5) : '');
    const emoKeys  = [...new Set(recent.map(d => d.emotion).filter(Boolean))].slice(0, 4);

    const ctx = document.getElementById('dyEmotionChart');
    if (!ctx) return;

    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    // 如果情绪数据不足，改为显示月度梦境数量折线图
    if (emoKeys.length === 0) {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '梦境记录',
                    data: recent.map(() => 1),
                    backgroundColor: 'rgba(167,139,250,0.5)',
                    borderColor: 'rgba(167,139,250,0.8)',
                    borderWidth: 1, borderRadius: 4
                }]
            },
            options: buildChartOptions('梦境记录数')
        });
        return;
    }

    // 按情绪分组的数据集
    const datasets = emoKeys.map(emo => {
        const color = EMOTION_COLORS[emo] || '#a78bfa';
        return {
            label: `${EMOTION_EMOJIS[emo] || ''}${emo}`,
            data: recent.map(d => d.emotion === emo ? 1 : null),
            borderColor: color,
            backgroundColor: color + '33',
            pointBackgroundColor: color,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: false,
            spanGaps: false
        };
    });

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: buildChartOptions('情绪出现')
    });
}

function buildChartOptions(yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                labels: { color: '#8b83aa', font: { size: 11 }, boxWidth: 12, padding: 16 }
            },
            tooltip: {
                backgroundColor: 'rgba(18,14,42,0.95)',
                titleColor: '#f4f0ff',
                bodyColor: '#8b83aa',
                borderColor: 'rgba(167,139,250,0.3)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: { color: '#524d6e', font: { size: 10 }, maxRotation: 0 },
                grid:  { color: 'rgba(255,255,255,0.04)' }
            },
            y: {
                display: false,
                ticks: { color: '#524d6e', stepSize: 1 },
                grid:  { color: 'rgba(255,255,255,0.04)' }
            }
        }
    };
}

function toggleChart() {
    chartVisible = !chartVisible;
    const body = document.getElementById('dyChartBody');
    const icon = document.querySelector('#dyChartToggleBtn i');
    if (body) body.classList.toggle('collapsed', !chartVisible);
    if (icon) icon.className = chartVisible ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
}

/* ──────────────────────────────────────────────────
   手动记录弹窗
────────────────────────────────────────────────── */
function openWriteModal(prefill) {
    editingId    = null;
    writeEmotion = '';

    // 重置表单
    setValue('writeTitle',   '');
    setValue('writeContent', '');
    setDefaultDate();
    document.querySelectorAll('.dy-emo-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('writeCharCount').textContent = '0';

    // 如果有预填（来自编辑）
    if (prefill) {
        editingId = prefill.id;
        setValue('writeTitle',   prefill.title || '');
        setValue('writeContent', prefill.text  || '');
        setValue('writeDate',    prefill.isoDate || new Date().toISOString().split('T')[0]);
        if (prefill.emotion) {
            writeEmotion = prefill.emotion;
            document.querySelectorAll('.dy-emo-btn').forEach(b => {
                if (b.dataset.emotion === prefill.emotion) b.classList.add('active');
            });
        }
        document.getElementById('writeCharCount').textContent = (prefill.text || '').length;
    }

    // 字数监听
    const ta = document.getElementById('writeContent');
    if (ta) {
        ta.oninput = () => {
            document.getElementById('writeCharCount').textContent = ta.value.length;
        };
    }

    document.getElementById('writeModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('writeContent')?.focus(), 200);
}

function closeWriteModal(e) {
    if (e && e.type === 'click' && e.target !== document.getElementById('writeModal')) return;
    document.getElementById('writeModal').style.display = 'none';
    document.body.style.overflow = '';
}

function pickEmotion(btn) {
    document.querySelectorAll('.dy-emo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    writeEmotion = btn.dataset.emotion;
}

function saveManualEntry() {
    const content = (getValue('writeContent') || '').trim();
    if (!content) { showToast('请填写梦境内容'); return; }

    const title   = (getValue('writeTitle') || '').trim();
    const dateVal = getValue('writeDate') || new Date().toISOString().split('T')[0];
    const dateObj = new Date(dateVal);
    const dateStr = dateObj.toLocaleDateString('zh-CN');
    const ts      = editingId
        ? (allDreams.find(d => d.id === editingId)?.timestamp || Date.now())
        : Date.now();

    // 检测主题
    const theme = detectThemeSimple(content);

    const entry = {
        id:       editingId || String(Date.now()),
        title:    title || autoTitle(content, theme),
        text:     content,
        emotion:  writeEmotion,
        date:     dateStr,
        isoDate:  dateVal,
        theme,
        timestamp: ts,
        manual:   true
    };

    if (editingId) {
        const idx = allDreams.findIndex(d => d.id === editingId);
        if (idx !== -1) allDreams[idx] = entry;
    } else {
        allDreams.unshift(entry);
    }

    saveDreams(allDreams);
    filteredDreams = [...allDreams];
    renderStats();
    renderList();
    renderChart();
    closeWriteModal();
    showToast(editingId ? '✅ 日记已更新' : '✨ 梦境已记录到日记！');
    editingId = null;
}

/* ──────────────────────────────────────────────────
   详情弹窗
────────────────────────────────────────────────── */
function openDetail(id) {
    const d = allDreams.find(x => x.id === String(id));
    if (!d) return;

    currentDetailId = String(id);

    document.getElementById('detailTitle').textContent =
        d.title || '无标题梦境';
    document.getElementById('detailMeta').innerHTML =
        `<span>${d.date || ''}</span>
         ${d.emotion ? `&nbsp;·&nbsp;${EMOTION_EMOJIS[d.emotion]||''}${d.emotion}` : ''}
         ${THEME_LABELS[d.theme] ? `&nbsp;·&nbsp;${THEME_LABELS[d.theme]}` : ''}`;

    const body = document.getElementById('detailBody');
    body.innerHTML = buildDetailBody(d);

    document.getElementById('detailModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // 情绪条动画延迟触发
    setTimeout(() => {
        body.querySelectorAll('.dy-detail-emo-fill').forEach(el => {
            el.style.width = el.dataset.w || '0%';
        });
    }, 200);
}

function buildDetailBody(d) {
    let html = '';

    /* 原文 */
    html += `
    <div class="dy-detail-section">
      <div class="dy-detail-section__head"><i class="fas fa-scroll"></i> 梦境原文</div>
      <div class="dy-detail-content">${escHtml(d.text || '（无内容）')}</div>
    </div>`;

    /* AI 解析区 */
    if (d.analysis) {
        const a = d.analysis;

        /* 概要 */
        if (a.summary) {
            html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-star"></i> AI 解析摘要</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__title"><i class="fas fa-sparkles"></i> 解析结论</div>
            <div class="dy-detail-ai__text">${escHtml(a.summary)}</div>
          </div>
        </div>`;
        }

        /* 情绪能量 */
        if (a.emotions && a.emotions.length) {
            const barsHtml = a.emotions.map(e => `
          <div class="dy-detail-emo-bar">
            <div class="dy-detail-emo-row">
              <span>${e.label}</span><span>${e.pct}%</span>
            </div>
            <div class="dy-detail-emo-track">
              <div class="dy-detail-emo-fill" data-w="${e.pct}%"
                   style="width:0%;background:${e.color}"></div>
            </div>
          </div>`).join('');
            html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-heart-pulse"></i> 情绪能量分析</div>
          <div class="dy-detail-ai">${barsHtml}</div>
        </div>`;
        }

        /* 心理学解读 */
        if (a.psychology) {
            html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-brain"></i> 心理学深度解读</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text">
              ${a.psychology.split('\n\n').map(p => `<p>${escHtml(p)}</p>`).join('')}
            </div>
          </div>
        </div>`;
        }

        /* 潜意识信息 */
        if (a.unconscious) {
            html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-lightbulb"></i> 潜意识传达</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text">
              ${a.unconscious.split('\n\n').map(p => `<p>${escHtml(p)}</p>`).join('')}
            </div>
          </div>
        </div>`;
        }

        /* 行动建议 */
        if (a.advice) {
            html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-compass"></i> 行动建议</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text">
              ${a.advice.split('\n\n').map(p => `<p>${escHtml(p)}</p>`).join('')}
            </div>
          </div>
        </div>`;
        }

    } else {
        /* 无AI解析时引导 */
        html += `
    <div class="dy-detail-section">
      <div style="text-align:center;padding:28px 0;color:var(--ds-t4)">
        <div style="font-size:2rem;margin-bottom:10px">🔮</div>
        <p style="font-size:0.875rem;margin-bottom:16px">这条梦境还没有 AI 解析</p>
        <button class="ds-btn ds-btn-primary ds-btn-sm" onclick="reanalyze('${d.id}')">
          <i class="fas fa-magic"></i> 立即解析
        </button>
      </div>
    </div>`;
    }

    return html;
}

function closeDetailModal(e) {
    if (e && e.type === 'click' && e.target !== document.getElementById('detailModal')) return;
    document.getElementById('detailModal').style.display = 'none';
    document.body.style.overflow = '';
    currentDetailId = null;
}

/* ──────────────────────────────────────────────────
   编辑 / 删除 / 重新解析
────────────────────────────────────────────────── */
function editEntry(id) {
    const d = allDreams.find(x => x.id === String(id));
    if (!d) return;
    closeDetailModal();
    openWriteModal(d);
}

function deleteEntry(id) {
    const idx = allDreams.findIndex(x => x.id === String(id));
    if (idx === -1) return;

    if (!confirm(`确定删除这条梦境记录吗？`)) return;

    allDreams.splice(idx, 1);
    saveDreams(allDreams);
    filteredDreams = filteredDreams.filter(x => x.id !== String(id));
    renderStats();
    renderList();
    renderChart();
    closeDetailModal();
    showToast('🗑️ 已删除该梦境记录');
}

function reanalyze(id) {
    const d = allDreams.find(x => x.id === String(id));
    if (!d || !d.text) { showToast('无法获取梦境内容'); return; }

    // 将内容带到解析页
    sessionStorage.setItem('dreamlens_reanalyze', d.text);
    window.location.href = 'analyze.html#reanalyze';
}

/* ──────────────────────────────────────────────────
   清空全部
────────────────────────────────────────────────── */
function confirmClearAll() {
    if (allDreams.length === 0) { showToast('日记已经是空的'); return; }
    document.getElementById('clearModal').style.display = 'flex';
}

function clearAllDreams() {
    allDreams      = [];
    filteredDreams = [];
    saveDreams([]);
    renderStats();
    renderList();
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    document.getElementById('dyChartWrap').style.display = 'none';
    document.getElementById('clearModal').style.display  = 'none';
    showToast('🗑️ 已清空所有梦境日记');
}

/* ──────────────────────────────────────────────────
   导出日记（TXT 格式）
────────────────────────────────────────────────── */
function exportDiary() {
    if (allDreams.length === 0) { showToast('暂无日记可导出'); return; }

    const lines = [
        'DreamLens 梦境日记导出',
        `导出时间：${new Date().toLocaleString('zh-CN')}`,
        `共 ${allDreams.length} 条记录`,
        '═'.repeat(50), ''
    ];

    [...allDreams].sort((a,b) => a.timestamp - b.timestamp).forEach((d, i) => {
        lines.push(`【${i+1}】${d.title || '无标题'}`);
        lines.push(`日期：${d.date || '未知'}`);
        if (d.emotion) lines.push(`情绪：${d.emotion}`);
        if (THEME_LABELS[d.theme]) lines.push(`主题：${THEME_LABELS[d.theme]}`);
        lines.push('');
        lines.push('梦境内容：');
        lines.push(d.text || '（无内容）');
        if (d.analysis?.summary) {
            lines.push('');
            lines.push('AI 解析摘要：');
            lines.push(d.analysis.summary);
        }
        lines.push('─'.repeat(40));
        lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `DreamLens日记_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 日记已导出为 TXT 文件');
}

/* ──────────────────────────────────────────────────
   工具函数
────────────────────────────────────────────────── */
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

/* 简单主题检测（与 analyze.js 同步） */
function detectThemeSimple(text) {
    const rules = [
        { theme:'water',  kws:['海','水','鱼','游','深','溪','河','湖'] },
        { theme:'chase',  kws:['追','被追','跑','逃','腿','危险'] },
        { theme:'fall',   kws:['坠落','掉落','落下','坠','落地'] },
        { theme:'fly',    kws:['飞','飞翔','飞起','腾空','悬浮'] },
        { theme:'forest', kws:['森林','树林','树木','丛林','树'] },
        { theme:'house',  kws:['房子','家','房间','屋','宫殿','楼'] },
        { theme:'death',  kws:['死','死亡','消失','告别'] },
        { theme:'light',  kws:['光','光芒','亮','星','星空'] }
    ];
    let best = { theme:'general', score:0 };
    for (const r of rules) {
        const s = r.kws.reduce((n, kw) => n + (text.includes(kw) ? 1 : 0), 0);
        if (s > best.score) best = { theme: r.theme, score: s };
    }
    return best.theme;
}

/* 自动生成标题 */
function autoTitle(text, theme) {
    const themeNames = {
        water:'水的梦境', chase:'追逐的梦', fall:'坠落之梦', fly:'飞翔的梦',
        forest:'森林之梦', house:'家的梦境', death:'告别之梦', light:'光明之梦', general:'梦境记录'
    };
    return themeNames[theme] || '梦境记录';
}

/* ──────────────────────────────────────────────────
   暴露全局（被 HTML 内联 onclick 调用）
────────────────────────────────────────────────── */
window.openWriteModal    = openWriteModal;
window.closeWriteModal   = closeWriteModal;
window.pickEmotion       = pickEmotion;
window.saveManualEntry   = saveManualEntry;
window.openDetail        = openDetail;
window.closeDetailModal  = closeDetailModal;
window.currentDetailId   = currentDetailId;
window.editEntry         = editEntry;
window.deleteEntry       = deleteEntry;
window.reanalyze         = reanalyze;
window.applyFilters      = applyFilters;
window.resetFilters      = resetFilters;
window.clearSearch       = clearSearch;
window.changePage        = changePage;
window.toggleChart       = toggleChart;
window.exportDiary       = exportDiary;
window.confirmClearAll   = confirmClearAll;
window.clearAllDreams    = clearAllDreams;
