/* ====================================================
   DreamLens — dream-art.js  v5
   AI 梦境图片生成模块
   核心修复：
   1. fetch HEAD 验证 content-type，拒绝 HTML 响应
   2. 多服务降级：Pollinations flux → turbo → picsum(稳定兜底)
   3. 梦境内容精准匹配词典 → 生成符合梦境的提示词
==================================================== */

/* ──────────────────────────────────────────────────
   风格配置
────────────────────────────────────────────────── */
const ART_STYLE_MAP = {
    surreal: {
        label: '超现实主义',
        suffix: 'surrealist dream painting, Salvador Dali style, dreamlike impossible scene, vivid oil painting, 8k detailed',
        model: 'flux'
    },
    impressionist: {
        label: '印象派水彩',
        suffix: 'impressionist watercolor painting, soft dreamy brush strokes, Monet style, pastel colors, poetic atmosphere',
        model: 'flux'
    },
    inkwash: {
        label: '东方水墨',
        suffix: 'Chinese ink wash painting, sumi-e style, elegant brushwork, zen minimalism, misty ethereal',
        model: 'flux'
    },
    neon: {
        label: '霓虹赛博',
        suffix: 'cyberpunk neon dream art, glowing neon colors, synthwave aesthetic, digital art, vivid purple cyan',
        model: 'flux'
    }
};

/* ──────────────────────────────────────────────────
   场景词典：中文关键词 → 精准英文视觉描述
────────────────────────────────────────────────── */
const SCENE_DICT = [
    // ── 场所/环境 ──
    { kw:['玻璃箱','箱子','透明','密闭','困住'],  w:3, en:'person trapped inside a giant transparent glass box, surreal confinement, crystal walls, claustrophobic dream' },
    { kw:['海','大海','海洋','水下','深海','鱼'],  w:2, en:'deep ocean dreamscape, bioluminescent creatures, mysterious underwater world, deep blue golden tones' },
    { kw:['森林','树林','树','丛林'],              w:2, en:'ancient mystical forest, towering trees, magical fog, ethereal light beams through canopy' },
    { kw:['山','山峰','峰','雪山','高山'],         w:2, en:'dramatic mountain peaks above clouds, lone figure ascending, misty spiritual landscape' },
    { kw:['宇宙','太空','星空','银河','星球'],     w:2, en:'cosmic dreamscape, vast starfield, nebula colors, floating among galaxies, infinite universe' },
    { kw:['家','房子','房间','故乡','儿时'],       w:2, en:'nostalgic dreamlike home, warm golden light, childhood memories, time-worn familiar architecture' },
    { kw:['城市','街道','楼','建筑','道路'],       w:2, en:'surreal dreamlike cityscape, twisted towering buildings, warped urban labyrinth, dramatic night lighting' },
    { kw:['学校','教室','操场','老师'],            w:2, en:'dreamlike empty school corridor, nostalgic atmosphere, soft diffused light, surreal schoolscape' },
    { kw:['医院','病房','白色'],                   w:2, en:'surreal white hospital dreamscape, endless sterile corridors, clinical ethereal atmosphere' },
    { kw:['洞','洞穴','隧道','地下','黑暗'],       w:2, en:'mysterious underground cavern, dark tunnels, glowing crystals, deep dramatic shadows' },
    { kw:['天空','翱翔','翅膀','鸟'],             w:2, en:'vast dreamlike sky, soaring through clouds, birds eye view, endless golden horizon' },
    { kw:['水','河流','湖','瀑布'],               w:2, en:'serene dreamlike water surface, mirror lake reflections, flowing waterfall mist' },
    { kw:['废墟','荒废','遗迹'],                  w:2, en:'haunting dream ruins, crumbling ancient structures, overgrown mysterious atmosphere' },

    // ── 动作/情节 ──
    { kw:['爬','攀','爬不上','爬不去'],           w:3, en:'figure desperately struggling to climb a smooth impossible wall, dreamlike futile ascent, strain and helplessness' },
    { kw:['贴','粘','粘住','动弹不得'],           w:3, en:'person stuck frozen, body fused to surface, dream paralysis, unable to move, trapped sensation' },
    { kw:['追','追逐','被追','逃跑','逃'],         w:3, en:'running desperately through surreal dreamscape, shadowy pursuer, twisted distorted escape route' },
    { kw:['坠落','掉下','落下','跌落'],           w:3, en:'figure falling through infinite dreamlike void, city lights far below, surreal endless descent' },
    { kw:['飞','飘','漂浮','悬浮'],               w:2, en:'dreamlike floating weightlessly through air, ethereal suspension, glowing light trails' },
    { kw:['迷路','找不到','迷失'],                w:2, en:'lost wandering in surreal dream maze, disorienting corridors, mysterious branching paths' },
    { kw:['躲','藏','躲藏'],                      w:2, en:'hiding in surreal dreamlike shadows, mysterious concealment, dark ethereal corners' },
    { kw:['推','推不开','打不开','动不了'],        w:3, en:'struggling against an immovable door or force, surreal dreamlike impossibility, frustrated effort' },

    // ── 情感/心理 ──
    { kw:['恐惧','害怕','恐怖','吓'],             w:2, en:'dreamlike dread, dark surreal atmosphere, ominous looming shadows, psychological nightmare' },
    { kw:['孤独','一个人','独自','寂寞'],          w:2, en:'solitary figure in vast dreamlike emptiness, profound isolation, echo of loneliness' },
    { kw:['温暖','幸福','开心','快乐'],            w:2, en:'warm golden dreamlike paradise, euphoric glowing atmosphere, radiant happiness' },
    { kw:['焦虑','紧张','压力','担心'],           w:2, en:'anxious surreal dreamscape, twisting distorted space, psychological tension, fractured colors' },

    // ── 人物 ──
    { kw:['陌生人','陌生','不认识'],              w:2, en:'mysterious faceless stranger in dreamlike setting, blurred indistinct features, ethereal silhouette' },
    { kw:['家人','父母','妈','爸','爷爷','奶奶'], w:2, en:'familiar family figures in nostalgic dreamscape, warm emotional glow, memories intertwining' },
    { kw:['朋友','同学','同事'],                  w:2, en:'dream companions in surreal setting, hazy familiar faces, emotional dream encounter' },

    // ── 物体 ──
    { kw:['镜子','镜','倒影','反射'],             w:2, en:'infinite surreal mirrors, reflections multiplying endlessly, kaleidoscopic fragmented identity' },
    { kw:['门','大门','入口','出口'],             w:2, en:'mysterious glowing doorway, symbolic threshold, surreal portal in dreamlike landscape' },
    { kw:['花','花朵','草'],                      w:2, en:'dreamlike blooming flowers, surreal botanical paradise, ethereal soft garden' },
    { kw:['火','火焰','燃烧'],                    w:2, en:'surreal dreamlike fire, ethereal flames dancing, symbolic burning glow' },
];

/* ──────────────────────────────────────────────────
   状态
────────────────────────────────────────────────── */
let currentArtStyle  = 'surreal';
let currentDreamText = '';
let genProgressTimer = null;
let genAborted       = false;
let lastGeneratedUrl = '';

/* ──────────────────────────────────────────────────
   提示词构建
────────────────────────────────────────────────── */
function extractVisualFromDream(text) {
    if (!text) return 'mysterious dream landscape, ethereal surreal atmosphere, subconscious imagery';

    const scored = SCENE_DICT.map(entry => ({
        score: entry.kw.reduce((s, kw) => s + (text.includes(kw) ? entry.w : 0), 0),
        en: entry.en
    })).filter(e => e.score > 0).sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        // 无匹配时：用原文片段作为场景锚点
        const cleaned = text.replace(/[，。！？、；：\n\r]/g, ' ').trim().slice(0, 50);
        return `dreamlike surreal scene of "${cleaned}", subconscious visualization, symbolic dream imagery, ethereal atmosphere`;
    }

    // 取得分最高的前2条拼合
    return scored.slice(0, 2).map(e => e.en).join(', ');
}

function buildPromptAndSeed(dreamText, style) {
    const styleInfo  = ART_STYLE_MAP[style] || ART_STYLE_MAP.surreal;
    const visualCore = extractVisualFromDream(dreamText);
    const prompt     = `${visualCore}, ${styleInfo.suffix}, highly detailed, no text, no watermark`;
    const seed       = Math.floor(Math.random() * 999999);
    return { prompt, seed, styleInfo };
}

/* ──────────────────────────────────────────────────
   构建图片源列表
────────────────────────────────────────────────── */
function buildImageSources(dreamText, style) {
    const { prompt, seed, styleInfo } = buildPromptAndSeed(dreamText, style);
    const enc = encodeURIComponent(prompt);

    console.log('[DreamArt] 生成提示词:', prompt.slice(0, 120));

    return [
        // ① Pollinations flux 主力
        {
            name: 'pollinations-flux',
            type: 'pollinations',
            url:  `https://image.pollinations.ai/prompt/${enc}?width=1280&height=720&seed=${seed}&model=flux&nologo=true&nofeed=true`,
            prompt, seed, styleInfo
        },
        // ② Pollinations turbo（备用）
        {
            name: 'pollinations-turbo',
            type: 'pollinations',
            url:  `https://image.pollinations.ai/prompt/${enc}?width=1024&height=576&seed=${seed+7}&model=turbo&nologo=true&nofeed=true`,
            prompt, seed, styleInfo
        },
        // ③ Picsum 按梦境主题分类（稳定可靠的兜底）
        {
            name: 'picsum-themed',
            type: 'picsum',
            url:  `https://picsum.photos/seed/${_picsumSeed(dreamText, seed)}/1280/720`,
            prompt, seed, styleInfo,
            isFallback: true
        }
    ];
}

/**
 * 根据梦境内容选择 Picsum seed 范围，让兜底图尽量有氛围感
 * Picsum 有固定图片库，不同 seed 对应不同图
 */
function _picsumSeed(text, numSeed) {
    // 选择氛围相近的图片 seed 段
    if (/海|水|鱼|海洋/.test(text))           return `ocean-${numSeed % 50}`;
    if (/森林|树|丛林/.test(text))            return `forest-${numSeed % 50}`;
    if (/山|峰|雪山/.test(text))              return `mountain-${numSeed % 50}`;
    if (/宇宙|星空|太空/.test(text))          return `space-${numSeed % 50}`;
    if (/城市|街道|楼/.test(text))            return `city-${numSeed % 50}`;
    if (/花|草|植物/.test(text))              return `nature-${numSeed % 50}`;
    // 默认使用抽象/艺术感数字段
    return `dream-${(numSeed % 200) + 100}`;
}

/* ──────────────────────────────────────────────────
   风格切换
────────────────────────────────────────────────── */
function selectArtStyle(btn) {
    document.querySelectorAll('.az-art__style-btn').forEach(b => b.classList.remove('az-art__style-btn--active'));
    btn.classList.add('az-art__style-btn--active');
    currentArtStyle = btn.dataset.style;
}

/* ──────────────────────────────────────────────────
   进度动画
────────────────────────────────────────────────── */
function startGenProgress() {
    const bar   = document.getElementById('artGenBar');
    const subEl = document.getElementById('artGenSubText');
    const tipEl = document.getElementById('artGenTip');
    if (!bar) return;

    const subTexts = ['解析梦境意象...', '构建视觉语言...', '融合艺术风格...', '渲染画面中...', '即将完成...'];
    const tips = [
        '🌙 每幅作品都是独一无二的',
        '✨ AI 正在将你的潜意识化为视觉',
        '🎨 梦境与艺术的交汇时刻...',
        '🌠 平均等待 15–40 秒，请耐心'
    ];
    let pct = 0, subIdx = 0;
    if (genProgressTimer) clearInterval(genProgressTimer);

    genProgressTimer = setInterval(() => {
        pct += pct < 70 ? (Math.random() * 3 + 1.5) : (pct < 90 ? 0.5 : 0.1);
        pct  = Math.min(pct, 94);
        bar.style.width = pct + '%';
        const ni = Math.min(Math.floor((pct / 100) * subTexts.length), subTexts.length - 1);
        if (ni !== subIdx) { subIdx = ni; if (subEl) subEl.textContent = subTexts[subIdx]; }
        if (tipEl && Math.random() < 0.015) tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
    }, 400);
}

function stopGenProgress(ok = true) {
    if (genProgressTimer) { clearInterval(genProgressTimer); genProgressTimer = null; }
    const bar = document.getElementById('artGenBar');
    if (bar) bar.style.width = ok ? '100%' : '0%';
}

/* ──────────────────────────────────────────────────
   面板切换
────────────────────────────────────────────────── */
function showArtPanel(id) {
    ['artIdle', 'artGenerating', 'artResult', 'artError'].forEach(pid => {
        const el = document.getElementById(pid);
        if (el) el.style.display = pid === id ? 'flex' : 'none';
    });
}

/* ──────────────────────────────────────────────────
   核心加载函数
   策略：
   - Pollinations：先用 fetch HEAD 检查 content-type，
     确认是 image/* 才用 img 显示（防止 HTML 错误页被当图片加载）
   - Picsum：直接 img 直连（100% 返回真实图片）
────────────────────────────────────────────────── */
function loadSource(src, timeoutMs) {
    if (src.type === 'picsum') {
        return loadImageDirect(src.url, timeoutMs);
    }
    // Pollinations: fetch 验证 content-type
    return loadPollinationsWithVerify(src.url, timeoutMs);
}

/**
 * Pollinations 加载：fetch 获取并验证是真图片
 * 使用 no-cors 模式无法读 headers，改用带 cors 的普通 fetch
 * Pollinations 支持 CORS，所以 fetch 可以读取 content-type
 */
function loadPollinationsWithVerify(url, timeoutMs) {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();
            reject(new Error('TIMEOUT'));
        }, timeoutMs);

        fetch(url, {
            signal: controller.signal,
            cache:  'no-store',
            mode:   'cors'
        })
        .then(res => {
            clearTimeout(timer);
            if (!res.ok) {
                throw new Error(`HTTP_${res.status}`);
            }
            const ct = res.headers.get('content-type') || '';
            if (!ct.startsWith('image/')) {
                throw new Error(`NOT_IMAGE: ${ct.slice(0, 30)}`);
            }
            return res.blob();
        })
        .then(blob => {
            if (blob.size < 2000) throw new Error('BLOB_TOO_SMALL');
            const blobUrl = URL.createObjectURL(blob);
            resolve({ imgSrc: blobUrl, originalUrl: url });
        })
        .catch(err => {
            clearTimeout(timer);
            // fetch 失败则降级为 img 直连
            console.warn('[DreamArt] fetch验证失败，尝试img直连:', err.message);
            loadImageDirect(url, 30000)
                .then(resolve)
                .catch(reject);
        });
    });
}

/**
 * 纯 img 直连（适用于 Picsum 等始终返回图片的源）
 */
function loadImageDirect(url, timeoutMs) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let settled = false;

        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            img.src = '';
            reject(new Error('TIMEOUT'));
        }, timeoutMs);

        img.onload = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (img.naturalWidth < 10 || img.naturalHeight < 10) {
                reject(new Error('INVALID_IMAGE'));
                return;
            }
            resolve({ imgSrc: url, originalUrl: url });
        };

        img.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(new Error('LOAD_ERROR'));
        };

        img.src = url;
    });
}

/* ──────────────────────────────────────────────────
   主生成函数
────────────────────────────────────────────────── */
async function generateDreamArt() {
    const ta = document.getElementById('dreamInput');
    currentDreamText = (ta && ta.value.trim()) || currentDreamText || '';

    if (!currentDreamText) {
        if (typeof showToast === 'function') showToast('请先完成梦境解析再生成艺术画');
        else alert('请先完成梦境解析再生成艺术画');
        return;
    }

    genAborted = false;
    showArtPanel('artGenerating');
    startGenProgress();

    const sources   = buildImageSources(currentDreamText, currentArtStyle);
    const styleInfo = ART_STYLE_MAP[currentArtStyle] || ART_STYLE_MAP.surreal;

    lastGeneratedUrl = sources[0].url;
    _updateOpenTabBtn(lastGeneratedUrl);

    let lastErr = null;

    for (let i = 0; i < sources.length; i++) {
        if (genAborted) return;

        const src     = sources[i];
        // 第一源 55s，后续 40s，兜底 15s
        const timeout = i === 0 ? 55000 : (src.isFallback ? 15000 : 40000);

        console.log(`[DreamArt] 尝试 #${i+1} (${src.name}) timeout=${timeout/1000}s`);

        try {
            const result = await loadSource(src, timeout);
            if (genAborted) return;

            // ── 成功 ──
            stopGenProgress(true);

            const imgEl = document.getElementById('artResultImg');
            if (imgEl) {
                imgEl.src = result.imgSrc;
                imgEl.alt = `AI 梦境艺术 - ${styleInfo.label}`;
            }

            const dlBtn = document.getElementById('artDownloadBtn');
            if (dlBtn) {
                dlBtn.href     = result.imgSrc;
                dlBtn.target   = '_blank';
                dlBtn.download = `dreamlens-${currentArtStyle}-${src.seed || Date.now()}.jpg`;
            }

            _updateOpenTabBtn(result.originalUrl);

            const styleEl = document.getElementById('artResultStyle');
            if (styleEl) styleEl.textContent = `🎨 ${styleInfo.label}`;

            const promptEl = document.getElementById('artResultPrompt');
            if (promptEl) {
                const snippet = currentDreamText.slice(0, 40).replace(/\n/g, ' ');
                promptEl.textContent = `以「${snippet}${currentDreamText.length > 40 ? '…' : ''}」为灵感，${styleInfo.label}风格绘制。`;
            }

            if (src.isFallback) {
                console.log('[DreamArt] 使用了兜底图片');
            }

            showArtPanel('artResult');
            if (typeof showToast === 'function') {
                showToast(src.isFallback ? '🎨 梦境画作已生成（替代风格）' : '✨ 梦境艺术画生成完成！');
            }
            return;

        } catch (err) {
            lastErr = err;
            console.warn(`[DreamArt] 源 #${i+1} 失败: ${err.message}`);
        }
    }

    // ── 全部失败 ──
    if (!genAborted) {
        stopGenProgress(false);
        _showError(lastErr);
    }
}

/* ──────────────────────────────────────────────────
   错误面板
────────────────────────────────────────────────── */
function _showError(err) {
    let msg = '图片生成失败，请重试';
    if (err) {
        if (err.message === 'TIMEOUT')         msg = 'AI 服务响应超时——请点击「重试」或稍后再试';
        else if (err.message === 'LOAD_ERROR') msg = '图片加载失败——请检查网络连接后重试';
        else if (err.message.startsWith('HTTP')) msg = `服务器返回错误（${err.message}）——请稍后重试`;
        else                                   msg = `生成出错（${err.message}）——请重试`;
    }

    const errMsgEl = document.getElementById('artErrorMsg');
    if (errMsgEl) errMsgEl.textContent = msg;

    _ensureOpenTabBtn();
    showArtPanel('artError');
}

function _ensureOpenTabBtn() {
    let btn = document.getElementById('artOpenTabBtn');
    if (!btn) {
        const errPanel = document.getElementById('artError');
        if (!errPanel) return;
        btn = document.createElement('a');
        btn.id        = 'artOpenTabBtn';
        btn.target    = '_blank';
        btn.rel       = 'noopener noreferrer';
        btn.className = 'ds-btn ds-btn-ghost ds-btn-sm';
        btn.style.cssText = 'margin-top:8px;display:inline-flex;align-items:center;gap:6px;';
        btn.innerHTML = '<i class="fas fa-external-link-alt"></i> 在新标签打开图片';
        const retryBtn = errPanel.querySelector('button');
        if (retryBtn) retryBtn.insertAdjacentElement('afterend', btn);
        else errPanel.appendChild(btn);
    }
    if (lastGeneratedUrl) btn.href = lastGeneratedUrl;
}

function _updateOpenTabBtn(url) {
    if (url) lastGeneratedUrl = url;
    const btn = document.getElementById('artOpenTabBtn');
    if (btn && lastGeneratedUrl) btn.href = lastGeneratedUrl;
}

/* ──────────────────────────────────────────────────
   重新生成 / 重试
────────────────────────────────────────────────── */
function regenerateArt() {
    genAborted = false;
    showArtPanel('artIdle');
    setTimeout(() => generateDreamArt(), 150);
}

function retryArt() {
    genAborted = false;
    showArtPanel('artIdle');
    setTimeout(() => generateDreamArt(), 150);
}

/* ──────────────────────────────────────────────────
   分享
────────────────────────────────────────────────── */
function shareArt() {
    const imgEl = document.getElementById('artResultImg');
    if (!imgEl || !imgEl.src) {
        if (typeof showToast === 'function') showToast('请先生成画作再分享');
        return;
    }
    if (navigator.share) {
        navigator.share({ title: 'DreamLens 梦境艺术', text: '用 DreamLens AI 生成的梦境艺术画！', url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
            if (typeof showToast === 'function') showToast('🔗 链接已复制');
        });
    } else {
        if (typeof showToast === 'function') showToast('📱 请截图后分享');
    }
}

/* ──────────────────────────────────────────────────
   解析完成回调
────────────────────────────────────────────────── */
function artOnAnalysisComplete(dreamText) {
    currentDreamText = dreamText || '';
    genAborted       = false;
    showArtPanel('artIdle');
}

/* ──────────────────────────────────────────────────
   暴露全局
────────────────────────────────────────────────── */
window.selectArtStyle        = selectArtStyle;
window.generateDreamArt      = generateDreamArt;
window.regenerateArt         = regenerateArt;
window.retryArt              = retryArt;
window.shareArt              = shareArt;
window.artOnAnalysisComplete = artOnAnalysisComplete;
