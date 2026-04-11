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

const THEME_LABELS = {
    water:  '水域梦境', chase: '追逐梦境', fall:  '坠落蜕变',
    fly:    '飞翔自由', forest:'森林迷途', house: '家与空间',
    light:  '光与洞见', death: '终结新生', general:'其他梦境'
};

const EMOTION_COLORS = {
    安宁:'#8b5cf6', 焦虑:'#f59e0b', 兴奋:'#06b6d4',
    悲伤:'#3b82f6', 困惑:'#a78bfa', 恐惧:'#ef4444',
    释然:'#10b981', 疲惫:'#6b7280'
};

const EMOTION_EMOJIS = {
    安宁:'', 焦虑:'', 兴奋:'', 悲伤:'',
    困惑:'', 恐惧:'', 释然:'', 疲惫:''
};

const EMOTION_TRACK_LIBRARY = {
    安宁: { label:'安宁', level:104, accent:'rgba(174,191,255,0.78)' },
    焦虑: { label:'焦虑', level:126, accent:'rgba(173,165,229,0.76)' },
    兴奋: { label:'兴奋', level:94,  accent:'rgba(214,191,255,0.8)' },
    悲伤: { label:'悲伤', level:138, accent:'rgba(158,177,228,0.76)' },
    困惑: { label:'困惑', level:118, accent:'rgba(166,158,224,0.76)' },
    恐惧: { label:'恐惧', level:132, accent:'rgba(180,171,220,0.74)' },
    释然: { label:'释然', level:98,  accent:'rgba(187,198,255,0.8)' },
    疲惫: { label:'疲惫', level:144, accent:'rgba(150,162,214,0.72)' }
};

const EMOTION_MONTH_SUMMARIES = {
    安宁: '这个月的梦绪更像一种缓慢落定的安静，提醒你内在正在试着放松下来。',
    焦虑: '它反复出现，往往说明现实里仍有一件事悬而未决，情绪还没真正落地。',
    兴奋: '它像被点亮的期待，说明你最近正被某个方向牵引着，心里还带着跃动。',
    悲伤: '这类情绪更像回声，可能有些失去、怀念或未说完的部分还在轻轻停留。',
    困惑: '它更像一段仍在显影中的状态，说明你最近也许正处在尚未完全看清的过渡里。',
    恐惧: '这种收紧感常常来自现实里的压力、边界或不确定，让梦先替你把它说出来。',
    释然: '它像松开后的余温，说明某些曾经绷紧的部分，正在慢慢找到自己的出口。',
    疲惫: '它更接近内在的消耗感，提醒你最近也许需要更慢一点，给自己留出恢复的空间。'
};

const TOTEM_LIBRARY = {
    forest: { label:'森林', hint:'在未知里寻找方向', kws:['森林','树林','树木','树叶','树枝','丛林','林间','树'] },
    door:   { label:'门',   hint:'靠近一个尚未进入的入口', kws:['门','门缝','门后','入口','走廊','阈限'] },
    wave:   { label:'海浪', hint:'情绪正在反复起伏', kws:['海浪','海','潮','波','波浪','河','湖','水面','水下','溪'] },
    moon:   { label:'月亮', hint:'直觉在夜里发光', kws:['月亮','月光','月相','夜空','星空','星光','光','发亮'] },
    mirror: { label:'镜子', hint:'梦在映照另一个自己', kws:['镜子','倒影','反射','映照','镜面'] },
    stairs: { label:'楼梯', hint:'正停在过渡与转折之间', kws:['楼梯','台阶','阶梯','上楼','下楼','楼层'] },
    bird:   { label:'鸟',   hint:'自由与离开的冲动', kws:['鸟','羽毛','飞鸟','翅膀','飞翔','腾空'] },
    fire:   { label:'火',   hint:'能量、危险或重新点燃', kws:['火','火焰','燃烧','火光','灰烬'] },
    room:   { label:'房间', hint:'某个内在空间正在被重新看见', kws:['房间','屋','房子','家','客厅','卧室','旧房间'] },
    glass:  { label:'玻璃', hint:'脆弱、透明与边界感', kws:['玻璃','窗','窗户','透明','碎裂'] },
    train:  { label:'列车', hint:'梦在提醒一条正在运行的轨迹', kws:['列车','火车','车厢','轨道','站台'] },
    mist:   { label:'雾',   hint:'有些部分仍在慢慢显影', kws:['雾','迷雾','朦胧','看不清','模糊'] }
};

const TOTEM_THEME_FALLBACK = {
    water: 'wave',
    chase: 'door',
    fall: 'stairs',
    fly: 'bird',
    forest: 'forest',
    house: 'room',
    light: 'moon',
    death: 'mist',
    general: 'mist'
};

const TRACK_BETA_SEEDS = [
    ['2025-12-04', '雪后的门廊', '梦里我站在一间旧屋门廊前，门后没有声音，却像有一段还没开始的路在等我。', '迟疑', 'house', 'door'],
    ['2025-12-08', '雾中的站台', '站台被雾气包住，远处的列车没有出现，我只是安静地等着什么慢慢显影。', '困惑', 'general', 'mist'],
    ['2025-12-11', '夜里的潮声', '窗外看不见海，可潮声一直贴着屋子走，像某种没说出口的情绪。', '焦虑', 'water', 'wave'],
    ['2025-12-15', '回到旧房间', '我又回到那间熟悉的房间，灯是暖的，但心里仍有一点未完成的迟疑。', '怀旧与不安', 'house', 'room'],
    ['2025-12-22', '月光落在桌面', '桌上只放着一盏旧灯，真正照亮一切的却是窗外很近的月光。', '安宁', 'light', 'moon'],
    ['2025-12-27', '第二扇门', '推开第一扇门后，里面还有一扇更轻的门，像答案总在下一层。', '迟疑', 'chase', 'door'],
    ['2025-12-30', '林边的最后一夜', '我在森林边缘停了一会儿，没有进去，却知道自己很快会再回来。', '释然', 'forest', 'forest'],

    ['2026-01-03', '往上的楼梯', '楼梯一层层往上延伸，我不知道终点，但身体知道要继续走。', '期待', 'fall', 'stairs'],
    ['2026-01-06', '低飞的鸟影', '一群鸟从很低的地方掠过我头顶，带着一种想离开的冲动。', '兴奋', 'fly', 'bird'],
    ['2026-01-09', '房间里的风', '房间里明明关着窗，却一直有风穿过，像有人在轻轻提醒我什么。', '困惑', 'house', 'room'],
    ['2026-01-12', '森林里的灯', '树林深处有一盏很小的灯，我没有靠近，只是一直记得它的位置。', '被吸引', 'forest', 'forest'],
    ['2026-01-18', '水边的列车', '列车沿着湖边缓慢经过，水面一直映着同一段摇晃的光。', '安宁', 'water', 'wave'],
    ['2026-01-21', '月亮压得很低', '那晚的月亮很低，低得像快要碰到屋顶，让我有一点安静的敬畏。', '安宁', 'light', 'moon'],
    ['2026-01-26', '门后没有人', '我反复确认门后是不是有人，但每次推开，里面都只是空空的安静。', '迟疑', 'chase', 'door'],
    ['2026-01-30', '雾把方向拿走了', '我走在熟悉的街上，却因为雾而分不清哪一边才是回去的路。', '迷惘', 'general', 'mist'],

    ['2026-02-02', '镜子后的走廊', '镜子里出现了一条我从没见过的走廊，像现实在背后还有一层。', '困惑', 'house', 'mirror'],
    ['2026-02-05', '缓慢上涨的潮水', '潮水一点点淹到脚边，没有危险，却让人没法忽视它的存在。', '焦虑', 'water', 'wave'],
    ['2026-02-09', '森林里的回音', '我叫了一次自己的名字，树林把它变成陌生的回音还给了我。', '困惑', 'forest', 'forest'],
    ['2026-02-14', '门缝里的光', '光从门缝里透出来，像在提醒我有件事已经到了该面对的时候。', '迟疑', 'chase', 'door'],
    ['2026-02-18', '楼梯忽然消失', '我走到一半时楼梯消失了，像熟悉的路径突然不再可靠。', '不安', 'fall', 'stairs'],
    ['2026-02-23', '镜中更安静的自己', '镜子里的我不说话，只是比现实里的我更平静地看着这一切。', '释然', 'house', 'mirror'],
    ['2026-02-26', '水面上的月影', '月亮落进水里，波纹把它一点点拉开，让我忽然不想追问答案。', '安宁', 'water', 'wave'],

    ['2026-03-02', '门后传来的海浪', '我站在一条很长的走廊里，门后一直传来海浪声，像有什么在轻轻召唤我靠近。', '被吸引', 'water', 'wave'],
    ['2026-03-04', '半开的门', '梦里有一扇半开的门，门缝里透出很淡的光，我知道里面有什么，却迟迟没有推开。', '迟疑', 'chase', 'door'],
    ['2026-03-07', '森林边缘的入口', '我走到一片发光的森林边缘，树影很安静，像在等我继续往里走。', '困惑', 'forest', 'forest'],
    ['2026-03-10', '潮声绕着房间', '我坐在空房间里，窗外的潮声一阵阵靠近，像情绪在反复拍岸。', '焦虑', 'water', 'wave'],
    ['2026-03-13', '镜面里更平静的人', '镜子里的我没有说话，只是很安静地看着我，像已经知道我还没说出口的部分。', '怀旧与不安', 'house', 'mirror'],
    ['2026-03-16', '森林里的寻找', '我沿着林间一条很窄的路往前走，明明很安静，却一直像在寻找某个方向。', '困惑', 'forest', 'forest'],
    ['2026-03-19', '月亮离我很近', '梦里的月亮低得像要落下来，光很柔，我站在下面反而慢慢安静了。', '安宁', 'light', 'moon'],
    ['2026-03-22', '森林深处的停顿', '我在森林深处停下来，四周没有风，只有一种很轻的迟疑和被看见的感觉。', '困惑', 'forest', 'forest'],
    ['2026-03-24', '一直往下的楼梯', '楼梯没有尽头，我每往下走一层，周围就更安静一点，像正在接近什么。', '疲惫', 'fall', 'stairs'],
    ['2026-03-27', '门后的第二个房间', '我推开一扇门，里面还有另一扇门，像一层一层靠近还没准备好的答案。', '迟疑', 'house', 'door'],
    ['2026-03-29', '森林又一次出现', '同一片森林再次出现，这次我没有迷路，只是知道自己还要继续往前。', '释然', 'forest', 'forest'],

    ['2026-04-03', '门后的风声', '门还没打开，风声先从里面吹了出来，像有什么准备开始移动。', '期待', 'chase', 'door'],
    ['2026-04-06', '森林外的白雾', '森林没有消失，只是被一层白雾隔开，让方向感变得更迟缓。', '困惑', 'forest', 'forest'],
    ['2026-04-11', '很低的鸟群', '鸟群飞得很低，像一层贴着地面的念头在试着离开。', '兴奋', 'fly', 'bird'],
    ['2026-04-15', '回到海边的站台', '站台旁边忽然就是海，潮声和列车声交叠在一起，让我无法立刻判断自己要去哪里。', '焦虑', 'water', 'wave'],
    ['2026-04-18', '房间里的第二张椅子', '房间里多了一张空椅子，我始终觉得那里本来该坐着谁。', '悲伤', 'house', 'room'],
    ['2026-04-22', '月亮照亮了路口', '梦里没有指示牌，只有月亮把其中一条路照得更清楚。', '安宁', 'light', 'moon'],
    ['2026-04-27', '又走进那片森林', '我第三次走进那片森林，这次没有急着找出口，只是安静地往前。', '释然', 'forest', 'forest'],
    ['2026-04-30', '停在半空的楼梯', '楼梯停在半空中，我站在最后一阶，知道自己还需要一点时间。', '疲惫', 'fall', 'stairs'],

    ['2026-05-02', '镜中的潮湿房间', '镜子映出另一间更潮湿的房间，像情绪被放大后还没来得及整理。', '困惑', 'house', 'mirror'],
    ['2026-05-07', '海浪拍在门外', '我听着海浪一遍遍拍在门外，像一件反复被想起的事。', '焦虑', 'water', 'wave'],
    ['2026-05-10', '第三扇门', '门一扇接着一扇出现，每一次推开都更像在靠近真正的问题。', '迟疑', 'chase', 'door'],
    ['2026-05-16', '森林里的白线', '林间出现一条细细的白线，像在夜里替我标记方向。', '被吸引', 'forest', 'forest'],
    ['2026-05-21', '月亮停在树梢', '月亮停在树梢上方不动，像一盏愿意陪我多待一会儿的灯。', '安宁', 'light', 'moon'],
    ['2026-05-25', '雾把名字吞掉了', '我喊出一个名字，但声音在雾里被柔软地吞掉，只留下回声。', '迷惘', 'general', 'mist'],
    ['2026-05-30', '往上的最后几阶', '楼梯只剩最后几阶，我知道自己快到了，却也突然不那么着急。', '释然', 'fall', 'stairs']
].map(([isoDate, title, text, emotion, theme, totem]) => createTrackSeed(isoDate, title, text, emotion, theme, totem));

/* ──────────────────────────────────────────────────
   状态
────────────────────────────────────────────────── */
let allDreams        = [];   // 全部日记条目
let filteredDreams   = [];   // 筛选后
let currentDetailId  = null;
let editingId        = null;
let writeEmotion     = '';
let searchDebounce   = null;
let diaryRouteHydrating = false;
let trackViewYear    = null;
let trackViewMonth   = null;
let trackControlsBound = false;

function createTrackSeed(isoDate, title, text, emotion, theme, totem) {
    return {
        id: `beta-track-${isoDate}`,
        isoDate,
        title,
        text,
        emotion,
        theme,
        totem,
        timestamp: new Date(`${isoDate}T12:00:00`).getTime(),
        betaSeed: true
    };
}

function getTrackSourceDreams() {
    const merged = new Map();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    TRACK_BETA_SEEDS.forEach(seed => {
        if ((seed.timestamp || 0) > today.getTime()) return;
        merged.set(seed.isoDate, seed);
    });

    [...allDreams].forEach(dream => {
        const iso = getDreamIsoDate(dream);
        if (!iso) return;
        merged.set(iso, dream);
    });

    return [...merged.values()].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

function getReviewSourceDreams() {
    return getTrackSourceDreams();
}

function renderHeroCount() {
    const countEl = document.getElementById('dyDreamCount');
    if (!countEl) return;
    const total = getReviewSourceDreams().length;
    countEl.textContent = `已收留 ${total} 个梦`;
}

function formatTrackDate(date) {
    return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`;
}

function buildSmoothMoodPath(points) {
    if (!points.length) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i += 1) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
}

function readDiaryRouteState() {
    const url = new URL(window.location.href);
    return {
        q: url.searchParams.get('q') || '',
        detail: url.searchParams.get('detail') || '',
        compose: url.searchParams.get('compose') || '',
        edit: url.searchParams.get('edit') || '',
        trackYear: url.searchParams.get('trackYear') || '',
        trackMonth: url.searchParams.get('trackMonth') || ''
    };
}

function writeDiaryRouteState(nextState = {}, options = {}) {
    const { replace = true } = options;
    const url = new URL(window.location.href);
    const current = readDiaryRouteState();
    const merged = { ...current, ...nextState };

    const mappings = [
        ['q', merged.q],
        ['detail', merged.detail],
        ['compose', merged.compose],
        ['edit', merged.edit],
        ['trackYear', merged.trackYear],
        ['trackMonth', merged.trackMonth]
    ];

    mappings.forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
    });

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function syncDiaryRouteFromUI(options = {}) {
    const { replace = true } = options;
    writeDiaryRouteState({
        q: document.getElementById('dySearchInput')?.value.trim() || '',
        detail: currentDetailId || '',
        compose: editingId ? '' : (document.getElementById('writeModal')?.style.display === 'flex' ? 'new' : ''),
        edit: editingId || '',
        trackYear: trackViewYear ? String(trackViewYear) : '',
        trackMonth: Number.isInteger(trackViewMonth) ? String(trackViewMonth + 1) : ''
    }, { replace });
}

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
    initTrackControls();

    allDreams = loadDreams();
    restoreDiaryStateFromRoute({ replaceRoute: true });
    renderHeroMoodTrack();

    window.addEventListener('popstate', () => {
        restoreDiaryStateFromRoute({ replaceRoute: false });
    });
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
        f.appendChild(ss);
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
            applyFilters();
        }, 280);
    });
}

function initTrackControls() {
    if (trackControlsBound) return;
    const prevBtn = document.getElementById('dyTrackPrev');
    const nextBtn = document.getElementById('dyTrackNext');
    const yearSelect = document.getElementById('dyTrackYear');
    const monthSelect = document.getElementById('dyTrackMonth');
    if (!prevBtn || !nextBtn || !yearSelect || !monthSelect) return;

    prevBtn.addEventListener('click', () => setTrackView(trackViewYear, trackViewMonth - 1));
    nextBtn.addEventListener('click', () => setTrackView(trackViewYear, trackViewMonth + 1));
    yearSelect.addEventListener('change', () => {
        setTrackView(parseInt(yearSelect.value, 10), parseInt(monthSelect.value, 10) - 1);
    });
    monthSelect.addEventListener('change', () => {
        setTrackView(parseInt(yearSelect.value, 10), parseInt(monthSelect.value, 10) - 1);
    });

    trackControlsBound = true;
}

function getTrackMonthBounds() {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const trackDreams = getTrackSourceDreams();

    if (!trackDreams.length) {
        const year = currentMonth.getFullYear();
        return {
            min: new Date(year, 0, 1),
            max: new Date(year, 11, 1)
        };
    }

    const monthStarts = trackDreams
        .map(dream => new Date(dream.timestamp))
        .filter(date => !Number.isNaN(date.getTime()))
        .map(date => new Date(date.getFullYear(), date.getMonth(), 1));

    const earliest = new Date(Math.min(...monthStarts.map(date => date.getTime())));
    const latestDream = new Date(Math.max(...monthStarts.map(date => date.getTime())));
    const maxYear = Math.max(currentMonth.getFullYear(), latestDream.getFullYear());

    return {
        min: new Date(earliest.getFullYear(), 0, 1),
        max: new Date(maxYear, 11, 1)
    };
}

function getTrackDefaultDate() {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { min, max } = getTrackMonthBounds();

    if (currentMonth.getTime() >= min.getTime() && currentMonth.getTime() <= max.getTime()) {
        return currentMonth;
    }

    const trackDreams = getTrackSourceDreams();
    if (!trackDreams.length) return currentMonth;

    const latestDream = [...trackDreams].sort((a, b) => b.timestamp - a.timestamp)[0];
    const date = latestDream?.timestamp ? new Date(latestDream.timestamp) : currentMonth;
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function clampTrackView(year, month) {
    const rawDate = new Date(year, month, 1);
    const { min, max } = getTrackMonthBounds();

    if (rawDate.getTime() < min.getTime()) {
        return { year: min.getFullYear(), month: min.getMonth() };
    }

    if (rawDate.getTime() > max.getTime()) {
        return { year: max.getFullYear(), month: max.getMonth() };
    }

    return { year: rawDate.getFullYear(), month: rawDate.getMonth() };
}

function ensureTrackViewState() {
    if (!Number.isInteger(trackViewYear) || !Number.isInteger(trackViewMonth)) {
        const fallback = getTrackDefaultDate();
        trackViewYear = fallback.getFullYear();
        trackViewMonth = fallback.getMonth();
    }

    const clamped = clampTrackView(trackViewYear, trackViewMonth);
    trackViewYear = clamped.year;
    trackViewMonth = clamped.month;
}

function applyTrackStateFromRoute(route) {
    const year = parseInt(route.trackYear || '', 10);
    const month = parseInt(route.trackMonth || '', 10);

    if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
        trackViewYear = year;
        trackViewMonth = month - 1;
    } else {
        trackViewYear = null;
        trackViewMonth = null;
    }

    ensureTrackViewState();
}

function renderTrackControls() {
    const metaEl = document.getElementById('dyTrackMeta');
    const prevBtn = document.getElementById('dyTrackPrev');
    const nextBtn = document.getElementById('dyTrackNext');
    const yearSelect = document.getElementById('dyTrackYear');
    const monthSelect = document.getElementById('dyTrackMonth');
    if (!metaEl || !prevBtn || !nextBtn || !yearSelect || !monthSelect) return;

    ensureTrackViewState();
    const { min, max } = getTrackMonthBounds();

    const years = [];
    for (let year = min.getFullYear(); year <= max.getFullYear(); year += 1) {
        years.push(year);
    }

    yearSelect.innerHTML = years
        .map(year => `<option value="${year}">${year} 年</option>`)
        .join('');

    monthSelect.innerHTML = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        return `<option value="${month}">${month} 月</option>`;
    }).join('');

    yearSelect.value = String(trackViewYear);
    monthSelect.value = String(trackViewMonth + 1);
    metaEl.textContent = `${trackViewYear} 年 ${trackViewMonth + 1} 月`;

    const atMin = trackViewYear === min.getFullYear() && trackViewMonth === min.getMonth();
    const atMax = trackViewYear === max.getFullYear() && trackViewMonth === max.getMonth();
    prevBtn.disabled = atMin;
    nextBtn.disabled = atMax;
}

function setTrackView(year, month, options = {}) {
    const { syncRoute = true } = options;
    const clamped = clampTrackView(year, month);
    trackViewYear = clamped.year;
    trackViewMonth = clamped.month;
    renderTotemTrack();
    if (syncRoute && !diaryRouteHydrating) {
        syncDiaryRouteFromUI({ replace: true });
    }
}

function restoreDiaryStateFromRoute(options = {}) {
    const { replaceRoute = false } = options;
    const route = readDiaryRouteState();
    const searchInput = document.getElementById('dySearchInput');
    const searchClear = document.getElementById('dySearchClear');

    diaryRouteHydrating = true;
    applyTrackStateFromRoute(route);

    if (searchInput) searchInput.value = route.q;
    if (searchClear) searchClear.style.display = route.q ? 'block' : 'none';

    applyFilters({ syncRoute: false });
    renderHeroCount();

    closeDetailModal(null, { skipRoute: true });
    closeWriteModal(null, { skipRoute: true, force: true });

    if (route.edit) {
        const draft = allDreams.find(d => d.id === String(route.edit));
        if (draft) openWriteModal(draft, { skipRoute: true });
    } else if (route.compose === 'new') {
        openWriteModal(null, { skipRoute: true });
    } else if (route.detail) {
        openDetail(route.detail, { skipRoute: true });
    }

    renderHeroMoodTrack();
    diaryRouteHydrating = false;

    if (replaceRoute) {
        syncDiaryRouteFromUI({ replace: true });
    }
}

function getDreamSourceText(dream) {
    return [dream?.title || '', dream?.text || '', dream?.analysis?.summary || ''].join(' ');
}

function getDreamIsoDate(dream) {
    if (dream?.isoDate) return dream.isoDate;
    if (dream?.timestamp) return new Date(dream.timestamp).toISOString().split('T')[0];
    return '';
}

function getDreamTotem(dream) {
    if (!dream) return { key: 'mist', ...TOTEM_LIBRARY.mist };
    if (dream.totem && TOTEM_LIBRARY[dream.totem]) return { key: dream.totem, ...TOTEM_LIBRARY[dream.totem] };

    const text = getDreamSourceText(dream);
    let bestKey = '';
    let bestScore = 0;

    Object.entries(TOTEM_LIBRARY).forEach(([key, meta]) => {
        const score = meta.kws.reduce((total, kw) => total + (text.includes(kw) ? 1 : 0), 0);
        if (score > bestScore) {
            bestScore = score;
            bestKey = key;
        }
    });

    const finalKey = bestKey || TOTEM_THEME_FALLBACK[dream.theme] || 'mist';
    return { key: finalKey, ...TOTEM_LIBRARY[finalKey] };
}

function getTotemSvg(key) {
    switch (key) {
        case 'forest':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 19v-4"/><path d="M5 15l2-4 2 4"/><path d="M16 19v-6"/><path d="M13 13l3-6 3 6"/><path d="M4 19h16"/></svg>`;
        case 'door':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 19V6.5a1.5 1.5 0 0 1 1.5-1.5H16v14"/><path d="M7 19h10"/><path d="M12.5 12h.01"/></svg>`;
        case 'wave':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M3 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/></svg>`;
        case 'moon':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5a7.5 7.5 0 1 0 4 13.9A8.4 8.4 0 0 1 15.5 4.5Z"/></svg>`;
        case 'mirror':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="10" rx="5.5" ry="7"/><path d="M12 17v2.5"/><path d="M9.5 21h5"/></svg>`;
        case 'stairs':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h4v-3h3v-3h3V9h4"/><path d="M5 18v-4"/><path d="M9 15v-3"/><path d="M12 12V9"/><path d="M15 9V6"/></svg>`;
        case 'bird':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13c2-3 4.5-4.5 8-4.5"/><path d="M20 13c-2-3-4.5-4.5-8-4.5"/><path d="M7 15c1.7-1.4 3.4-2 5-2s3.3.6 5 2"/></svg>`;
        case 'fire':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5c1.8 2.3 3.5 4.2 3.5 6.7A3.5 3.5 0 0 1 12 14.7a3.5 3.5 0 0 1-3.5-3.5C8.5 8.7 10.2 6.8 12 4.5Z"/><path d="M10.2 14.3c0 1.8 1 3.2 1.8 4.2.8-1 1.8-2.4 1.8-4.2"/></svg>`;
        case 'room':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18V7l7-3 7 3v11"/><path d="M5 18h14"/><path d="M9 11h6"/><path d="M12 8v6"/></svg>`;
        case 'glass':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l6 8-6 8-6-8 6-8Z"/><path d="M12 7l2.4 3H9.6L12 7Z"/></svg>`;
        case 'train':
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6h10a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2Z"/><path d="M8.5 10h7"/><path d="M9 20l1.5-3"/><path d="M15 20l-1.5-3"/></svg>`;
        case 'mist':
        default:
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10c1.2-1.2 2.3-1.8 3.5-1.8S10.8 8.8 12 10s2.3 1.8 3.5 1.8S17.8 11.2 19 10"/><path d="M4 14c1.3 1 2.6 1.5 4 1.5s2.7-.5 4-1.5 2.6-1.5 4-1.5 2.7.5 4 1.5"/></svg>`;
    }
}

function getEmotionGlyphSvg(key) {
    switch (key) {
        case '安宁':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13.8 4.8a5.8 5.8 0 1 0 0 10.4A6.7 6.7 0 0 1 13.8 4.8Z"/></svg>`;
        case '焦虑':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.8 11.4c1.7-3.3 3.3 3.3 5 0 1.8-3.4 3.3-3.4 5 0 1.8 3.4 3.3 3.3 4.4 0"/></svg>`;
        case '兴奋':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.6 11.4 8.6 16.4 10 11.4 11.4 10 16.4 8.6 11.4 3.6 10 8.6 8.6Z"/></svg>`;
        case '悲伤':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.1c1.6 2.1 3.1 4.1 3.1 6.2a3.1 3.1 0 1 1-6.2 0c0-2.1 1.5-4.1 3.1-6.2Z"/><path d="M13.6 14.2c-1 .8-2.2 1.2-3.6 1.2"/></svg>`;
        case '困惑':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10.1 4.8c2.7 0 4.5 1.5 4.5 3.8 0 2.2-1.6 3.7-3.9 3.7-1.8 0-3.1-1-3.1-2.3 0-1.1.8-1.9 2-1.9 1 0 1.8.5 2.2 1.3"/><path d="M10 14.6v.2"/></svg>`;
        case '恐惧':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 5.2c2.6 1.5 2.6 8.1 0 9.6"/><path d="M15.5 5.2c-2.6 1.5-2.6 8.1 0 9.6"/><path d="M8 10h4"/></svg>`;
        case '释然':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.8 11.2c1.2 2 3 3 5.2 3s4-1 5.2-3"/><path d="M6.2 7.2c.9 1.3 2.2 2 3.8 2s2.9-.7 3.8-2"/></svg>`;
        case '疲惫':
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7.2h10"/><path d="M5.6 12.8c1-.9 2.4-1.4 4.4-1.4s3.4.5 4.4 1.4"/></svg>`;
        default:
            return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10.1 4.8c2.7 0 4.5 1.5 4.5 3.8 0 2.2-1.6 3.7-3.9 3.7-1.8 0-3.1-1-3.1-2.3 0-1.1.8-1.9 2-1.9 1 0 1.8.5 2.2 1.3"/><path d="M10 14.6v.2"/></svg>`;
    }
}

function normalizeEmotionKey(value) {
    const text = String(value || '').trim();
    if (!text) return '困惑';
    if (EMOTION_TRACK_LIBRARY[text]) return text;

    const rules = [
        ['恐惧', ['恐惧', '害怕', '惊慌', '可怕', '压迫']],
        ['焦虑', ['焦虑', '紧张', '不安', '迟疑', '担心', '徘徊']],
        ['困惑', ['困惑', '迷惘', '迷茫', '疑惑', '看不清', '不知道']],
        ['悲伤', ['悲伤', '失落', '怀旧', '难过', '想念']],
        ['疲惫', ['疲惫', '失重', '沉重', '困倦', '下沉']],
        ['释然', ['释然', '放下', '松开', '轻松']],
        ['兴奋', ['兴奋', '激动', '雀跃', '被吸引', '期待']],
        ['安宁', ['安宁', '平静', '安静', '宁静', '平和']]
    ];

    const hit = rules.find(([, kws]) => kws.some(kw => text.includes(kw)));
    return hit ? hit[0] : '困惑';
}

function getDreamMood(dream) {
    const raw = (dream?.emotion || '').trim();
    const key = normalizeEmotionKey(raw);
    return {
        key,
        raw: raw || EMOTION_TRACK_LIBRARY[key].label,
        ...EMOTION_TRACK_LIBRARY[key]
    };
}

function renderHeroMoodTrack() {
    const host = document.getElementById('dyMoodTrack');
    if (!host) return;

    const totalDays = 11;
    const step = 47;
    const startX = 24;
    const trackWidth = startX * 2 + step * (totalDays - 1);

    const days = Array.from({ length: totalDays }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (totalDays - 1 - index));
        return {
            date,
            iso: date.toISOString().split('T')[0],
            label: formatTrackDate(date)
        };
    });

    const byDay = new Map();
    [...getTrackSourceDreams()]
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(dream => {
            const iso = getDreamIsoDate(dream);
            if (iso && !byDay.has(iso)) byDay.set(iso, dream);
        });

    const slots = days.map((day, index) => {
        const dream = byDay.get(day.iso) || null;
        const mood = dream ? getDreamMood(dream) : null;
        return {
            index,
            x: startX + index * step,
            day,
            dream,
            mood
        };
    });

    const segments = [];
    let currentSegment = [];
    slots.forEach(slot => {
        if (slot.mood) {
            currentSegment.push({ x: slot.x, y: slot.mood.level });
        } else if (currentSegment.length) {
            segments.push(currentSegment);
            currentSegment = [];
        }
    });
    if (currentSegment.length) segments.push(currentSegment);

    const pathsHtml = segments
        .map(segment => (segment.length > 1
            ? `<path class="dy-mood-track__path" d="${buildSmoothMoodPath(segment)}"></path>`
            : ''))
        .join('');

    const slotsHtml = slots.map(slot => {
        if (!slot.mood || !slot.dream) {
            return `
            <div class="dy-mood-track__slot dy-mood-track__slot--empty" style="left:${slot.x}px">
              <span class="dy-mood-track__date">${slot.day.label}</span>
            </div>`;
        }

        const title = escHtml(slot.dream.title || '未命名的梦');
        const summarySource = String(slot.dream.text || slot.dream.analysis?.summary || '').replace(/\s+/g, ' ').trim();
        const summary = summarySource ? `${escHtml(summarySource.slice(0, 26))}${summarySource.length > 26 ? '…' : ''}` : '';

        return `
        <button
          type="button"
          class="dy-mood-track__slot dy-mood-track__slot--active"
          style="left:${slot.x}px; --node-y:${slot.mood.level}px; --node-accent:${slot.mood.accent};"
        >
          <span class="dy-mood-track__glyph">${getEmotionGlyphSvg(slot.mood.key)}</span>
          <span class="dy-mood-track__dot"></span>
          <span class="dy-mood-track__date">${slot.day.label}</span>
          <span class="dy-mood-track__bubble">
            <span class="dy-mood-track__bubble-date">${slot.day.label}</span>
            <strong class="dy-mood-track__bubble-emotion">${escHtml(slot.mood.raw)}</strong>
            <span class="dy-mood-track__bubble-title">${title}</span>
            ${summary ? `<em class="dy-mood-track__bubble-summary">${summary}</em>` : ''}
          </span>
        </button>`;
    }).join('');

    host.innerHTML = `
      <div class="dy-mood-track__scene" style="width:${trackWidth}px">
        <svg class="dy-mood-track__svg" viewBox="0 0 ${trackWidth} 160" preserveAspectRatio="none" aria-hidden="true">
          ${pathsHtml}
        </svg>
        ${slotsHtml}
      </div>`;
}

function renderTotemTrack() {
    const gridEl = document.getElementById('dyTotemGrid');
    const legendEl = document.getElementById('dyTotemLegend');
    if (!gridEl || !legendEl) return;

    ensureTrackViewState();
    renderTrackControls();

    const year = trackViewYear;
    const month = trackViewMonth;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingSlots = (firstDay.getDay() + 6) % 7;
    const totalSlots = Math.ceil((leadingSlots + daysInMonth) / 7) * 7;

    const monthDreams = [...filteredDreams]
        .filter(dream => {
            const date = dream?.timestamp ? new Date(dream.timestamp) : null;
            return date && date.getFullYear() === year && date.getMonth() === month;
        })
        .sort((a, b) => b.timestamp - a.timestamp);

    const byDay = new Map();
    monthDreams.forEach(dream => {
        const iso = getDreamIsoDate(dream);
        if (iso && !byDay.has(iso)) byDay.set(iso, dream);
    });

    gridEl.innerHTML = Array.from({ length: totalSlots }, (_, index) => {
        const dayNumber = index - leadingSlots + 1;
        if (dayNumber < 1 || dayNumber > daysInMonth) {
            return `<span class="dy-totem-cell dy-totem-cell--placeholder" aria-hidden="true"></span>`;
        }

        const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        const dream = byDay.get(iso);

        if (!dream) {
            return `
            <span class="dy-totem-cell dy-totem-cell--empty" aria-label="${year} 年 ${month + 1} 月 ${dayNumber} 日，无梦境记录">
              <span class="dy-totem-cell__date">${dayNumber}</span>
              <span class="dy-totem-cell__node dy-totem-cell__node--empty">
                <span class="dy-totem-cell__mark"></span>
              </span>
            </span>`;
        }

        const totem = getDreamTotem(dream);
        const title = escHtml(dream.title || totem.label);
        return `
        <button type="button" class="dy-totem-cell dy-totem-cell--dream" onclick="openDetail('${dream.id}')" title="${title}">
          <span class="dy-totem-cell__date">${dayNumber}</span>
          <span class="dy-totem-cell__node dy-totem-cell__node--dream">
            <span class="dy-totem-cell__icon">${getTotemSvg(totem.key)}</span>
          </span>
        </button>`;
    }).join('');

    if (!monthDreams.length) {
        legendEl.innerHTML = `
        <div class="dy-track__summary-item dy-track__summary-item--empty">
          <span class="dy-track__summary-label">本月还没有梦境记录</span>
          <p>下一场被记住的梦，会先在这个月历里点亮一个日期。</p>
        </div>`;
        return;
    }

    const totemCounts = {};
    const emotionCounts = {};
    monthDreams.forEach(dream => {
        const totem = getDreamTotem(dream);
        const mood = getDreamMood(dream);
        totemCounts[totem.key] = (totemCounts[totem.key] || 0) + 1;
        emotionCounts[mood.key] = (emotionCounts[mood.key] || 0) + 1;
    });

    const [topTotemKey, topTotemCount] = Object.entries(totemCounts)
        .sort((a, b) => b[1] - a[1])[0];
    const topTotem = { key: topTotemKey, count: topTotemCount, ...TOTEM_LIBRARY[topTotemKey] };

    const [topEmotionKey, topEmotionCount] = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0];

    legendEl.innerHTML = `
      <div class="dy-track__summary-item">
        <span class="dy-track__summary-label">本月反复出现</span>
        <div class="dy-track__summary-main">
          <span class="dy-track__summary-badge">${getTotemSvg(topTotem.key)}</span>
          <div class="dy-track__summary-copy">
            <strong>${topTotem.label}（${topTotem.count} 次）</strong>
            <p>${topTotem.hint}，它最近像一种仍未说完的方向感。</p>
          </div>
        </div>
      </div>
      <div class="dy-track__summary-item dy-track__summary-item--quiet">
        <span class="dy-track__summary-label">本月主要情绪</span>
        <div class="dy-track__summary-main">
          <span class="dy-track__summary-badge dy-track__summary-badge--emotion">${getEmotionGlyphSvg(topEmotionKey)}</span>
          <div class="dy-track__summary-copy">
            <strong>${topEmotionKey}（${topEmotionCount} 次）</strong>
            <p>${EMOTION_MONTH_SUMMARIES[topEmotionKey] || '它仍在这个月的梦里轻轻停留。'}</p>
          </div>
        </div>
      </div>`;
}

/* ──────────────────────────────────────────────────
   筛选 & 排序
────────────────────────────────────────────────── */
function applyFilters(options = {}) {
    const { syncRoute = true } = options;
    const query  = (document.getElementById('dySearchInput')?.value || '').trim().toLowerCase();

    filteredDreams = getReviewSourceDreams().filter(d => {
        if (query) {
            const hay = `${d.title||''} ${d.text||''} ${d.emotion||''} ${d.theme||''}`.toLowerCase();
            if (!hay.includes(query)) return false;
        }
        return true;
    });

    filteredDreams.sort((a, b) => b.timestamp - a.timestamp);

    renderTotemTrack();
    renderHeroCount();

    if (syncRoute && !diaryRouteHydrating) {
        syncDiaryRouteFromUI({ replace: true });
    }
}

function resetFilters() {
    document.getElementById('dySearchInput').value  = '';
    document.getElementById('dySearchClear').style.display = 'none';
    applyFilters();
}

function clearSearch() {
    document.getElementById('dySearchInput').value = '';
    document.getElementById('dySearchClear').style.display = 'none';
    applyFilters();
}

function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ──────────────────────────────────────────────────
   手动记录弹窗
────────────────────────────────────────────────── */
function openWriteModal(prefill, options = {}) {
    const { skipRoute = false } = options;
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
    if (!skipRoute && !diaryRouteHydrating) syncDiaryRouteFromUI({ replace: true });
    setTimeout(() => document.getElementById('writeContent')?.focus(), 200);
}

function closeWriteModal(e, options = {}) {
    const { skipRoute = false, force = false } = options;
    if (!force && e && e.type === 'click' && e.target !== document.getElementById('writeModal')) return;
    document.getElementById('writeModal').style.display = 'none';
    document.body.style.overflow = '';
    editingId = null;
    if (!skipRoute && !diaryRouteHydrating) syncDiaryRouteFromUI({ replace: true });
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
        totem:    getDreamTotem({ title, text: content, theme }).key,
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
    renderHeroMoodTrack();
    applyFilters({ syncRoute: false });
    const wasEditing = !!editingId;
    closeWriteModal(null, { skipRoute: true, force: true });
    if (!diaryRouteHydrating) syncDiaryRouteFromUI({ replace: true });
    showToast(wasEditing ? '✅ 日记已更新' : '✨ 梦境已记录到日记！');
    editingId = null;
}

/* ──────────────────────────────────────────────────
   详情弹窗
────────────────────────────────────────────────── */
function openDetail(id, options = {}) {
    const { skipRoute = false } = options;
    const d = getReviewSourceDreams().find(x => x.id === String(id));
    if (!d) return;

    currentDetailId = String(id);
    window.currentDetailId = currentDetailId;

    document.getElementById('detailTitle').textContent =
        d.title || '无标题梦境';
    const totem = getDreamTotem(d);
    document.getElementById('detailMeta').innerHTML =
        `<span>${d.date || ''}</span>
         ${d.emotion ? `&nbsp;·&nbsp;${d.emotion}` : ''}
         ${THEME_LABELS[d.theme] ? `&nbsp;·&nbsp;${THEME_LABELS[d.theme]}` : ''}
         ${totem ? `&nbsp;·&nbsp;${totem.label}图腾` : ''}`;

    const body = document.getElementById('detailBody');
    body.innerHTML = buildDetailBody(d);

    const editBtn = document.getElementById('detailEditBtn');
    const deleteBtn = document.getElementById('detailDeleteBtn');
    const reanalyzeBtn = document.getElementById('detailReanalyzeBtn');
    const readOnlySeed = !!d.betaSeed;

    if (editBtn) editBtn.style.display = readOnlySeed ? 'none' : '';
    if (deleteBtn) deleteBtn.style.display = readOnlySeed ? 'none' : '';
    if (reanalyzeBtn) reanalyzeBtn.style.display = d.text ? '' : 'none';

    document.getElementById('detailModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (!skipRoute && !diaryRouteHydrating) syncDiaryRouteFromUI({ replace: true });

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

        if (a.reading) {
            const reading = a.reading;
            const tensions = Array.isArray(reading.keyTensions) ? reading.keyTensions : [];
            const alternatives = Array.isArray(reading.otherPossibleExplanations) ? reading.otherPossibleExplanations : [];
            const questions = Array.isArray(reading.realityQuestions) ? reading.realityQuestions : [];
            const guidance = a.actionGuidance || null;

            if (reading.coreFeeling) {
                html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-feather-pointed"></i> 梦境整理与可能解释</div>
          <div class="dy-detail-ai">
            ${a.qualityNotice ? `<div class="dy-detail-ai__title">${escHtml(a.qualityNotice)}</div>` : ''}
            <div class="dy-detail-ai__title"><i class="fas fa-wave-square"></i> 核心感受</div>
            <div class="dy-detail-ai__text">${escHtml(reading.coreFeeling)}</div>
          </div>
        </div>`;
            }

            if (tensions.length) {
                html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-arrows-left-right"></i> 画面里的关键张力</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text">
              ${tensions.map(item => `<p><strong>${escHtml(item.contrast)}</strong><br>${escHtml(item.evidence)}</p>`).join('')}
            </div>
          </div>
        </div>`;
            }

            if (reading.groundedInterpretation) {
                html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-layer-group"></i> 一种较稳妥的解释</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text">
              ${reading.groundedInterpretation.split('\n\n').map(p => `<p>${escHtml(p)}</p>`).join('')}
            </div>
          </div>
        </div>`;
            }

            if (alternatives.length) {
                html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-compass-drafting"></i> 还可能有的其他解释</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text">
              ${alternatives.map(p => `<p>${escHtml(p)}</p>`).join('')}
            </div>
          </div>
        </div>`;
            }

            if (questions.length) {
                html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-circle-question"></i> 和现实的连接问题</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text">
              ${questions.map(p => `<p>${escHtml(p)}</p>`).join('')}
            </div>
          </div>
        </div>`;
            }

            if (reading.boundaryNote) {
                html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-hand"></i> 边界提示</div>
          <div class="dy-detail-ai">
            <div class="dy-detail-ai__text"><p>${escHtml(reading.boundaryNote)}</p></div>
          </div>
        </div>`;
            }

            if (guidance && (guidance.actionBody || guidance.directionBody)) {
                html += `
        <div class="dy-detail-section">
          <div class="dy-detail-section__head"><i class="fas fa-route"></i> 如果你想继续整理</div>
          <div class="dy-detail-ai">
            ${guidance.actionBody ? `<div class="dy-detail-ai__title">${escHtml(guidance.actionCue || '如果你想继续整理')}</div><div class="dy-detail-ai__text"><p>${escHtml(guidance.actionBody)}</p></div>` : ''}
            ${guidance.directionBody ? `<div class="dy-detail-ai__title">${escHtml(guidance.directionCue || '接下来可以留意')}</div><div class="dy-detail-ai__text"><p>${escHtml(guidance.directionBody)}</p></div>` : ''}
          </div>
        </div>`;
            }

        } else {

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

function closeDetailModal(e, options = {}) {
    const { skipRoute = false } = options;
    if (e && e.type === 'click' && e.target !== document.getElementById('detailModal')) return;
    document.getElementById('detailModal').style.display = 'none';
    document.body.style.overflow = '';
    currentDetailId = null;
    window.currentDetailId = currentDetailId;
    if (!skipRoute && !diaryRouteHydrating) syncDiaryRouteFromUI({ replace: true });
}

/* ──────────────────────────────────────────────────
   编辑 / 删除 / 重新解析
────────────────────────────────────────────────── */
function editEntry(id) {
    const d = allDreams.find(x => x.id === String(id));
    if (!d) return;
    closeDetailModal(null, { skipRoute: true });
    openWriteModal(d);
}

async function deleteEntry(id) {
    const idx = allDreams.findIndex(x => x.id === String(id));
    if (idx === -1) return;

    const confirmed = typeof showConfirmDialog === 'function'
        ? await showConfirmDialog({
            title: '删除这条梦境记录？',
            message: '删除后将无法恢复。如果这是内测数据，建议先导出 TXT 再删除。',
            confirmText: '确认删除',
            cancelText: '取消',
            tone: 'danger'
        })
        : confirm('确定删除这条梦境记录吗？');

    if (!confirmed) return;

    allDreams.splice(idx, 1);
    saveDreams(allDreams);
    renderHeroMoodTrack();
    applyFilters({ syncRoute: false });
    closeDetailModal(null, { skipRoute: true });
    if (!diaryRouteHydrating) syncDiaryRouteFromUI({ replace: true });
    showToast('🗑️ 已删除该梦境记录');
}

function reanalyze(id) {
    const d = getReviewSourceDreams().find(x => x.id === String(id));
    if (!d || !d.text) { showToast('无法获取梦境内容'); return; }

    // 将内容带到解析页
    sessionStorage.setItem('dreamlens_reanalyze', d.text);
    window.location.href = 'analyze.html?source=reanalyze';
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
    saveDreams([]);
    renderHeroMoodTrack();
    applyFilters({ syncRoute: false });
    document.getElementById('clearModal').style.display  = 'none';
    closeDetailModal(null, { skipRoute: true });
    closeWriteModal(null, { skipRoute: true, force: true });
    if (!diaryRouteHydrating) syncDiaryRouteFromUI({ replace: true });
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
window.exportDiary       = exportDiary;
window.confirmClearAll   = confirmClearAll;
window.clearAllDreams    = clearAllDreams;
