/* ====================================================
   DreamLens — dream-art.js  v5
   AI 梦境图片生成模块
   核心修复：
   1. fal FLUX.1 schnell 生成
   2. 多提示词尝试：同一梦境多提示词组合（更相关）
   3. 梦境内容精准匹配词典 → 生成更聚焦的提示词
==================================================== */

const IMAGE_API_ENDPOINT = window.DREAMLENS_IMAGE_API || '/api/image';
const IMAGE_API_ENDPOINT_FALLBACK = window.DREAMLENS_IMAGE_API_FALLBACK || '';
const CLIENT_ID_STORAGE_KEY = 'dreamlens_client_id';
const ART_STATE_STORAGE_KEY = 'dreamlens_art_state_v2';
const LEGACY_ART_STATE_KEYS = ['dreamlens_art_state_v1'];

const DEFAULT_ART_STYLE = {
    label: '梦境艺术',
    suffix: 'dreamlike surreal fine art, indigo and violet night palette, moonlit mist, soft luminous haze, painterly texture, cinematic depth, highly detailed'
};

const ART_GENERATION_SETTINGS = {
    count: 1,
    ratio: '16:9',
    quality: '2K'
};

const ART_RATIO_OPTIONS = {
    '1:1': { label: '1:1', size: '1024x1024' },
    '3:4': { label: '3:4', size: '960x1280' },
    '4:3': { label: '4:3', size: '1280x960' },
    '16:9': { label: '16:9', size: '1365x768' }
};

const ART_QUALITY_OPTIONS = {
    '1080p': { label: '1080p', requestQuality: 'low' },
    '2K': { label: '2K', requestQuality: 'medium' },
    '4K': { label: '4K', requestQuality: 'high' }
};

const DREAM_SCENE_MOTIFS = [
    { test: /(发光).*(森林|树林)|(森林|树林).*(发光)/, en: 'a luminous forest at night' },
    { test: /(树叶).*(玻璃)|(玻璃).*(树叶)/, en: 'glass-like leaves softly shimmering as if they could chime' },
    { test: /(半开|微开).*(门)|(门).*(半开|微开)/, en: 'a distant half-open door acting like a threshold' },
    { test: /(海浪|浪声|海声|水声)/, en: 'ocean waves echoing from beyond the doorway' },
    { test: /(地面|脚下).*(下沉|沉下|塌陷|陷下)/, en: 'ground slowly sinking beneath the feet while approaching' },
    { test: /(平静).*(迟疑)|(迟疑).*(平静)/, en: 'calm and hesitation coexisting in the same quiet moment' },
    { test: /(雾|薄雾|雾气)/, en: 'thin drifting mist in the moonlit air' },
    { test: /(门后).*(光)|(光).*(门)/, en: 'subtle light leaking from the doorway' },
    { test: /(长廊|走廊)/, en: 'a long dim corridor leading inward' },
    { test: /(镜子|倒影)/, en: 'reflective surfaces hinting at another self' },
    { test: /(旧房间|旧房子|旧房屋|旧屋)/, en: 'a nostalgic abandoned room holding old memory' },
    { test: /(飞|漂浮|悬浮)/, en: 'a weightless floating sensation' }
];

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
let lastGeneratedImages = [];
let openArtParamMenu = '';
let artControlsInitialized = false;
let artState = {
    dreamText: '',
    panel: 'idle',
    images: [],
    activeImageUrl: '',
    promptText: '',
    errorText: ''
};

function clampArtImageCount(value) {
    return Math.min(4, Math.max(1, value));
}

function getCurrentArtRatioSetting() {
    return ART_RATIO_OPTIONS[ART_GENERATION_SETTINGS.ratio] || ART_RATIO_OPTIONS['16:9'];
}

function getCurrentArtQualitySetting() {
    return ART_QUALITY_OPTIONS[ART_GENERATION_SETTINGS.quality] || ART_QUALITY_OPTIONS['2K'];
}

function loadPersistedArtState() {
    try {
        LEGACY_ART_STATE_KEYS.forEach((key) => sessionStorage.removeItem(key));
        const raw = sessionStorage.getItem(ART_STATE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

function persistArtState(partial = {}) {
    artState = {
        ...artState,
        ...partial,
        settings: {
            count: ART_GENERATION_SETTINGS.count,
            ratio: ART_GENERATION_SETTINGS.ratio,
            quality: ART_GENERATION_SETTINGS.quality
        }
    };

    try {
        sessionStorage.setItem(ART_STATE_STORAGE_KEY, JSON.stringify(artState));
    } catch (_) {}
}

function clearPersistedArtState() {
    artState = {
        dreamText: '',
        panel: 'idle',
        images: [],
        activeImageUrl: '',
        promptText: '',
        errorText: ''
    };
    try {
        sessionStorage.removeItem(ART_STATE_STORAGE_KEY);
    } catch (_) {}
}

function setArtResultFrameRatio(ratio) {
    const frame = document.getElementById('artResultFrame');
    if (!frame) return;
    frame.style.aspectRatio = ratio || '16 / 9';
}

function renderArtControls() {
    const countValueEl = document.getElementById('artCountValue');
    const countMinusEl = document.getElementById('artCountMinus');
    const countPlusEl = document.getElementById('artCountPlus');
    const ratioValueEl = document.getElementById('artRatioValue');
    const qualityValueEl = document.getElementById('artQualityValue');

    if (countValueEl) countValueEl.textContent = `${ART_GENERATION_SETTINGS.count}/4`;
    if (countMinusEl) countMinusEl.disabled = ART_GENERATION_SETTINGS.count <= 1;
    if (countPlusEl) countPlusEl.disabled = ART_GENERATION_SETTINGS.count >= 4;
    if (ratioValueEl) ratioValueEl.textContent = ART_GENERATION_SETTINGS.ratio;
    if (qualityValueEl) qualityValueEl.textContent = ART_GENERATION_SETTINGS.quality;

    document.querySelectorAll('[data-art-ratio-option]').forEach((option) => {
        const active = option.dataset.artRatioOption === ART_GENERATION_SETTINGS.ratio;
        option.classList.toggle('is-selected', active);
        option.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    document.querySelectorAll('[data-art-quality-option]').forEach((option) => {
        const active = option.dataset.artQualityOption === ART_GENERATION_SETTINGS.quality;
        option.classList.toggle('is-selected', active);
        option.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    persistArtState();
}

function closeArtParamMenus() {
    openArtParamMenu = '';
    document.querySelectorAll('.az-art__param--select').forEach((root) => root.classList.remove('is-open'));
    document.querySelectorAll('.az-art__param-menu').forEach((menu) => { menu.hidden = true; });
    document.querySelectorAll('.az-art__param-trigger').forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
}

function toggleArtParamMenu(type) {
    const root = document.querySelector(`.az-art__param--select[data-art-param="${type}"]`);
    const trigger = document.getElementById(type === 'ratio' ? 'artRatioTrigger' : 'artQualityTrigger');
    const menu = document.getElementById(type === 'ratio' ? 'artRatioMenu' : 'artQualityMenu');
    if (!root || !trigger || !menu) return;

    const willOpen = openArtParamMenu !== type;
    closeArtParamMenus();

    if (!willOpen) return;

    openArtParamMenu = type;
    root.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
}

function adjustArtImageCount(delta) {
    ART_GENERATION_SETTINGS.count = clampArtImageCount(ART_GENERATION_SETTINGS.count + delta);
    renderArtControls();
}

function selectArtRatio(value) {
    if (!ART_RATIO_OPTIONS[value]) return;
    ART_GENERATION_SETTINGS.ratio = value;
    renderArtControls();
    closeArtParamMenus();
}

function selectArtQuality(value) {
    if (!ART_QUALITY_OPTIONS[value]) return;
    ART_GENERATION_SETTINGS.quality = value;
    renderArtControls();
    closeArtParamMenus();
}

function initArtControlInteractions() {
    if (artControlsInitialized) return;
    artControlsInitialized = true;

    renderArtControls();

    document.addEventListener('pointerdown', (event) => {
        if (!event.target.closest('.az-art__portal-controls')) {
            closeArtParamMenus();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeArtParamMenus();
    });
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
    const motifDetails = DREAM_SCENE_MOTIFS
        .filter((entry) => entry.test.test(text))
        .map((entry) => entry.en);

    if (motifDetails.length) {
        return motifDetails.join(', ');
    }

    return 'an oneiric scene shaped by memory, intuition and subconscious atmosphere';
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

    hints.push('preserve the emotional atmosphere and the spatial relationships of the dream');
    hints.push('single immersive scene, not a poster, not a layout, not a showcase card');
    return hints.join(', ');
}

function buildPromptAndSeed(dreamText, variant = 0) {
    const styleInfo  = DEFAULT_ART_STYLE;
    const { visualCore, motifs } = extractVisualFromDream(dreamText);
    const literalScene = buildLiteralDreamPrompt(dreamText);
    const relationHints = buildRelationHints(dreamText);
    const motifLine = motifs.length ? motifs.join(', ') : '';
    const palette = 'deep indigo, muted violet, moonlit silver haze, soft nocturnal glow, restrained dreamlike palette';
    const coherence = 'coherent single scene, atmospheric depth, cinematic composition, painterly texture, mysterious yet gentle';
    const exclusions = 'no text, no letters, no typography, no title, no logo, no poster, no packaging, no editorial cover, no UI, no interface, no labels, no watermark, no border';
    const promptBase = `${literalScene}, ${visualCore}, ${motifLine}, ${relationHints}, ${palette}, ${styleInfo.suffix}, ${coherence}, ${exclusions}`;
    const prompt = variant === 0
        ? `${promptBase}, luminous dream art, subtle narrative tension, highly detailed`
        : `${promptBase}, moody surreal atmosphere, poetic and immersive, fine art dream visualization`;
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
function showArtPanel(id, options = {}) {
    const { persistState = true } = options;
    ['artIdle', 'artGenerating', 'artResult', 'artError'].forEach(pid => {
        const el = document.getElementById(pid);
        if (el) el.style.display = pid === id ? 'flex' : 'none';
    });

    if (!persistState) return;

    const panel = id.replace(/^art/, '').toLowerCase() || 'idle';
    if (panel === 'result' || panel === 'idle') {
        persistArtState({ panel });
    }
}

function setActiveArtResultImage(url) {
    if (!url) return;

    const imgEl = document.getElementById('artResultImg');
    if (imgEl) {
        imgEl.src = url;
        imgEl.alt = `AI 梦境艺术 - ${DEFAULT_ART_STYLE.label}`;
    }

    const dlBtn = document.getElementById('artDownloadBtn');
    if (dlBtn) {
        dlBtn.href = url;
        dlBtn.target = '_blank';
        dlBtn.download = `dreamlens-art-${Date.now()}.png`;
    }

    _updateOpenTabBtn(url);

    document.querySelectorAll('.az-art__result-thumb').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.artImageUrl === url);
    });

    persistArtState({ activeImageUrl: url });
}

function renderArtResultGallery(imageUrls = []) {
    const strip = document.getElementById('artResultStrip');
    if (!strip) return;

    strip.innerHTML = '';
    if (!Array.isArray(imageUrls) || imageUrls.length <= 1) {
        strip.hidden = true;
        persistArtState({ images: imageUrls.slice() });
        return;
    }

    imageUrls.forEach((url, index) => {
        if (!url) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'az-art__result-thumb';
        button.dataset.artImageUrl = url;
        button.setAttribute('aria-label', `查看第 ${index + 1} 幅梦境艺术`);
        if (index === 0) button.classList.add('is-active');

        const img = document.createElement('img');
        img.src = url;
        img.alt = `第 ${index + 1} 幅 AI 梦境艺术`;
        button.appendChild(img);

        button.addEventListener('click', () => {
            setActiveArtResultImage(url);
        });

        strip.appendChild(button);
    });

    strip.hidden = strip.childElementCount <= 1;
    persistArtState({ images: imageUrls.slice() });
}

/* ──────────────────────────────────────────────────
   图片生成请求
────────────────────────────────────────────────── */
async function requestImage(prompt, options = {}) {
    if (!IMAGE_API_ENDPOINT || IMAGE_API_ENDPOINT.includes('YOUR-VERCEL-APP')) {
        throw new Error('NO_API_ENDPOINT');
    }

    const payload = {
        prompt,
        size: options.size || '1024x1024',
        quality: options.quality || 'medium',
        count: clampArtImageCount(options.count || 1)
    };

    const requestJson = async (endpoint) => {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Dreamlens-Client-Id': getOrCreateClientId()
            },
            body: JSON.stringify(payload)
        });

        const raw = await res.text();
        const trimmed = raw.trim();
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const looksJson = contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[');

        if (!looksJson) {
            const err = new Error('NON_JSON_RESPONSE');
            err.endpoint = endpoint;
            err.status = res.status;
            err.responseSnippet = trimmed.slice(0, 120);
            throw err;
        }

        let data = {};
        try {
            data = trimmed ? JSON.parse(trimmed) : {};
        } catch (_) {
            const err = new Error('INVALID_JSON_RESPONSE');
            err.endpoint = endpoint;
            err.status = res.status;
            err.responseSnippet = trimmed.slice(0, 120);
            throw err;
        }

        if (!res.ok) {
            const msg = data?.error?.message || data?.error || `HTTP_${res.status}`;
            throw new Error(String(msg));
        }

        return data;
    };

    let data;
    try {
        data = await requestJson(IMAGE_API_ENDPOINT);
    } catch (err) {
        const canFallback = !!IMAGE_API_ENDPOINT_FALLBACK
            && IMAGE_API_ENDPOINT_FALLBACK !== IMAGE_API_ENDPOINT
            && (
                err?.message === 'NON_JSON_RESPONSE'
                || err?.message === 'INVALID_JSON_RESPONSE'
                || /failed to fetch|networkerror|load failed|network request failed/i.test(err?.message || '')
            );

        if (!canFallback) throw err;

        data = await requestJson(IMAGE_API_ENDPOINT_FALLBACK);
    }

    const imageUrls = Array.isArray(data?.imageUrls)
        ? data.imageUrls.filter(Boolean)
        : [];
    const fallbackImage = data?.imageUrl || (data?.b64 ? `data:image/png;base64,${data.b64}` : '');
    const resolvedImages = imageUrls.length ? imageUrls : (fallbackImage ? [fallbackImage] : []);

    if (!resolvedImages.length) {
        throw new Error('NO_IMAGE');
    }

    return resolvedImages;
}

async function requestImageBatch(prompt, options = {}) {
    const requestedCount = clampArtImageCount(options.count || 1);
    const primaryBatch = await requestImage(prompt, {
        ...options,
        count: requestedCount
    });

    let images = primaryBatch.slice(0, requestedCount);

    while (images.length < requestedCount) {
        const extraBatch = await requestImage(prompt, {
            ...options,
            count: 1
        });
        if (!extraBatch.length) break;
        images = images.concat(extraBatch);
    }

    return images.slice(0, requestedCount);
}

function _formatImageErrorMessage(err) {
    if (!err || !err.message) return '图片生成失败，请重试';

    const raw = String(err.message);
    const lower = raw.toLowerCase();

    if (raw === 'NO_API_ENDPOINT') {
        return '未配置真实图片生成服务——请先部署 /api/image，或显式配置 DREAMLENS_IMAGE_API';
    }

    if (raw === 'NO_IMAGE') {
        return '图片服务未返回图片数据——请稍后重试';
    }

    if (raw === 'NON_JSON_RESPONSE' || raw === 'INVALID_JSON_RESPONSE') {
        return '当前页面没有连到可用的图片服务。请确认当前域名下的 /api/image 已部署；如果你是在本地静态预览，再使用 http://127.0.0.1:3010/analyze.html 打开。';
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

    if (raw === 'Missing FAL_KEY' || lower.includes('missing fal_key')) {
        return '当前服务还没有配置 FAL_KEY，所以现在无法走真实 fal 生图';
    }

    if (raw === 'REAL_IMAGE_REQUIRED') {
        return '当前环境未连接真实 fal 生图服务，所以不会继续使用本地预览图';
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
    showArtPanel('artGenerating', { persistState: false });
    persistArtState({
        dreamText: currentDreamText,
        promptText: '',
        errorText: '',
        panel: 'idle'
    });
    const styleInfo = DEFAULT_ART_STYLE;
    startGenProgress();

    const prompts   = buildImagePrompts(currentDreamText);
    const ratioSetting = getCurrentArtRatioSetting();
    const qualitySetting = getCurrentArtQualitySetting();

    let lastErr = null;

    for (let i = 0; i < prompts.length; i++) {
        if (genAborted) return;

        const src = prompts[i];

        console.log(`[DreamArt] 尝试 #${i+1} (fal image)`);

        try {
            const imageSources = await requestImageBatch(src.prompt, {
                size: ratioSetting.size,
                quality: qualitySetting.requestQuality,
                count: ART_GENERATION_SETTINGS.count
            });
            if (genAborted) return;

            // ── 成功 ──
            stopGenProgress(true);
            lastGeneratedImages = imageSources;
            setArtResultFrameRatio(ART_GENERATION_SETTINGS.ratio);
            renderArtResultGallery(imageSources);
            setActiveArtResultImage(imageSources[0]);

            const promptEl = document.getElementById('artResultPrompt');
            const specsEl = document.getElementById('artResultSpecs');
            if (promptEl) {
                const snippet = currentDreamText.slice(0, 40).replace(/\n/g, ' ');
                const countLabel = imageSources.length > 1 ? `${imageSources.length} 幅` : '一幅';
                const promptText = `以「${snippet}${currentDreamText.length > 40 ? '…' : ''}」为灵感生成的 ${countLabel} ${ART_GENERATION_SETTINGS.ratio} / ${ART_GENERATION_SETTINGS.quality} 梦境艺术图像。`;
                promptEl.textContent = promptText;
                if (specsEl) specsEl.textContent = `${countLabel} · ${ART_GENERATION_SETTINGS.ratio} · ${ART_GENERATION_SETTINGS.quality}`;
                persistArtState({
                    dreamText: currentDreamText,
                    promptText,
                    images: imageSources.slice(),
                    activeImageUrl: imageSources[0] || '',
                    errorText: ''
                });
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
    persistArtState({
        dreamText: currentDreamText,
        errorText: msg,
        promptText: '',
        images: [],
        activeImageUrl: '',
        panel: 'idle'
    });
    showArtPanel('artError', { persistState: false });
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
    const persisted = loadPersistedArtState();

    if (
        persisted
        && persisted.dreamText
        && persisted.dreamText === currentDreamText
        && persisted.settings
    ) {
        ART_GENERATION_SETTINGS.count = clampArtImageCount(persisted.settings.count || 1);
        ART_GENERATION_SETTINGS.ratio = ART_RATIO_OPTIONS[persisted.settings.ratio] ? persisted.settings.ratio : '16:9';
        ART_GENERATION_SETTINGS.quality = ART_QUALITY_OPTIONS[persisted.settings.quality] ? persisted.settings.quality : '2K';
        renderArtControls();
        setArtResultFrameRatio(ART_GENERATION_SETTINGS.ratio);

        if (persisted.panel === 'result' && Array.isArray(persisted.images) && persisted.images.length) {
            lastGeneratedImages = persisted.images.slice();
            renderArtResultGallery(lastGeneratedImages);
            const promptEl = document.getElementById('artResultPrompt');
            if (promptEl) promptEl.textContent = persisted.promptText || '';
            const specsEl = document.getElementById('artResultSpecs');
            if (specsEl) {
                const countLabel = lastGeneratedImages.length > 1 ? `${lastGeneratedImages.length} 幅` : '一幅';
                specsEl.textContent = `${countLabel} · ${ART_GENERATION_SETTINGS.ratio} · ${ART_GENERATION_SETTINGS.quality}`;
            }
            setActiveArtResultImage(persisted.activeImageUrl || lastGeneratedImages[0]);
            showArtPanel('artResult');
            return;
        }

        if (persisted.panel === 'error') {
            // 旧版会把错误态也持久化，用户回到结果页时看起来像“自己刷新回错误页”。
            // v2 只恢复结果态和参数，错误态统一回到 idle。
            showArtPanel('artIdle');
            return;
        }

        showArtPanel('artIdle');
        return;
    }

    clearPersistedArtState();
    persistArtState({ dreamText: currentDreamText });
    lastGeneratedImages = [];
    lastGeneratedUrl = '';
    renderArtResultGallery([]);
    renderArtControls();
    setArtResultFrameRatio(ART_GENERATION_SETTINGS.ratio);
    showArtPanel('artIdle');
}

/* ──────────────────────────────────────────────────
   暴露全局
────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArtControlInteractions);
} else {
    initArtControlInteractions();
}

window.generateDreamArt      = generateDreamArt;
window.regenerateArt         = regenerateArt;
window.retryArt              = retryArt;
window.shareArt              = shareArt;
window.artOnAnalysisComplete = artOnAnalysisComplete;
window.adjustArtImageCount   = adjustArtImageCount;
window.toggleArtParamMenu    = toggleArtParamMenu;
window.selectArtRatio        = selectArtRatio;
window.selectArtQuality      = selectArtQuality;
