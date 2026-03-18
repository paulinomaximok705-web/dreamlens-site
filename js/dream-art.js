/* ====================================================
   DreamLens — dream-art.js  v5
   AI 梦境图片生成模块
   核心修复：
   1. fal FLUX.1 schnell 生成
   2. 多提示词尝试：同一梦境多提示词组合（更相关）
   3. 梦境内容精准匹配词典 → 生成更聚焦的提示词
==================================================== */

const IMAGE_API_ENDPOINT = window.DREAMLENS_IMAGE_API || 'https://YOUR-VERCEL-APP.vercel.app/api/image';
const DAILY_IMAGE_LIMIT = 3;
const CLIENT_ID_STORAGE_KEY = 'dreamlens_client_id';
const USAGE_STORAGE_KEY = 'dreamlens_art_daily_usage';

const DEFAULT_ART_STYLE = {
    label: '梦境艺术',
    suffix: 'dreamlike surreal painting, ethereal atmosphere, cinematic lighting, painterly texture, highly detailed'
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
let currentDreamText = '';
let genProgressTimer = null;
let genAborted       = false;
let lastGeneratedUrl = '';

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function getOrCreateClientId() {
    try {
        const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
        if (existing) return existing;

        const clientId = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
        return clientId;
    } catch (_) {
        return `dl_fallback_${Date.now()}`;
    }
}

function getLocalUsageState() {
    const today = getTodayKey();

    try {
        const raw = localStorage.getItem(USAGE_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;

        if (parsed && parsed.date === today) {
            return { date: today, count: Number(parsed.count) || 0 };
        }
    } catch (_) {}

    return { date: today, count: 0 };
}

function saveLocalUsageCount(count) {
    try {
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({
            date: getTodayKey(),
            count: Math.max(0, count)
        }));
    } catch (_) {}
}

function getRemainingLocalQuota() {
    const state = getLocalUsageState();
    return Math.max(0, DAILY_IMAGE_LIMIT - state.count);
}

function syncLocalQuotaFromResponse(data) {
    if (typeof data?.remaining === 'number') {
        saveLocalUsageCount(DAILY_IMAGE_LIMIT - data.remaining);
        return;
    }

    const state = getLocalUsageState();
    saveLocalUsageCount(state.count + 1);
}

/* ──────────────────────────────────────────────────
   提示词构建
────────────────────────────────────────────────── */
function extractVisualFromDream(text) {
    if (!text) {
        return {
            visualCore: 'mysterious dream landscape, ethereal surreal atmosphere, subconscious imagery',
            motifs: []
        };
    }

    const scored = SCENE_DICT.map(entry => ({
        score: entry.kw.reduce((s, kw) => s + (text.includes(kw) ? entry.w : 0), 0),
        en: entry.en
    })).filter(e => e.score > 0).sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        const cleaned = text.replace(/[，。！？、；：\n\r]/g, ' ').trim().slice(0, 50);
        return {
            visualCore: `dreamlike surreal scene of "${cleaned}", subconscious visualization, symbolic dream imagery, ethereal atmosphere`,
            motifs: []
        };
    }

    const visualCore = scored.slice(0, 2).map(e => e.en).join(', ');
    const motifs = scored
        .slice(0, 3)
        .map(e => e.en.split(',')[0].trim())
        .filter(Boolean);

    return { visualCore, motifs };
}

function buildLiteralDreamPrompt(text) {
    const cleaned = String(text || '')
        .replace(/[，。！？、；：]/g, ', ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 220);

    if (!cleaned) {
        return 'dream scene based on the user description';
    }

    return `faithful visual depiction of this dream: ${cleaned}`;
}

function buildRelationHints(text) {
    const hints = [];
    const hasHuman = /(我|自己|本人|我们)/.test(text);
    const hasGlassBuilding = /(玻璃).*(建筑|大楼|房子|宫殿|房间)|((建筑|大楼|房子|宫殿|房间).*(玻璃))/.test(text);
    const hasWhale = /(鲸|鲸鱼)/.test(text);

    if (hasHuman) {
        hints.push('a human figure must be clearly visible');
    }
    if (hasGlassBuilding) {
        hints.push('the scene must clearly show a giant transparent glass building interior');
    }
    if (hasHuman && hasWhale) {
        hints.push('the whale must appear beside the person in the same frame');
    } else if (hasWhale) {
        hints.push('a whale must be clearly visible in the main scene');
    }

    hints.push('preserve the main objects and their spatial relationships from the dream');
    return hints.join(', ');
}

function buildPromptAndSeed(dreamText, variant = 0) {
    const styleInfo  = DEFAULT_ART_STYLE;
    const { visualCore, motifs } = extractVisualFromDream(dreamText);
    const literalScene = buildLiteralDreamPrompt(dreamText);
    const relationHints = buildRelationHints(dreamText);
    const motifLine = motifs.length ? `key motifs: ${motifs.join(', ')}` : '';
    const coherence = 'coherent single scene, consistent subject, cinematic lighting, avoid unrelated elements, no extra subjects dominating the frame';
    const promptBase = `${literalScene}, ${visualCore}, ${relationHints}, ${styleInfo.suffix}, ${coherence}`;
    const prompt = variant === 0
        ? `${promptBase}, ${motifLine}, highly detailed, faithful to the described dream, no text, no watermark`
        : `${relationHints}, ${literalScene}, ${promptBase}, ${motifLine}, dreamy atmosphere, highly detailed, faithful to the described dream, no text, no watermark`;
    const seed       = Math.floor(Math.random() * 999999);
    return { prompt, seed, styleInfo };
}

function _sanitizePrompt(prompt) {
    const safe = prompt.replace(/"/g, "'").replace(/\s+/g, ' ').trim();
    return safe.length > 380 ? safe.slice(0, 380) : safe;
}

/* ──────────────────────────────────────────────────
   构建图片源列表
────────────────────────────────────────────────── */
function buildImagePrompts(dreamText) {
    const first = buildPromptAndSeed(dreamText, 0);
    const second = buildPromptAndSeed(dreamText, 1);
    first.prompt = _sanitizePrompt(first.prompt);
    second.prompt = _sanitizePrompt(second.prompt);

    console.log('[DreamArt] 生成提示词 #1:', first.prompt.slice(0, 120));
    console.log('[DreamArt] 生成提示词 #2:', second.prompt.slice(0, 120));

    return [
        { prompt: first.prompt, styleInfo: first.styleInfo },
        { prompt: second.prompt, styleInfo: second.styleInfo }
    ];
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
   图片生成请求
────────────────────────────────────────────────── */
async function requestImage(prompt) {
    if (!IMAGE_API_ENDPOINT || IMAGE_API_ENDPOINT.includes('YOUR-VERCEL-APP')) {
        throw new Error('NO_API_ENDPOINT');
    }

    if (getRemainingLocalQuota() <= 0) {
        throw new Error('DAILY_LIMIT_REACHED');
    }

    const res = await fetch(IMAGE_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Dreamlens-Client-Id': getOrCreateClientId()
        },
        body: JSON.stringify({ prompt, size: '1024x1024', quality: 'low' })
    });

    const data = await res.json();
    if (!res.ok) {
        const msg = data?.error?.message || data?.error || `HTTP_${res.status}`;
        throw new Error(String(msg));
    }

    const imageSrc = data?.imageUrl || (data?.b64 ? `data:image/png;base64,${data.b64}` : '');
    if (!imageSrc) {
        throw new Error('NO_IMAGE');
    }

    syncLocalQuotaFromResponse(data);
    return imageSrc;
}

function _formatImageErrorMessage(err) {
    if (!err || !err.message) return '图片生成失败，请重试';

    const raw = String(err.message);
    const lower = raw.toLowerCase();

    if (raw === 'NO_API_ENDPOINT') {
        return '未配置图片生成服务——请先部署后端并填写接口地址';
    }

    if (raw === 'NO_IMAGE') {
        return '图片服务未返回图片数据——请稍后重试';
    }

    if (raw === 'DAILY_LIMIT_REACHED') {
        return `你今天的梦境艺术生成次数已达上限（${DAILY_IMAGE_LIMIT} 次）——请明天再试`;
    }

    if (raw.startsWith('HTTP')) {
        return `服务器返回错误（${raw}）——请稍后重试`;
    }

    if (lower.includes('billing hard limit')) {
        return '图片生成额度已用尽：当前图片服务账户触发了 billing hard limit，请充值或提高项目预算后重试';
    }

    if (lower.includes('insufficient_quota')) {
        return '图片生成额度不足：当前图片服务配额已耗尽，请检查账户余额或套餐限制';
    }

    if (lower.includes('rate limit')) {
        return '图片生成请求过于频繁，已触发限流——请稍等片刻后重试';
    }

    if (lower.includes('invalid_api_key')) {
        return '图片服务配置错误：API Key 无效，请检查部署环境变量';
    }

    return `生成出错（${raw}）——请重试`;
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

    const prompts   = buildImagePrompts(currentDreamText);
    const styleInfo = DEFAULT_ART_STYLE;

    let lastErr = null;

    for (let i = 0; i < prompts.length; i++) {
        if (genAborted) return;

        const src = prompts[i];

        console.log(`[DreamArt] 尝试 #${i+1} (fal image)`);

        try {
            const imgSrc = await requestImage(src.prompt);
            if (genAborted) return;

            // ── 成功 ──
            stopGenProgress(true);

            const imgEl = document.getElementById('artResultImg');
            if (imgEl) {
                imgEl.src = imgSrc;
                imgEl.alt = `AI 梦境艺术 - ${styleInfo.label}`;
            }

            const dlBtn = document.getElementById('artDownloadBtn');
            if (dlBtn) {
                dlBtn.href     = imgSrc;
                dlBtn.target   = '_blank';
                dlBtn.download = `dreamlens-art-${Date.now()}.png`;
            }

            _updateOpenTabBtn(imgSrc);

            const promptEl = document.getElementById('artResultPrompt');
            if (promptEl) {
                const snippet = currentDreamText.slice(0, 40).replace(/\n/g, ' ');
                promptEl.textContent = `以「${snippet}${currentDreamText.length > 40 ? '…' : ''}」为灵感生成的梦境艺术画。`;
            }

            showArtPanel('artResult');
            if (typeof showToast === 'function') {
                showToast('✨ 梦境艺术画生成完成！');
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
    const msg = _formatImageErrorMessage(err);

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
window.generateDreamArt      = generateDreamArt;
window.regenerateArt         = regenerateArt;
window.retryArt              = retryArt;
window.shareArt              = shareArt;
window.artOnAnalysisComplete = artOnAnalysisComplete;
