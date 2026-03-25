/* ====================================================
   DreamLens - analyze.js  梦境解析页面逻辑
   v2 — 解析内容严格基于用户输入原文动态生成
==================================================== */

/* ============================================================
   示例梦境（仅用于插入示例）
============================================================ */
const INLINE_EXAMPLE_DREAM = `我梦见自己走进一片发光的森林，树叶像玻璃一样轻轻作响。远处有一扇半开的门，门后不断传来海浪声。我想靠近，却总感觉脚下的地面在缓慢下沉。醒来时我没有特别害怕，反而有一种奇怪的平静和迟疑。`;

/* ============================================================
   象征词库：从梦境文本中识别意象并生成解读
============================================================ */
const SYMBOL_LIBRARY = [
    { keywords:['海','海洋','大海','海水'],   name:'海洋',     meaning:'荣格心理学中集体无意识的经典象征，代表你内心深处尚未被探索的情感领域与潜在能量' },
    { keywords:['水','河','湖','溪','雨'],    name:'水',       meaning:'情绪与潜意识的流动，水的状态映射你当下内心的波动——平静或汹涌都是真实感受的外化' },
    { keywords:['鱼'],                        name:'鱼',       meaning:'东西方共同的智慧与丰盛象征，在你的梦中代表内在潜能与直觉力，等待被发现和运用' },
    { keywords:['追','追逐','被追'],           name:'被追逐',   meaning:'逃避某种现实压力或未解决的冲突，追逐者往往是你压抑的某个内在面向正试图引起注意' },
    { keywords:['跑','奔跑','逃跑','逃'],      name:'奔跑',     meaning:'行动力与逃避机制并存，身体的跑动象征你在现实中某个领域的能量消耗与焦虑状态' },
    { keywords:['腿','腿重','灌铅'],           name:'腿沉无力', meaning:'感到被束缚或行动力受阻，对应现实中拖延已久、迟迟无法推进的某件重要事务' },
    { keywords:['坠落','掉落','下落','落下'],  name:'坠落',     meaning:'原型意义上的"死亡-重生"循环，失去控制感或从旧有状态脱离，往往预示一次深刻转化' },
    { keywords:['飞','飞翔','飞起'],           name:'飞翔',     meaning:'心理层面的自由感与超越，自我超越的最强烈象征之一，暗示突破限制的内在渴望' },
    { keywords:['森林','树林','丛林'],         name:'森林',     meaning:'集体无意识与原始智慧的领域，代表尚未被理性照亮的心灵空间，充满未知的可能性' },
    { keywords:['树','大树','古树'],           name:'树',       meaning:'生命力与根基的象征，树的状态折射你当下的成长状态与内心的稳定感' },
    { keywords:['门','大门','木门'],           name:'门',       meaning:'荣格原型中的"阈限"象征，代表从已知世界向未知转变的机会，等待你做出选择' },
    { keywords:['光','光芒','亮光','光线'],    name:'光',       meaning:'意识与洞察力的象征，在梦境黑暗处出现的光往往代表指引方向的内在智慧' },
    { keywords:['黑暗','暗','黑'],            name:'黑暗',     meaning:'未知、恐惧或尚未整合的心理内容，但同时也是潜能孕育的空间，并非单纯负面' },
    { keywords:['镜','镜子','镜像'],          name:'镜子',     meaning:'自我认知与身份探索，镜中的影像折射你对自身多个面向的感知与内心的矛盾' },
    { keywords:['房子','房间','家','屋'],      name:'家/房屋',  meaning:'弗洛伊德体系中自我人格的象征，房间的状态与布局反映你内心世界的结构与秩序感' },
    { keywords:['山','山峰','爬山'],          name:'山',       meaning:'人生目标与精神追求的象征，攀登过程折射你面对挑战时的态度与内心的毅力' },
    { keywords:['星','星星','星空'],          name:'星空',     meaning:'超越日常的精神向往，代表内心深处对宇宙连接感与生命意义的渴望' },
    { keywords:['人','陌生人','人物','人影'],  name:'人物',     meaning:'梦中出现的人物往往是你内心某个面向的投射，陌生人尤其代表尚未整合的自我部分' },
    { keywords:['建筑','楼','大楼','高楼'],   name:'建筑物',   meaning:'人类文明与社会结构的象征，建筑的形态折射你对外部世界秩序与稳定性的感知' },
    { keywords:['迷路','迷失','找不到路'],     name:'迷路',     meaning:'人生方向感的暂时缺失，或处于重要转折点前的迷茫期，是内心寻找新地图的信号' },
    { keywords:['死','死亡','死去'],          name:'死亡',     meaning:'荣格心理学中转化与蜕变的象征，梦中死亡通常不预示真实死亡，而是某阶段的结束与新生' },
    { keywords:['水下','深处','深海'],        name:'深处',     meaning:'潜意识的深层区域，进入"深处"象征你愿意探索内心最核心、最真实的部分' },
    { keywords:['城市','街道','马路'],        name:'城市街道', meaning:'社会环境与人际网络的象征，扭曲或迷宫般的街道折射你对外部世界复杂性的感受' },
    { keywords:['钥匙'],                      name:'钥匙',     meaning:'解决问题或开启新阶段的能力，你已经拥有打开某扇门所需的一切' },
    { keywords:['时钟','时间','表'],          name:'时间/时钟',meaning:'对时间流逝的焦虑或对某个人生节点的感知，提示你审视自己与时间的关系' }
];

/* ============================================================
   情绪识别词库（用于动态构建情绪能量条）
============================================================ */
const EMOTION_PATTERNS = [
    { label:'宁静', keywords:['宁静','平静','安静','祥和','守护','安全','温暖'], color:'linear-gradient(90deg,#6366f1,#8b5cf6)', base:40 },
    { label:'焦虑', keywords:['焦虑','紧张','危机','害怕','担心','不安','恐惧','慌','急'], color:'linear-gradient(90deg,#f59e0b,#ef4444)', base:35 },
    { label:'神秘', keywords:['神秘','奇怪','奇异','诡异','陌生','不可思议','诡'], color:'linear-gradient(90deg,#a78bfa,#c084fc)', base:45 },
    { label:'自由', keywords:['自由','解脱','飞','翱翔','释放','轻盈'], color:'linear-gradient(90deg,#6366f1,#a78bfa)', base:30 },
    { label:'迷惘', keywords:['迷失','迷路','困惑','不知道','找不到','不明白'], color:'linear-gradient(90deg,#6b7280,#a78bfa)', base:35 },
    { label:'恐惧', keywords:['恐惧','惊恐','吓','恐怖','可怕','吓到'], color:'linear-gradient(90deg,#dc2626,#991b1b)', base:20 },
    { label:'好奇', keywords:['好奇','探索','发现','奇妙','有趣','不可思议'], color:'linear-gradient(90deg,#06b6d4,#3b82f6)', base:35 },
    { label:'压迫', keywords:['压迫','压力','重压','沉重','压抑','憋','灌了铅'], color:'linear-gradient(90deg,#ef4444,#dc2626)', base:20 }
];

/* ============================================================
   心理学解读框架（不同主题对应不同视角）
============================================================ */
const PSYCH_FRAMEWORKS = {
    water:  { archetype:'水元素原型', framework:'荣格分析心理学',   hint:'水域梦境是自我与无意识沟通最直接的渠道' },
    chase:  { archetype:'阴影原型',   framework:'荣格/阿德勒心理学', hint:'追逐梦折射被压抑的内在力量渴望被整合' },
    fall:   { archetype:'蜕变原型',   framework:'原型心理学',        hint:'坠落是最古老的转化象征，暗示旧模式的解体' },
    forest: { archetype:'迷途英雄',   framework:'英雄旅程理论',       hint:'迷失与发现是个体化进程的必要阶段' },
    fly:    { archetype:'超越原型',   framework:'人本主义心理学',     hint:'飞翔代表自我实现的最高体验' },
    house:  { archetype:'自性原型',   framework:'弗洛伊德/荣格',      hint:'房屋是人格结构最直接的外化形式' },
    death:  { archetype:'死亡-重生',  framework:'原型心理学',         hint:'梦中死亡是最强烈的转化信号' },
    light:  { archetype:'智慧原型',   framework:'分析心理学',         hint:'光是意识与洞察力的普遍象征' },
    general:{ archetype:'自性探索',   framework:'荣格整合心理学',     hint:'梦境是心灵进行自我调节与整合的工具' }
};

/* ============================================================
   主题标签库（根据梦境主题动态生成标签）
============================================================ */
const TAG_LIBRARY = {
    water:  [{ text:'潜意识探索', cls:'tag-purple' }, { text:'情感深度', cls:'tag-blue' }, { text:'内在智慧', cls:'tag-teal' }],
    chase:  [{ text:'焦虑模式',  cls:'tag-orange' }, { text:'阴影整合', cls:'tag-purple' }, { text:'压力信号', cls:'tag-pink' }],
    fall:   [{ text:'蜕变象征',  cls:'tag-teal'  }, { text:'放手与转化', cls:'tag-purple' }, { text:'重生原型', cls:'tag-orange' }],
    forest: [{ text:'迷途探索',  cls:'tag-teal'  }, { text:'指引象征',  cls:'tag-blue'  }, { text:'自性寻找', cls:'tag-purple' }],
    fly:    [{ text:'超越象征',  cls:'tag-blue'  }, { text:'自由渴望',  cls:'tag-teal'  }, { text:'自我实现', cls:'tag-purple' }],
    house:  [{ text:'人格探索',  cls:'tag-purple' }, { text:'内心空间',  cls:'tag-teal'  }, { text:'自我认知', cls:'tag-blue' }],
    death:  [{ text:'转化信号',  cls:'tag-orange' }, { text:'结束与新生', cls:'tag-teal'  }, { text:'深度蜕变', cls:'tag-purple' }],
    light:  [{ text:'洞察觉醒',  cls:'tag-teal'  }, { text:'方向指引',  cls:'tag-blue'  }, { text:'意识扩展', cls:'tag-purple' }],
    general:[{ text:'潜意识信息', cls:'tag-purple' }, { text:'心灵信号',  cls:'tag-teal'  }, { text:'内在探索', cls:'tag-blue' }]
};

/* ============================================================
   核心：从用户输入动态生成解析内容
============================================================ */
function analyzeUserDream(rawText) {
    const text = rawText.trim();

    /* 1. 识别梦境主题 */
    const theme = detectTheme(text);

    /* 2. 从文本提取关键意象（最多4个） */
    const symbols = extractSymbols(text);

    /* 3. 计算情绪能量 */
    const emotions = calcEmotions(text);

    /* 4. 选取标签 */
    const tags = TAG_LIBRARY[theme] || TAG_LIBRARY.general;

    /* 5. 选取框架 */
    const fw = PSYCH_FRAMEWORKS[theme] || PSYCH_FRAMEWORKS.general;

    /* 6. 动态生成各节文字 */
    const title    = buildTitle(text, theme);
    const summary  = buildSummary(text, theme, symbols);
    const psych    = buildPsychology(text, theme, fw, symbols);
    const uncon    = buildUnconscious(text, theme, symbols);
    const advice   = buildAdvice(text, theme, symbols);

    return { title, theme, tags, summary, symbols, emotions, psychology: psych, unconscious: uncon, advice };
}

/* ── 主题检测 ── */
function detectTheme(text) {
    const rules = [
        { theme:'water',  kws:['海','水','鱼','游','深','溪','河','湖','水下','游泳','波浪'] },
        { theme:'chase',  kws:['追','被追','跑','逃','腿','危险','追逐','躲','跑步'] },
        { theme:'fall',   kws:['坠落','掉落','落下','坠','落','高楼','落地'] },
        { theme:'fly',    kws:['飞','飞翔','飞起','腾空','悬浮','漂浮'] },
        { theme:'forest', kws:['森林','树林','树木','丛林','树','森','找','迷'] },
        { theme:'house',  kws:['房子','家','房间','屋','宫殿','建筑','楼','回家'] },
        { theme:'death',  kws:['死','死亡','死去','消失','告别'] },
        { theme:'light',  kws:['光','光芒','亮','照耀','发光','星','星空'] }
    ];

    let best = { theme: 'general', score: 0 };
    for (const r of rules) {
        const score = r.kws.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
        if (score > best.score) best = { theme: r.theme, score };
    }
    return best.theme;
}

/* ── 提取象征意象 ── */
function extractSymbols(text) {
    const found = [];
    for (const sym of SYMBOL_LIBRARY) {
        if (sym.keywords.some(kw => text.includes(kw))) {
            found.push({ name: sym.name, meaning: sym.meaning });
        }
        if (found.length >= 4) break;
    }

    // 如果命中不足2个，加通用兜底
    if (found.length === 0) {
        found.push({ name: '梦境场景', meaning: '你所处的梦境空间折射当前心理状态，每一个细节都是潜意识精心构建的意象' });
        found.push({ name: '自我形象', meaning: '梦中的"我"往往不完全等同于现实的你，它代表当下你对自身某一面向的感知与认同' });
    }
    if (found.length === 1) {
        found.push({ name: '情绪氛围', meaning: '梦境整体的情绪色彩是最重要的信号，你醒来时残留的感受往往比具体情节更能揭示内心真实状态' });
    }

    return found.slice(0, 4);
}

/* ── 计算情绪能量 ── */
function calcEmotions(text) {
    const results = EMOTION_PATTERNS.map(ep => {
        const hits  = ep.keywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
        const boost = hits * 18;
        const pct   = Math.min(95, Math.max(10, ep.base + boost + Math.floor(Math.random() * 12)));
        return { label: ep.label, pct, color: ep.color, hits };
    });

    // 取命中最多的4条（保证有足够多样性）
    results.sort((a, b) => b.hits - a.hits || b.pct - a.pct);
    const top = results.slice(0, 4);
    top.sort((a, b) => b.pct - a.pct);
    return top;
}

/* ── 构建标题 ── */
function buildTitle(text, theme) {
    const titleMap = {
        water:  '水的召唤',
        chase:  '追逐与困缚',
        fall:   '坠落中的蜕变',
        fly:    '飞翔的自由',
        forest: '森林里的寻找',
        house:  '家的秘密',
        death:  '终结与新生',
        light:  '光的指引',
        general:'心灵的信使'
    };

    // 尝试从原文中提取第一个名词意象作为标题前缀
    const firstSymbol = SYMBOL_LIBRARY.find(s => s.keywords.some(kw => text.includes(kw)));
    const prefix = firstSymbol ? firstSymbol.name : '梦境';

    const base = titleMap[theme] || '心灵的信使';
    return theme === 'general' ? `${prefix}的低语` : base;
}

/* ── 构建摘要（严格引用用户原文）── */
function buildSummary(text, theme, symbols) {
    // 截取用户原文前60字作为引用锚点
    const excerpt = text.slice(0, 60).replace(/\n/g, '，');
    const symNames = symbols.slice(0, 2).map(s => s.name).join('与');

    const intros = {
        water:  `你描述了「${excerpt}…」这段梦境。其中${symNames}共同构成了潜意识深海的意象——`,
        chase:  `你描述了「${excerpt}…」这段梦境。被追逐与逃跑的核心动作，以及${symNames}等意象，揭示了——`,
        fall:   `你描述了「${excerpt}…」这段梦境。坠落的过程与${symNames}相互交织，构成了——`,
        fly:    `你描述了「${excerpt}…」这段梦境。飞翔与${symNames}共同编织出一幅——`,
        forest: `你描述了「${excerpt}…」这段梦境。在${symNames}交织的场景中，你的潜意识正在——`,
        house:  `你描述了「${excerpt}…」这段梦境。${symNames}在梦境中的出现，深刻映射了——`,
        death:  `你描述了「${excerpt}…」这段梦境。其中涉及的转化意象与${symNames}，共同指向——`,
        light:  `你描述了「${excerpt}…」这段梦境。光与${symNames}的交汇，构成了——`,
        general:`你描述了「${excerpt}…」这段梦境。其中${symNames}等核心意象，共同传递了——`
    };

    const conclusions = {
        water:  '你的心灵正以水的方式与你对话。深海象征你尚未触达的内在潜能，你在其中自如游弋，说明此刻你与潜意识的关系是开放而非对抗的。这是一个值得深入倾听内心声音的时机。',
        chase:  '一种持续的内在压力正在寻求出口。这个梦并非预兆，而是心灵的减压阀——它帮助你在睡眠中安全地处理白天积压的焦虑能量。追逐者往往不是外在威胁，而是你内心某个渴望被承认的面向。',
        fall:   '一次深刻的内在转化信号。坠落在荣格心理学中从不单纯代表失败，它是旧有模式解体、新的自我准备破茧的前兆。你梦中坠落的方式与感受，精确揭示了你当下心理转化的深度与方向。',
        fly:    '自由与超越的强烈渴望。飞翔梦是人类最正面的梦境原型之一，它出现的时刻，往往正是你内心突破某种限制的临界点。你的潜意识在告诉你：翅膀已经准备好了。',
        forest: '你的心灵正处于一段重要的内在旅程中。迷失在森林是英雄旅程的经典开端——旧有的"地图"已经失效，新的方向尚未清晰。这不是迷失，而是蜕变前必要的过渡期。',
        house:  '你的梦境正在展示你内心世界的结构。在心理学中，房屋是最能直接映射人格状态的意象。梦中每一个房间、每一道门，都对应着你内心的某个区域。',
        death:  '这是潜意识最有力的转化信号之一。梦中的死亡在心理学中几乎从不预示真实死亡，它象征某个生命阶段的完成，以及新阶段即将破晓。你已经在心理层面准备好告别某个旧的自己了。',
        light:  '你的内心正在呼唤更清晰的方向与智慧。光在梦境中出现，往往代表意识的扩展与洞察力的降临。你的潜意识正在以光的形式向你传递某种重要的指引信息。',
        general:'你的潜意识正在精心构建一段信息传递。每一个梦境细节都不是随机的——它们是你内心深处对当下生命状态最诚实的表达，值得你安静地去倾听与感受。'
    };

    const intro      = intros[theme]      || intros.general;
    const conclusion = conclusions[theme] || conclusions.general;
    return intro + conclusion;
}

/* ── 构建心理学解读 ── */
function buildPsychology(text, theme, fw, symbols) {
    const excerpt   = text.slice(0, 45).replace(/\n/g, '，');
    const symNames  = symbols.map(s => s.name).join('、');

    const para1 = `从${fw.framework}的视角来审视你的梦境「${excerpt}…」，${fw.hint}。`;

    const para2Map = {
        water:  `荣格将深水视为集体无意识最直接的入口。你梦中出现的${symNames}，构成了一次典型的"降入无意识"体验。你能够在水中自如行动（而非溺水），表明你的自我（Ego）与无意识之间存在相对和谐的对话关系，你正处于向内探索的成熟时机。`,
        chase:  `阿德勒将追逐梦解读为"优越感追求"受阻的体现——当你在现实中感到被某种力量评判或压制时，梦境会以追逐的形式重演这种感受。荣格则更进一步：追逐者正是你的"阴影（Shadow）"——那些被自己否定或压抑的人格面向，积累了足够能量后开始主动出现在梦中，要求被整合。`,
        fall:   `认知神经科学研究发现，坠落感常与前庭系统的夜间自发激活有关，但其心理意涵远不止于此。你梦中的${symNames}共同构成了一幅"失控-接受-超越"的心理叙事。在荣格理论中，这被视为"个体化进程（Individuation）"的重要推进信号——心理能量正在向更高层次整合。`,
        fly:    `飞翔梦在人本主义心理学中被视为"自我实现体验"的睡眠版本——马斯洛所描述的高峰体验，有时会以飞翔的形式出现在梦境中。你梦中的${symNames}，是你内心突破既有边界的生动表达。这种梦往往出现在人真正开始相信自己能力的临界点上。`,
        forest: `坎贝尔的英雄旅程理论与你的梦境高度吻合：进入森林（离开舒适区）→ 迷失方向（旧有认知地图失效）→ 发现象征性目标（内在召唤出现）。你梦中的${symNames}，是这段旅程各阶段的具体呈现。"知道在寻找什么但说不清楚"，正是直觉超越语言理解的典型信号。`,
        house:  `弗洛伊德与荣格都将房屋视为人格整体的隐喻——地下室象征压抑内容，阁楼象征理想与记忆，不同房间代表人格的不同面向。你梦中涉及的${symNames}，精确映射了你当下内心世界中正被关注或正在经历变动的区域。`,
        death:  `荣格明确指出，梦中死亡是转化最强烈的符号，几乎从不应被字面解读。你梦中的${symNames}共同构成了一个"阶段性终结"的仪式场景。在原型心理学中，这与凤凰涅槃、种子破土同属一个象征族群——必须先有某种形式的"死去"，新的自我才能破壳而出。`,
        light:  `在分析心理学中，光代表意识的扩张与阿尼玛/阿尼姆斯原型的活跃。你梦中的${symNames}与光共同出现，标志着一次内在洞察正在发生。这种梦往往出现在人生临界点——当你需要做出重要决定，或即将经历认知层面的重大更新时。`,
        general:`你的梦境涉及${symNames}等意象，在荣格的象征体系中，这些元素共同构成了心灵自我调节机制的外化表达。${fw.hint}。梦境不是预言，而是你内心正在进行的"无声对话"——自我（Ego）与更广阔的自性（Self）之间的协商与整合。`
    };

    const para2 = para2Map[theme] || para2Map.general;

    const para3 = `值得注意的是：解析梦境不是为了找到"唯一正确的答案"，而是为了借助这些意象，与自己内心深处进行一次更诚实的对话。你对这段解析产生共鸣的部分，往往才是真正属于你的信息。`;

    return [para1, para2, para3].join('\n\n');
}

/* ── 构建潜意识信息 ── */
function buildUnconscious(text, theme, symbols) {
    const excerpt  = text.slice(0, 40).replace(/\n/g, '，');
    const sym1     = symbols[0]?.name || '梦境意象';
    const sym2     = symbols[1]?.name || '情绪感受';

    const msgMap = {
        water:  [`「${sym1}」在提醒你：有一部分内在智慧正在等待你的注意，不要用过度理性压制那些直觉性的感受与判断。`, `你在水中自如呼吸的能力，是你的潜意识在告诉你：即便在压力与不确定中，你也有适应与生存的内在资源。`, `此刻是向内倾听的好时机——不是为了找答案，而是为了感受那些还没有语言的内在信息。`],
        chase:  [`「${sym1}」代表的那股力量，不是来自外部的威胁，而是你内心某个长期被忽视的需求或情感，它终于耐不住寂寞了。`, `你在梦中感受到的无力与被困，映射着现实中某件你一直在回避的事——是时候停下来，正面看一眼它了。`, `你的身体和心理都在告诉你：需要一些真正的休息与自我关怀，而不仅仅是继续撑下去。`],
        fall:   [`坠落本身不是惩罚，而是邀请——邀请你放下某个一直紧抓不放的执念或身份认同，它已经完成了它的使命。`, `「${sym2}」让你意识到：失去控制感并没有你以为的那么可怕，你的内心比你自知的更有承受转变的能力。`, `你正站在一个人生阶段的边界处，前面的路还不清晰，但你的潜意识已经知道你会落稳、甚至飞起来。`],
        fly:    [`你已经拥有自己以为还没有的能力与自由，只是还没有在现实中充分承认和运用它。`, `「${sym1}」象征的边界或限制，其实比你以为的更薄——你的内心已经准备好去尝试那件一直想做却迟疑的事了。`, `这个梦是你的潜意识在给你的许可证：可以更大胆地去活了。`],
        forest: [`有一个方向、机会或内在召唤已经在你面前了，你感觉到了它的存在，但还没有完全确认——那扇「${sym1}」就在那里，等你。`, `遮天的树木象征某些外部期望或内在信念正在遮蔽你的方向感，你需要找回属于自己的判断坐标。`, `迷路不是终点，是转折点的开始。你现在的困惑，正是蜕变所必须经历的过渡地带。`],
        house:  [`梦中的「${sym1}」正在映射你内心某个需要关注的区域——那里有一些情绪或记忆，在等待被温柔地看见。`, `你对家与安全感的感受，正在经历一次重要的重新定义。什么才是真正让你有归属感的所在？`, `你比自己以为的更了解自己内心的结构——梦中的每一个细节，都是你对自身最诚实的描述。`],
        death:  [`梦中的终结象征你已经在心理层面准备好结束某个阶段了——某段关系的模式、某种自我认同、或某种处世方式。`, `「${sym1}」不是失去，而是转化的原材料。你正在经历的，是生命中最有深度的成长时刻之一。`, `告别需要勇气，但你的内心深处已经知道：在那扇关上的门后面，新的空间正在开放。`],
        light:  [`有一个答案或方向，你其实已经知道了，只是还没有勇气承认它、说出它。`, `「${sym1}」正在提示你：信任那些直觉性的感受，它们在这个时刻比理性分析更接近真相。`, `你的内心正处于一次意识扩展期，愿意被更多的光照进来——这是成长最真实的样子。`],
        general:[`「${sym1}」在你的梦中出现，是潜意识选择的特定信使，它想让你在某个被忽略的内在区域停留更久一些。`, `你的梦境整体情绪比具体内容更重要——醒来时那份残留的感受，往往才是最直接的内心信息。`, `此刻你的潜意识正在进行某种整合与自我调节，即便你还感受不到，过程已经在发生了。`]
    };

    const msgs = msgMap[theme] || msgMap.general;
    return msgs.map((m, i) => `${['①','②','③'][i]} ${m}`).join('\n\n');
}

/* ── 构建行动建议 ── */
function buildAdvice(text, theme, symbols) {
    const sym1 = symbols[0]?.name || '这个梦境';

    const adviceMap = {
        water:  [`① 今晚或明早花10分钟写下梦境全貌，不加评判，只是记录——你会发现更多细节在书写中浮现。`, `② 近期如有直觉性的判断或感受，值得认真对待，不要急着用理性否定它们。`, `③ 可以尝试一次安静的冥想，专注于水的意象，允许内心的声音不被打扰地浮现。`],
        chase:  [`① 列出最近让你感到"被追赶"的三件事，然后问自己：哪一件可以今天做出一个小的行动？`, `② 关注身体信号——长期的压力追逐梦往往伴随着睡眠质量下降，现在可能需要真正的休息。`, `③ 如果梦境反复出现，考虑与信任的人聊聊那个让你"一直在逃"的具体事情。`],
        fall:   [`① 审视生活中你一直"抓着不放"的某件事或某段关系模式，问自己：如果放手，最坏会发生什么？`, `② 把握近期的转机——坠落梦往往在变化期出现，保持开放，不要过度控制结果。`, `③ 用日记记录这段时期，你正在经历的可能是一个重要章节的开端。`],
        fly:    [`① 今天做一件平时因为害怕而没有去做的小事，哪怕很小——飞翔从第一步开始。`, `② 写下你心中那件"想做但一直在等待时机"的事，问自己：等待的理由是否真的存在？`, `③ 和一个能看见你真实能力的人谈谈你的想法，外部确认有时能打破内在的自我设限。`],
        forest: [`① 给自己一段不被打扰的独处时间，带着这个问题坐下来：「那扇门背后，我真正想要的是什么？」`, `② 不要等到"准备好了"才迈出第一步——门就在那里，推开的那一刻即是开始。`, `③ 尝试自由书写20分钟（不加任何审查），那个"说不清楚的目标"往往会在文字中逐渐浮现。`],
        house:  [`① 花一点时间回忆梦中房屋的细节，每一个让你有强烈感受的空间，都值得问一句：这对应我生活中的哪个区域？`, `② 清理一个真实的物理空间（哪怕只是抽屉），往往能同步疏通内心对应的情绪积压。`, `③ 和内心那个在梦中房屋里的"你"对话：它需要什么？你能给它什么？`],
        death:  [`① 思考你的生命中现在有什么"已经结束但还没有正式告别"的东西——给它一个仪式性的道别。`, `② 为即将开始的新阶段留出空间：清空一些旧的习惯、旧的关系模式或旧的自我叙事。`, `③ 允许自己在这个过渡期感到不确定，转化需要时间，给自己耐心与温柔。`],
        light:  [`① 今天写下你内心那个"已经知道但还没有说出来"的答案或决定——光已经在那里了。`, `② 信任直觉：在接下来一周，有意识地留意那些反复出现的直觉性感受，记录下来。`, `③ 减少外部噪音，给自己更多安静的时间——洞察力在安静中生长。`],
        general:[`① 写下梦境记录，尤其是醒来时最强烈的情绪感受——那往往比任何细节都更直接地指向你内心的状态。`, `② 在今天找一个安静的时刻，带着梦中那份感受坐上几分钟，不分析，只感受。`, `③ 如果这个梦反复出现，值得更认真地对待——它在尝试告诉你某件重要的事。`]
    };

    return (adviceMap[theme] || adviceMap.general).join('\n\n');
}

/* ============================================================
   全局状态 & DOM 懒获取
============================================================ */
let selectedEmotion = '';
let analysisResult  = null;
let isExampleExpanded = false;
let analysisTransitionTimer = null;
let loadingPhaseInterval = null;
let loadingPhaseFinishTimer = null;
let loadingPhasePulseTimer = null;
const dreamClueModuleState = {
    rawText: '',
    clues: [],
    selectedId: '',
    previewId: ''
};
const LOADING_PHASE_IDS = ['loadingPhase1', 'loadingPhase2', 'loadingPhase3', 'loadingPhase4'];
const LOADING_STEP_IDS = ['loadingStep1', 'loadingStep2', 'loadingStep3', 'loadingStep4'];
const ANALYZE_DRAFT_STORAGE_KEY = 'dreamlens_analyze_draft_v1';
const ANALYZE_RESULT_STORAGE_KEY = 'dreamlens_analyze_result_v1';

function getTextarea()  { return document.getElementById('dreamInput'); }
function getCharCount() { return document.getElementById('charCount'); }
function getExampleToggleBtn() { return document.getElementById('exampleToggleBtn'); }
function getAnalyzeButton() { return document.getElementById('analyzeBtn'); }
function formatDreamLength(len) { return `${len} 字`; }

function getVoiceInputArea() {
    return document.getElementById('voiceInputArea');
}

function isVoiceModeVisible() {
    const voiceArea = getVoiceInputArea();
    return !!(voiceArea && getComputedStyle(voiceArea).display !== 'none');
}

function getUnifiedDreamInput() {
    const ta = getTextarea();
    const voiceDraft = typeof window.getVoiceDraftText === 'function'
        ? window.getVoiceDraftText()
        : '';

    if (isVoiceModeVisible() && voiceDraft) {
        if (ta && ta.value !== voiceDraft) {
            ta.value = voiceDraft;
            ta.dispatchEvent(new Event('input'));
        }
        return voiceDraft;
    }

    return ta ? ta.value.trim() : '';
}

function syncCharCount(len) {
    const cc = getCharCount();
    if (!cc) return;
    cc.textContent = formatDreamLength(len);
    cc.style.color = len > 1800 ? '#f59e0b' : '';
}

function syncExampleToggleUI() {
    const btn = getExampleToggleBtn();
    if (!btn) return;
    btn.textContent = isExampleExpanded ? '收起示例' : '插入示例';
}

function setAnalyzeButtonLoading(isLoading) {
    const btn = getAnalyzeButton();
    if (!btn) return;
    btn.classList.toggle('is-loading', !!isLoading);
    btn.disabled = !!isLoading;
    btn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
}

function normalizeAnalyzeView(view) {
    return ['input', 'loading', 'result'].includes(view) ? view : 'input';
}

function normalizeAnalyzeMode(mode) {
    return mode === 'voice' ? 'voice' : 'text';
}

function readAnalyzeRouteState() {
    const url = new URL(window.location.href);
    return {
        view: normalizeAnalyzeView(url.searchParams.get('view') || 'input'),
        mode: normalizeAnalyzeMode(url.searchParams.get('mode') || 'text'),
        source: url.searchParams.get('source') || '',
        hash: window.location.hash || ''
    };
}

function updateAnalyzeRouteState(nextState = {}, options = {}) {
    const { replace = true } = options;
    const url = new URL(window.location.href);
    const current = readAnalyzeRouteState();
    const merged = {
        view: normalizeAnalyzeView(nextState.view || current.view),
        mode: normalizeAnalyzeMode(nextState.mode || current.mode),
        source: typeof nextState.source === 'string' ? nextState.source : current.source
    };

    if (merged.view === 'input') url.searchParams.delete('view');
    else url.searchParams.set('view', merged.view);

    if (merged.mode === 'text') url.searchParams.delete('mode');
    else url.searchParams.set('mode', merged.mode);

    if (merged.source) url.searchParams.set('source', merged.source);
    else url.searchParams.delete('source');

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function persistAnalyzeDraft(text) {
    try {
        const draft = (text || '').trim();
        if (draft) sessionStorage.setItem(ANALYZE_DRAFT_STORAGE_KEY, draft);
        else sessionStorage.removeItem(ANALYZE_DRAFT_STORAGE_KEY);
    } catch (_) {}
}

function loadAnalyzeDraft() {
    try {
        return sessionStorage.getItem(ANALYZE_DRAFT_STORAGE_KEY) || '';
    } catch (_) {
        return '';
    }
}

function persistAnalyzeResultSnapshot(input, result) {
    try {
        sessionStorage.setItem(ANALYZE_RESULT_STORAGE_KEY, JSON.stringify({
            input,
            result,
            selectedEmotion,
            savedAt: Date.now()
        }));
    } catch (_) {}
}

function loadAnalyzeResultSnapshot() {
    try {
        const raw = sessionStorage.getItem(ANALYZE_RESULT_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

function setAnalyzeViewState(view) {
    const normalized = normalizeAnalyzeView(view);
    document.body.dataset.analyzeView = normalized;
    const wrap = document.getElementById('analyzeWrap');
    if (wrap) wrap.dataset.view = normalized;
}

function resetAnalyzeViewport() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function showAnalyzeInputView({ scroll = false, resetTop = false } = {}) {
    const inputSection   = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection  = document.getElementById('resultSection');

    if (analysisTransitionTimer) {
        clearTimeout(analysisTransitionTimer);
        analysisTransitionTimer = null;
    }
    clearLoadingPhaseTimers();

    if (inputSection)   inputSection.style.display  = 'block';
    if (loadingSection) loadingSection.style.display = 'none';
    if (resultSection)  resultSection.style.display  = 'none';
    if (inputSection)   inputSection.classList.remove('az-input-card--transitioning');
    setAnalyzeViewState('input');
    setAnalyzeButtonLoading(false);
    resetLoadingPhases();

    if (resetTop) {
        requestAnimationFrame(() => {
            resetAnalyzeViewport();
        });
        return;
    }

    if (scroll && inputSection) {
        inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showAnalyzeLoadingView() {
    const inputSection   = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection  = document.getElementById('resultSection');

    if (inputSection)   inputSection.style.display  = 'none';
    if (loadingSection) loadingSection.style.display = 'flex';
    if (resultSection)  resultSection.style.display  = 'none';
    if (inputSection)   inputSection.classList.remove('az-input-card--transitioning');
    setAnalyzeViewState('loading');
    setAnalyzeButtonLoading(true);
    resetLoadingPhases();
}

function syncLoadingPhase(index) {
    LOADING_PHASE_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('az-loading__phase--active', i === index);
    });

    LOADING_STEP_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('az-loading__step--done', i < index);
        el.classList.toggle('az-loading__step--active', i === index);
    });

    const loadingSection = document.getElementById('loadingSection');
    if (loadingSection) {
        loadingSection.dataset.phase = String(index);
        loadingSection.classList.remove('az-loading--pulse');
        void loadingSection.offsetWidth;
        loadingSection.classList.add('az-loading--pulse');
    }

    if (loadingPhasePulseTimer) {
        clearTimeout(loadingPhasePulseTimer);
    }

    loadingPhasePulseTimer = setTimeout(() => {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) loadingSection.classList.remove('az-loading--pulse');
        loadingPhasePulseTimer = null;
    }, 900);
}

function clearLoadingPhaseTimers() {
    if (loadingPhaseInterval) {
        clearInterval(loadingPhaseInterval);
        loadingPhaseInterval = null;
    }
    if (loadingPhaseFinishTimer) {
        clearTimeout(loadingPhaseFinishTimer);
        loadingPhaseFinishTimer = null;
    }
    if (loadingPhasePulseTimer) {
        clearTimeout(loadingPhasePulseTimer);
        loadingPhasePulseTimer = null;
    }
}

function resetLoadingPhases() {
    clearLoadingPhaseTimers();
    syncLoadingPhase(0);

    const loadingSection = document.getElementById('loadingSection');
    if (loadingSection) loadingSection.classList.remove('az-loading--pulse');
}

function startLoadingPhaseSequence(onComplete) {
    clearLoadingPhaseTimers();

    let current = 0;
    syncLoadingPhase(current);

    loadingPhaseInterval = setInterval(() => {
        current += 1;

        if (current < LOADING_PHASE_IDS.length) {
            syncLoadingPhase(current);
            return;
        }

        clearInterval(loadingPhaseInterval);
        loadingPhaseInterval = null;
        loadingPhaseFinishTimer = setTimeout(() => {
            loadingPhaseFinishTimer = null;
            onComplete();
        }, 900);
        }, 1650);
}

function splitReadableSentences(text) {
    return ((text || '').replace(/\s+/g, ' ').match(/[^。！？]+[。！？]?/g) || [])
        .map(part => part.trim())
        .filter(Boolean);
}

function stripOrdinalPrefix(text) {
    return (text || '').replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '').trim();
}

function buildDreamQuote(text) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    return clean.length > 118 ? `${clean.slice(0, 118).trim()}…` : clean;
}

function normalizeReadingSentence(sentence) {
    return (sentence || '')
        .replace(/^你描述了「.*?」这段梦境。?/, '')
        .replace(/^你描述了.*?(这段梦境。|——)/, '')
        .replace(/^其中.*?，/, '')
        .replace(/^在.*?中，/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function deriveReadingCore(summary, psychology) {
    const summarySentences = splitReadableSentences(summary)
        .map(normalizeReadingSentence)
        .filter(Boolean);

    const primary = summarySentences.find(sentence => sentence.length >= 16)
        || splitReadableSentences(psychology)[0]
        || summarySentences[0]
        || '这场梦像一次内在回应，把你带回那些尚未被完整说出的感受。';

    const supportCandidates = [
        ...summarySentences.filter(sentence => sentence !== primary),
        ...splitReadableSentences(psychology).filter(sentence => sentence !== primary)
    ];

    const support = supportCandidates.find(sentence => sentence.length >= 12)
        || '它没有急着给出结论，而是在提醒你：真正重要的线索，常常藏在反复出现的意象与情绪里。';

    return { primary, support };
}

function deriveMeaningCopy(summary, psychology, unconscious) {
    const summarySentences = splitReadableSentences(summary).map(normalizeReadingSentence).filter(Boolean);
    const psychologySentences = splitReadableSentences(psychology).map(normalizeReadingSentence).filter(Boolean);
    const unconsciousSentences = splitReadableSentences(unconscious).map(normalizeReadingSentence).filter(Boolean);

    const lead = summarySentences.find(sentence => sentence.length >= 18)
        || psychologySentences.find(sentence => sentence.length >= 18)
        || unconsciousSentences.find(sentence => sentence.length >= 18)
        || '这场梦没有直接给出答案，而是在把你带回那些还没有被完整说出来的感受。';

    const detailPool = [
        ...psychologySentences,
        ...unconsciousSentences,
        ...summarySentences.filter(sentence => sentence !== lead)
    ].filter(Boolean);

    const detailSentences = [];
    for (const sentence of detailPool) {
        if (!sentence || sentence === lead || detailSentences.includes(sentence)) continue;
        detailSentences.push(sentence);
        if (detailSentences.length >= 2) break;
    }

    const detail = detailSentences.join(' ')
        || '它更像一次温和的提醒：那些反复出现的意象与情绪，正在替你整理最近经历过的内在波动。';

    return { lead, detail };
}

function ensureThreeClues(symbols) {
    const base = Array.isArray(symbols) ? symbols.slice(0, 3) : [];
    const fallbacks = [
        { name: '情绪氛围', meaning: '醒来后停留下来的感受，往往比情节本身更接近这场梦真正想说的话。' },
        { name: '内在移动', meaning: '梦里不断变化的方向、靠近或停下，常常映照你现实里正在经历的心理移动。' },
        { name: '未说出的部分', meaning: '那些没有被解释清楚的空白，并不是缺失，而是潜意识刻意留下的线索。' }
    ];

    while (base.length < 3) {
        base.push(fallbacks[base.length]);
    }

    return base.slice(0, 3);
}

function buildClueMarkup(symbol, primary = false) {
    return `<span class="az-reading-clue__glyph">${getClueGlyph(symbol.name)}</span>
      <div class="az-reading-clue__copy">
        ${primary ? '<span class="az-reading-clue__label">最先被点亮的线索</span>' : ''}
        <h4 class="az-reading-clue__title">${symbol.name}</h4>
        <p class="az-reading-clue__text">${symbol.meaning}</p>
      </div>`;
}

function getClueGlyph(name) {
    const map = [
        {
            match: ['海', '水', '鱼', '深'],
            svg: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 8.6c1.8-1.4 3.5 1.4 5.3 0 1.9-1.5 3.4-1.5 5.3 0 1.9 1.5 3.4 1.4 5.1 0"/><path d="M2.8 12.4c1.7-1.2 3.3 1.2 5 0 1.8-1.3 3.3-1.3 5 0 1.8 1.3 3.3 1.2 4.4 0"/></svg>'
        },
        {
            match: ['森', '树'],
            svg: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.8v12.4"/><path d="M10 4.8c-2.7 1.9-4 4.3-4 7.2"/><path d="M10 4.8c2.7 1.9 4 4.3 4 7.2"/><path d="M6.6 13.7c1 .9 2.1 1.3 3.4 1.3 1.3 0 2.4-.4 3.4-1.3"/></svg>'
        },
        {
            match: ['门', '钥匙', '房', '家', '建筑'],
            svg: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.8 16V6.4c0-.8.6-1.4 1.4-1.4h5.6c.8 0 1.4.6 1.4 1.4V16"/><path d="M8.8 16v-4.2c0-.7.5-1.2 1.2-1.2s1.2.5 1.2 1.2V16"/></svg>'
        },
        {
            match: ['光', '星'],
            svg: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.8 11.3 8.7 16.2 10 11.3 11.3 10 16.2 8.7 11.3 3.8 10 8.7 8.7Z"/></svg>'
        },
        {
            match: ['追', '跑', '迷'],
            svg: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 13.8c2.5-4.8 5-4.8 7.5 0 1.5 2.8 3 2.8 4.5 0"/><path d="M4.6 7.4h3.6"/><path d="M11.8 7.4h3.6"/></svg>'
        },
        {
            match: ['平静', '迟疑', '情绪'],
            svg: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 12.6c1.4-1.6 3-2.4 4.8-2.4s3.4.8 4.8 2.4"/><path d="M5.6 7.9c1.1-.9 2.5-1.4 4.4-1.4s3.3.5 4.4 1.4"/></svg>'
        },
        {
            match: ['黑', '死'],
            svg: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.8 4.8a5.6 5.6 0 1 0 0 10.4A6.6 6.6 0 0 1 12.8 4.8Z"/></svg>'
        }
    ];

    const found = map.find(item => item.match.some(token => (name || '').includes(token)));
    return found
        ? found.svg
        : '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4.2"/><path d="M10 3.6v1.8M10 14.6v1.8M3.6 10h1.8M14.6 10h1.8"/></svg>';
}

function escapeReadingHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function uniqueStrings(list) {
    return [...new Set((list || []).filter(Boolean))];
}

function findMatchedPatterns(text, patterns = [], extraTokens = []) {
    const primary = patterns.find(pattern => pattern && text.includes(pattern)) || '';
    if (primary) {
        return {
            matchedText: primary,
            tokens: [primary]
        };
    }

    const hits = uniqueStrings(extraTokens.filter(token => token && text.includes(token)));
    if (!hits.length) return null;

    return {
        matchedText: hits.join(' · '),
        tokens: hits
    };
}

function getSourceTextFallback(text) {
    const firstSentence = splitReadableSentences(text)[0] || '';
    const clean = (firstSentence || text || '').replace(/\s+/g, ' ').trim();
    return clean.length > 12 ? clean.slice(0, 12) : clean;
}

function getSymbolKeywordsByName(name) {
    return (SYMBOL_LIBRARY.find(item => item.name === name)?.keywords || []).slice();
}

function buildDreamClueCollection(result, rawText, emotionLabel = '') {
    const text = rawText || '';
    const clues = [];
    const usedTitles = new Set();
    const blueprints = [
        {
            id: 'forest',
            title: '森林',
            patterns: ['发光的森林', '森林', '树林', '丛林'],
            explanation: '森林在这场梦里不是普通背景，而是一片还没有被理性完全照亮的内在区域。它让梦从一开始就带着探索感，也说明你正在靠近某块还没被说清的自己。'
        },
        {
            id: 'door',
            title: '半开的门',
            patterns: ['半开的门', '门半开着', '门总是半开着', '半开着的门', '门'],
            explanation: '这道门更像一道阈限，而不是障碍。它没有彻底关上，说明变化其实已经向你开放了，真正让你停住脚步的，是你还在确认自己是否准备好走进去。'
        },
        {
            id: 'waves',
            title: '海浪声',
            patterns: ['门后不断传来海浪声', '海浪声', '海浪', '水声', '海水'],
            explanation: '声音比画面更早抵达，说明更深的情绪已经先一步靠近你。海浪声持续存在，让这场梦一直维持着一种被召唤、被牵引的气氛。'
        },
        {
            id: 'sinking',
            title: '地面下沉',
            patterns: ['地面在缓慢下沉', '地面下沉', '缓慢下沉', '下沉感', '下沉', '坠落'],
            explanation: '地面变软或下沉，通常意味着旧的支撑感正在松动。它不是简单的危险感，而是在提醒你：继续靠旧方法往前走，已经不再那么稳了。'
        },
        {
            id: 'emotion',
            title: '平静与迟疑',
            patterns: ['奇怪的平静和迟疑', '平静和迟疑', '平静与迟疑'],
            extraTokens: ['平静', '迟疑', '犹豫'],
            explanation: '这组情绪让整场梦的气质定了下来。你不是被惊吓推着走，而是在一种安静却真实的犹豫里，慢慢意识到自己已经站在转变边缘。'
        }
    ];

    blueprints.forEach((blueprint) => {
        const match = findMatchedPatterns(text, blueprint.patterns, blueprint.extraTokens);
        if (!match) return;
        clues.push({
            id: blueprint.id,
            title: blueprint.title,
            matchedText: match.matchedText,
            tokens: match.tokens,
            explanation: blueprint.explanation
        });
        usedTitles.add(blueprint.title);
    });

    const fallbackSymbols = Array.isArray(result?.symbols) ? result.symbols : [];
    fallbackSymbols.forEach((symbol, index) => {
        if (clues.length >= 5 || usedTitles.has(symbol.name)) return;
        const keywords = getSymbolKeywordsByName(symbol.name);
        const match = findMatchedPatterns(text, keywords, keywords);
        if (!match) return;
        clues.push({
            id: `symbol-${index}`,
            title: symbol.name,
            matchedText: match.matchedText,
            tokens: match.tokens,
            explanation: symbol.meaning
        });
        usedTitles.add(symbol.name);
    });

    if (!clues.length) {
        const fallback = getSourceTextFallback(text) || emotionLabel || '这场梦';
        clues.push({
            id: 'overall',
            title: '梦境整体氛围',
            matchedText: fallback,
            tokens: [fallback],
            explanation: '当梦里没有特别集中的单一意象时，最先写下来的那段原文本身，就是进入这场梦的第一条线索。'
        });
    }

    return clues.slice(0, 5);
}

function collectClueRanges(text, clues) {
    const ranges = [];
    (clues || []).forEach((clue) => {
        const tokens = uniqueStrings(clue.tokens).sort((a, b) => b.length - a.length);
        tokens.forEach((token) => {
            let cursor = 0;
            while (cursor < text.length) {
                const index = text.indexOf(token, cursor);
                if (index === -1) break;
                const end = index + token.length;
                const overlaps = ranges.some((range) => !(end <= range.start || index >= range.end));
                if (!overlaps) {
                    ranges.push({ start: index, end, clueId: clue.id });
                }
                cursor = index + token.length;
            }
        });
    });

    return ranges.sort((a, b) => a.start - b.start);
}

function buildDreamSourceMarkup(text, clues, previewId, selectedId) {
    const source = String(text || '').trim();
    const paragraphs = source.split(/\n+/).filter(Boolean);
    const blocks = paragraphs.length ? paragraphs : [source];

    return blocks.map((paragraph) => {
        const ranges = collectClueRanges(paragraph, clues);
        if (!ranges.length) {
            return `<p>${escapeReadingHtml(paragraph)}</p>`;
        }

        let cursor = 0;
        let html = '';
        ranges.forEach((range) => {
            html += escapeReadingHtml(paragraph.slice(cursor, range.start));
            const matched = paragraph.slice(range.start, range.end);
            const isPreview = range.clueId === previewId;
            const isSelected = !isPreview && range.clueId === selectedId;
            const activeClass = isPreview ? ' is-preview' : (isSelected ? ' is-selected' : '');
            const mutedClass = (previewId || selectedId) && !isPreview && !isSelected ? ' is-muted' : '';
            html += `<span class="az-reading-source__mark${activeClass}${mutedClass}" data-clue-ref="${escapeReadingHtml(range.clueId)}">${escapeReadingHtml(matched)}</span>`;
            cursor = range.end;
        });
        html += escapeReadingHtml(paragraph.slice(cursor));
        return `<p>${html}</p>`;
    }).join('');
}

function getDisplayedDreamClueId() {
    return dreamClueModuleState.previewId || dreamClueModuleState.selectedId || '';
}

function renderDreamClueRail() {
    const rail = document.getElementById('dreamClueRail');
    if (!rail) return;
    const activeId = getDisplayedDreamClueId();

    rail.innerHTML = dreamClueModuleState.clues.map((clue) => {
        const isActive = clue.id === activeId;
        const isSelected = clue.id === dreamClueModuleState.selectedId;
        return `
            <button
                type="button"
                class="az-reading-clue-node${isActive ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}"
                data-clue-id="${escapeReadingHtml(clue.id)}"
                aria-pressed="${isSelected ? 'true' : 'false'}">
                <span class="az-reading-clue-node__orb">${getClueGlyph(clue.title)}</span>
                <span class="az-reading-clue-node__label">${escapeReadingHtml(clue.title)}</span>
            </button>
        `;
    }).join('');
}

function renderDreamClueFocus() {
    const panel = document.getElementById('dreamClueFocus');
    if (!panel) return;

    const clue = dreamClueModuleState.clues.find(item => item.id === dreamClueModuleState.selectedId);
    if (!clue) {
        panel.classList.add('is-hidden');
        panel.classList.remove('is-visible');
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML = '';
        return;
    }

    panel.classList.remove('is-hidden');
    panel.classList.add('is-visible');
    panel.setAttribute('aria-hidden', 'false');
    panel.innerHTML = `
        <div class="az-reading-clue-focus__head">
          <span class="az-reading-clue-focus__glyph">${getClueGlyph(clue.title)}</span>
          <h4 class="az-reading-clue-focus__title">${escapeReadingHtml(clue.title)}</h4>
        </div>
        <p class="az-reading-clue-focus__text">${escapeReadingHtml(clue.explanation)}</p>
    `;
}

function renderDreamClueModule() {
    const sourceEl = document.getElementById('dreamSourceText');
    if (!sourceEl) return;
    sourceEl.classList.toggle('has-preview-focus', Boolean(dreamClueModuleState.previewId));
    sourceEl.classList.toggle('has-selected-focus', !dreamClueModuleState.previewId && Boolean(dreamClueModuleState.selectedId));
    sourceEl.classList.toggle('has-active-focus', Boolean(dreamClueModuleState.previewId || dreamClueModuleState.selectedId));
    sourceEl.innerHTML = buildDreamSourceMarkup(
        dreamClueModuleState.rawText,
        dreamClueModuleState.clues,
        dreamClueModuleState.previewId,
        dreamClueModuleState.selectedId
    );
    renderDreamClueRail();
    renderDreamClueFocus();
}

function setDreamClueSelection(id) {
    if (!id) return;
    dreamClueModuleState.selectedId = dreamClueModuleState.selectedId === id ? '' : id;
    dreamClueModuleState.previewId = '';
    renderDreamClueModule();
}

function setDreamCluePreview(id) {
    if (!id || dreamClueModuleState.previewId === id) return;
    dreamClueModuleState.previewId = id;
    renderDreamClueModule();
}

function clearDreamCluePreview() {
    if (!dreamClueModuleState.previewId) return;
    dreamClueModuleState.previewId = '';
    renderDreamClueModule();
}

function updateDreamClueModule(rawText, result, emotionLabel) {
    const clues = buildDreamClueCollection(result, rawText, emotionLabel);

    dreamClueModuleState.rawText = rawText || '';
    dreamClueModuleState.clues = clues;
    dreamClueModuleState.previewId = '';
    dreamClueModuleState.selectedId = '';

    renderDreamClueModule();
}

function initDreamClueModuleInteractions() {
    const rail = document.getElementById('dreamClueRail');
    const source = document.getElementById('dreamSourceText');
    if (!rail || !source) return;

    rail.addEventListener('click', (event) => {
        const button = event.target.closest('[data-clue-id]');
        if (!button) return;
        setDreamClueSelection(button.getAttribute('data-clue-id'));
    });

    rail.addEventListener('mouseover', (event) => {
        const button = event.target.closest('[data-clue-id]');
        if (!button) return;
        setDreamCluePreview(button.getAttribute('data-clue-id'));
    });

    rail.addEventListener('mouseleave', () => {
        clearDreamCluePreview();
    });

    rail.addEventListener('focusin', (event) => {
        const button = event.target.closest('[data-clue-id]');
        if (!button) return;
        setDreamCluePreview(button.getAttribute('data-clue-id'));
    });

    rail.addEventListener('focusout', (event) => {
        if (rail.contains(event.relatedTarget)) return;
        clearDreamCluePreview();
    });

    source.addEventListener('mouseover', (event) => {
        const mark = event.target.closest('[data-clue-ref]');
        if (!mark) return;
        setDreamCluePreview(mark.getAttribute('data-clue-ref'));
    });

    source.addEventListener('mouseleave', () => {
        clearDreamCluePreview();
    });

    source.addEventListener('click', (event) => {
        const mark = event.target.closest('[data-clue-ref]');
        if (!mark) return;
        setDreamClueSelection(mark.getAttribute('data-clue-ref'));
    });
}

function getEmotionCenter(emotions) {
    if (Array.isArray(emotions) && emotions.length > 0) return emotions[0];
    return { label: '平静', pct: 54 };
}

function containsCue(text, cues) {
    return cues.some(cue => (text || '').includes(cue));
}

function pickCue(text, cues, fallback = '') {
    return cues.find(cue => (text || '').includes(cue)) || fallback;
}

function getInterpretationOpening(theme, signals) {
    if (signals.forest && signals.door && signals.water) {
        return '这场梦在说，你已经感觉到一个新的方向在召唤你，但你还没有真正跨进去。';
    }

    const openings = {
        water: '这场梦在说，一股更深的感受已经开始推着你往前走，只是你还停在门口听它的声音。',
        chase: '这场梦在说，你并不是单纯在害怕什么，而是有一部分压力已经大到不能再被绕开。',
        fall: '这场梦在说，旧的支撑正在松动，你正在进入一个必须重新找平衡的过渡阶段。',
        fly: '这场梦在说，你已经在靠近一种更自由的自己，只是现实里的步子还没有完全跟上。',
        forest: '这场梦在说，你正走进一段旧地图已经失效、新方向却还没完全显形的时期。',
        house: '这场梦在说，你内心有一个区域正在重新被打开，它需要被认真进入，而不是继续绕开。',
        death: '这场梦在说，有个旧阶段已经走到尽头了，你正在为新的理解腾出位置。',
        light: '这场梦在说，你其实已经感觉到某个方向在浮现，只是还没完全把它说出口。',
        general: '这场梦在说，你的内心正在借这些画面，把一个白天还没说清的信号重新递到你面前。'
    };

    return openings[theme] || openings.general;
}

function getInterpretationEmotionLine(label, signals) {
    if (signals.calm && signals.hesitation) {
        return '所以你醒来后留下的不是单纯的害怕，而是一种平静与迟疑并存的感觉。';
    }

    const lines = {
        '宁静': '这也是为什么它没有用惊吓的方式出现，而是用一种安静却很坚定的方式停留在你心里。',
        '焦虑': '梦里那种拉扯感说明，这件事已经不只是念头，它正在真实地消耗你的注意力和力气。',
        '神秘': '那种说不清的感觉不是装饰，它是在提醒你：真正重要的部分还藏在更深一点的位置。',
        '自由': '轻盈感说明你并没有彻底被困住，内心其实已经开始寻找更宽的呼吸和更大的空间。',
        '迷惘': '迷惘感并不表示你走错了，更多时候，它说明你已经走到旧答案不再够用的地方。',
        '恐惧': '恐惧感让这场梦更像一次逼近，它在提醒你：变化已经靠得很近了。',
        '好奇': '好奇说明你没有关闭自己，这场梦不是在吓你，而是在邀请你继续往里走。',
        '压迫': '那份沉重感让这场梦显得更真实，也说明有个部分已经承受太久，不能再被忽略。'
    };

    return lines[label] || '醒来后残留下来的感觉，是这场梦最直接的线索之一。';
}

function getInterpretationClosing(theme, signals) {
    if (signals.door && signals.water) {
        return '它真正想传达的不是危险，而是过渡。门后的声音已经出现了，接下来真正重要的，不是继续观望，而是承认自己确实想靠近。';
    }

    const closings = {
        water: '它真正想传达的不是危险，而是更深的情绪与直觉已经开始推动你。不要再假装自己没有听见。',
        chase: '它真正想传达的不是逃，而是面对。你越早停下来辨认那股压力，它越不会继续在夜里追你。',
        fall: '它真正想传达的不是坠落本身，而是旧的支撑已经完成使命，你需要为新的平衡腾出空间。',
        fly: '它真正想传达的不是幻想，而是你已经准备好把某种限制放松一点了。',
        forest: '它真正想传达的不是迷路，而是转向。你已经走到该重新辨认方向的地方了。',
        house: '它真正想传达的不是回忆本身，而是内心某个房间已经到了该被重新整理的时候。',
        death: '它真正想传达的不是失去，而是旧阶段正在退场，新理解正在腾出位置。',
        light: '它真正想传达的不是远方的答案，而是你已经感到那束光落在自己身上了。',
        general: '它真正想传达的不是一个抽象结论，而是一个很具体的提醒：有些感受已经不能再被轻轻带过。'
    };

    return closings[theme] || closings.general;
}

function buildInterpretationOverviewBody(parts, detail) {
    if (parts.length > 0) {
        return `${parts.join('，')}。`;
    }

    return detail
        ? detail.replace(/^从.*?视角来审视你的梦境「.*?…」，?/, '').replace(/^值得注意的是：/, '').trim()
        : '这场梦把多个意象连在一起，不是在制造悬念，而是在把一个还没有被说清的内在主题重新带回你面前。';
}

function buildEmotionEnergyAnalysis(emotionLabel, signals) {
    if (signals.calm && signals.hesitation) {
        return '这场梦的情绪能量并不是单向的害怕，而是被吸引与迟疑同时拉住。你没有真正被惊吓推开，所以醒来后仍然保留着平静；但你也没有立刻靠近，所以那份迟疑一直留在心里。真正推动这场梦的，是一种已经开始向前，却还没有完全允许自己跨进去的心理张力。';
    }

    if (signals.water && signals.sinking) {
        return '梦里的情绪不是突然爆发，而是缓慢累积的。水声在远处持续推动，下沉感在脚下慢慢发生，这说明内在压力或变化早已开始渗入，只是白天还没有被完整承认。它带来的不是一个单点情绪，而是一种持续推进、却暂时没有出口的心理牵引。';
    }

    const lines = {
        '宁静': '这场梦的情绪流动并不尖锐，它更像一种安静却持续的靠近。表面上你没有被激烈情绪卷走，但更深处其实已经有一股力量在推你重新看待眼前的变化。',
        '焦虑': '这场梦的情绪能量更接近持续拉扯。它不是单纯的紧张，而是一部分内在已经意识到问题正在逼近，另一部分却还在试图维持旧有秩序。',
        '神秘': '这场梦的情绪不是明确的答案，而是一种说不清却挥之不去的吸引力。它说明你的心理正在靠近某个还未完全成形的感受或认知。',
        '自由': '这场梦里的情绪能量带着向外展开的倾向。它说明你内在并没有彻底封闭自己，某种更轻、更宽的状态已经开始浮现。',
        '迷惘': '这场梦的情绪流动更像站在旧地图边缘的停顿。它不是混乱本身，而是当旧判断失效时，心理暂时进入重新校准的阶段。',
        '恐惧': '这场梦里的情绪张力更强，说明内在已经把某件事推到了不能继续绕开的程度。恐惧不是终点，而是一种逼近现实的信号。',
        '好奇': '这场梦并没有把你完全推开，反而保留了一种向前看的冲动。好奇说明你虽然还在犹豫，但心理并没有拒绝继续靠近。',
        '压迫': '这场梦的能量更像长期积压后的显影。它提醒你，有些心理负担已经不只是背景噪音，而是在持续占据你的内部空间。'
    };

    return lines[emotionLabel] || '这场梦的情绪流动本身就是重要线索。它说明真正推动这场梦的，不只是符号本身，而是那些在白天尚未被完整表达的内在张力。';
}

function normalizeEmotionComposition(items) {
    const safeItems = Array.isArray(items)
        ? items.filter(Boolean).slice(0, 4).map(item => ({
            ...item,
            pct: Number(item.pct) || 0
        }))
        : [];

    const total = safeItems.reduce((sum, item) => sum + item.pct, 0);
    if (!safeItems.length || total <= 0) return [];

    let running = 0;
    const normalized = safeItems.map((item, index) => {
        if (index === safeItems.length - 1) {
            return {
                ...item,
                pct: Math.max(1, 100 - running)
            };
        }

        const pct = Math.max(1, Math.round((item.pct / total) * 100));
        running += pct;
        return { ...item, pct };
    });

    const diff = 100 - normalized.reduce((sum, item) => sum + item.pct, 0);
    if (diff && normalized[0]) {
        normalized[0].pct = Math.max(1, normalized[0].pct + diff);
    }

    return normalized;
}

function mapDetectedEmotionToComposition(item) {
    const mapping = {
        '宁静': { key: 'calm', label: '平静', tone: 'moon' },
        '焦虑': { key: 'unease', label: '轻微不安', tone: 'ember' },
        '神秘': { key: 'attraction', label: '被吸引', tone: 'violet' },
        '自由': { key: 'release', label: '舒展', tone: 'pearl' },
        '迷惘': { key: 'hesitation', label: '迟疑', tone: 'slate' },
        '恐惧': { key: 'vigilance', label: '防御', tone: 'ember' },
        '好奇': { key: 'curiosity', label: '好奇', tone: 'cyan' },
        '压迫': { key: 'pressure', label: '压力', tone: 'ember' }
    };

    const mapped = mapping[item?.label];
    if (!mapped) return null;

    return {
        ...mapped,
        pct: item.pct
    };
}

function buildEmotionComposition(resultEmotions, emotionLabel, signals) {
    if (signals.calm && signals.hesitation) {
        return [
            { key: 'attraction', label: '被吸引', pct: 34, tone: 'violet' },
            { key: 'hesitation', label: '迟疑', pct: 28, tone: 'slate' },
            { key: 'calm', label: '平静', pct: 22, tone: 'moon' },
            { key: 'unease', label: '轻微不安', pct: 16, tone: 'ember' }
        ];
    }

    if (signals.water && signals.sinking) {
        return [
            { key: 'attraction', label: '被牵引', pct: 31, tone: 'violet' },
            { key: 'hesitation', label: '迟疑', pct: 27, tone: 'slate' },
            { key: 'calm', label: '平静', pct: 24, tone: 'moon' },
            { key: 'unease', label: '轻微不安', pct: 18, tone: 'ember' }
        ];
    }

    const presets = {
        '宁静': [
            { key: 'calm', label: '平静', pct: 36, tone: 'moon' },
            { key: 'attraction', label: '被吸引', pct: 28, tone: 'violet' },
            { key: 'hesitation', label: '迟疑', pct: 20, tone: 'slate' },
            { key: 'release', label: '舒展', pct: 16, tone: 'pearl' }
        ],
        '焦虑': [
            { key: 'unease', label: '轻微不安', pct: 32, tone: 'ember' },
            { key: 'hesitation', label: '迟疑', pct: 28, tone: 'slate' },
            { key: 'pressure', label: '压力', pct: 22, tone: 'ember' },
            { key: 'attraction', label: '被吸引', pct: 18, tone: 'violet' }
        ],
        '神秘': [
            { key: 'attraction', label: '被吸引', pct: 38, tone: 'violet' },
            { key: 'hesitation', label: '迟疑', pct: 26, tone: 'slate' },
            { key: 'calm', label: '平静', pct: 20, tone: 'moon' },
            { key: 'curiosity', label: '好奇', pct: 16, tone: 'cyan' }
        ],
        '自由': [
            { key: 'release', label: '舒展', pct: 34, tone: 'pearl' },
            { key: 'calm', label: '平静', pct: 28, tone: 'moon' },
            { key: 'attraction', label: '被吸引', pct: 22, tone: 'violet' },
            { key: 'curiosity', label: '好奇', pct: 16, tone: 'cyan' }
        ],
        '迷惘': [
            { key: 'hesitation', label: '迟疑', pct: 34, tone: 'slate' },
            { key: 'attraction', label: '被吸引', pct: 24, tone: 'violet' },
            { key: 'unease', label: '轻微不安', pct: 24, tone: 'ember' },
            { key: 'calm', label: '平静', pct: 18, tone: 'moon' }
        ],
        '恐惧': [
            { key: 'vigilance', label: '防御', pct: 34, tone: 'ember' },
            { key: 'unease', label: '轻微不安', pct: 28, tone: 'ember' },
            { key: 'pressure', label: '压力', pct: 22, tone: 'slate' },
            { key: 'hesitation', label: '迟疑', pct: 16, tone: 'slate' }
        ],
        '好奇': [
            { key: 'curiosity', label: '好奇', pct: 32, tone: 'cyan' },
            { key: 'attraction', label: '被吸引', pct: 30, tone: 'violet' },
            { key: 'hesitation', label: '迟疑', pct: 20, tone: 'slate' },
            { key: 'calm', label: '平静', pct: 18, tone: 'moon' }
        ],
        '压迫': [
            { key: 'pressure', label: '压力', pct: 34, tone: 'ember' },
            { key: 'unease', label: '轻微不安', pct: 26, tone: 'ember' },
            { key: 'hesitation', label: '迟疑', pct: 22, tone: 'slate' },
            { key: 'vigilance', label: '防御', pct: 18, tone: 'slate' }
        ]
    };

    if (presets[emotionLabel]) {
        return presets[emotionLabel];
    }

    const derived = normalizeEmotionComposition(
        (Array.isArray(resultEmotions) ? resultEmotions : [])
            .map(mapDetectedEmotionToComposition)
            .filter(Boolean)
    );

    if (derived.length >= 3) {
        return derived;
    }

    return [
        { key: 'attraction', label: '被吸引', pct: 30, tone: 'violet' },
        { key: 'hesitation', label: '迟疑', pct: 27, tone: 'slate' },
        { key: 'calm', label: '平静', pct: 23, tone: 'moon' },
        { key: 'unease', label: '轻微不安', pct: 20, tone: 'ember' }
    ];
}

function getEmotionCompositionIcon(key) {
    const icons = {
        attraction: '<path d="M10 3.8 11.3 8.7 16.2 10 11.3 11.3 10 16.2 8.7 11.3 3.8 10 8.7 8.7Z"/>',
        hesitation: '<path d="M10.1 4.8c2.7 0 4.5 1.5 4.5 3.8 0 2.2-1.6 3.7-3.9 3.7-1.8 0-3.1-1-3.1-2.3 0-1.1.8-1.9 2-1.9 1 0 1.8.5 2.2 1.3"/><path d="M10 14.6v.2"/>',
        calm: '<path d="M13.8 4.8a5.8 5.8 0 1 0 0 10.4A6.7 6.7 0 0 1 13.8 4.8Z"/>',
        unease: '<path d="M2.8 11.4c1.7-3.3 3.3 3.3 5 0 1.8-3.4 3.3-3.4 5 0 1.8 3.4 3.3 3.3 4.4 0"/>',
        pressure: '<path d="M5 7.2h10"/><path d="M5.6 12.8c1-.9 2.4-1.4 4.4-1.4s3.4.5 4.4 1.4"/>',
        vigilance: '<path d="M4.5 5.2c2.6 1.5 2.6 8.1 0 9.6"/><path d="M15.5 5.2c-2.6 1.5-2.6 8.1 0 9.6"/><path d="M8 10h4"/>',
        release: '<path d="M4.8 11.2c1.2 2 3 3 5.2 3s4-1 5.2-3"/><path d="M6.2 7.2c.9 1.3 2.2 2 3.8 2s2.9-.7 3.8-2"/>',
        curiosity: '<circle cx="10" cy="10" r="3.2"/><path d="M10 3.8v2.1M10 14.1v2.1M16.2 10h-2.1M5.9 10H3.8"/>'
    };

    return `<svg viewBox="0 0 20 20" aria-hidden="true">${icons[key] || icons.attraction}</svg>`;
}

function renderEmotionComposition(items) {
    if (!Array.isArray(items) || items.length === 0) return '';

    const summary = items.map(item => `${item.label} ${item.pct}%`).join('，');
    const band = items.map((item, index) => `
        <span class="az-reading-energy-map__segment is-${item.tone || 'violet'}" style="--az-share:${item.pct}; --az-index:${index}" aria-hidden="true"></span>
    `).join('');

    const list = items.map((item, index) => `
        <article class="az-reading-energy-map__item is-${item.tone || 'violet'}" style="--az-index:${index}">
            <span class="az-reading-energy-map__glyph">${getEmotionCompositionIcon(item.key)}</span>
            <span class="az-reading-energy-map__name">${item.label}</span>
            <span class="az-reading-energy-map__value">${item.pct}%</span>
        </article>
    `).join('');

    return `
        <div class="az-reading-energy-map__head">
            <p class="az-reading-energy-map__eyebrow">主要情绪构成</p>
        </div>
        <div class="az-reading-energy-map__band" role="img" aria-label="这场梦的情绪构成：${summary}">
            ${band}
        </div>
        <div class="az-reading-energy-map__list">
            ${list}
        </div>
    `;
}

function buildUnconsciousTransmission(theme, signals) {
    if (signals.door && signals.water) {
        return '潜意识真正想传达的，不是危险，而是过渡已经开始。门后的声音反复出现，是因为你内在更深处已经知道：真正的问题不是要不要改变，而是你愿不愿意承认自己已经想靠近。';
    }

    const messages = {
        water: '潜意识真正想传达的，是一股更深的感受已经在推动你。它不是要你被情绪吞没，而是提醒你停止假装自己没有听见那道更真实的内在回声。',
        chase: '潜意识真正想传达的，不是让你继续逃，而是让你停下来辨认一直在追赶你的压力。只有当它被看见，这场梦才会真正松开。',
        fall: '潜意识真正想传达的，不是坠落本身，而是旧的支撑已经不再足够。它在提醒你：新的平衡不会自动出现，你需要主动调整自己与现实的关系。',
        fly: '潜意识真正想传达的，不是幻想，而是你已经开始靠近一种更自由的可能。它要你看见，那部分更轻的自己并没有消失，只是还没有被完全允许。',
        forest: '潜意识真正想传达的，不是迷路，而是转向。它在提醒你，旧地图已经不够用了，你需要给新的感受和判断方式留出进入的位置。',
        house: '潜意识真正想传达的，是内心某个房间已经到了需要重新打开的时候。你不能再只从门外判断它，而要真正走进去看看里面还留着什么。',
        death: '潜意识真正想传达的，不是失去，而是旧阶段正在退场。它在替你完成一种心理上的告别，好让新的理解有空间长出来。',
        light: '潜意识真正想传达的，不是远处的答案，而是你其实已经感觉到那束光落在自己身上了。接下来重要的，是不要再把那份感觉轻轻带过。',
        general: '潜意识真正想传达的，是那些白天被你暂时压住的感受，已经到了需要认真回应的时候。这场梦不是抽象提示，而是一种内在要求你停下来听见自己的方式。'
    };

    return messages[theme] || messages.general;
}

function collectDreamSignalContext(result, rawText = '') {
    const text = rawText || '';
    const symbols = Array.isArray(result?.symbols) ? result.symbols : [];
    const { detail } = deriveMeaningCopy(result?.summary, result?.psychology, result?.unconscious);
    const signals = {
        forest: containsCue(text, ['发光的森林', '森林', '树林', '丛林']) || symbols.some(item => (item.name || '').includes('森林') || (item.name || '').includes('树')),
        door: containsCue(text, ['半开的门', '门', '大门', '木门']) || symbols.some(item => (item.name || '').includes('门')),
        water: containsCue(text, ['海浪声', '海浪', '水声', '海水', '大海', '海']) || symbols.some(item => ['海洋', '水', '深处'].includes(item.name)),
        sinking: containsCue(text, ['缓慢下沉', '下沉感', '下沉', '坠落', '落下']) || result?.theme === 'fall',
        light: containsCue(text, ['发光', '光', '亮光', '光线']) || symbols.some(item => (item.name || '').includes('光')),
        house: containsCue(text, ['房间', '房子', '屋', '家']) || symbols.some(item => (item.name || '').includes('家') || (item.name || '').includes('房')),
        mirror: containsCue(text, ['镜子', '镜', '倒影']) || symbols.some(item => (item.name || '').includes('镜')),
        calm: containsCue(text, ['平静', '安静', '宁静']),
        hesitation: containsCue(text, ['迟疑', '犹豫', '靠近却停下', '想靠近'])
    };

    const forestWord = pickCue(text, ['发光的森林', '森林', '树林'], signals.forest ? '森林' : '');
    const doorWord = pickCue(text, ['半开的门', '门'], signals.door ? '门' : '');
    const waterWord = pickCue(text, ['海浪声', '海浪', '水声', '海水', '大海', '海'], signals.water ? '水意象' : '');
    const sinkingWord = pickCue(text, ['缓慢下沉', '下沉感', '下沉', '坠落'], signals.sinking ? '下沉感' : '');
    const lightWord = pickCue(text, ['发光', '光线', '亮光', '光'], signals.light ? '光' : '');
    const houseWord = pickCue(text, ['旧房间', '房间', '房子', '家'], signals.house ? '房间' : '');
    const mirrorWord = pickCue(text, ['镜子', '镜', '倒影'], signals.mirror ? '镜子' : '');

    return {
        text,
        symbols,
        detail,
        signals,
        cueWords: {
            forestWord,
            doorWord,
            waterWord,
            sinkingWord,
            lightWord,
            houseWord,
            mirrorWord
        }
    };
}

function buildDreamInterpretation(result, emotionLabel, rawText = '') {
    const context = collectDreamSignalContext(result, rawText);
    const { detail, signals, cueWords } = context;
    const {
        forestWord,
        doorWord,
        waterWord,
        sinkingWord,
        lightWord,
        houseWord,
        mirrorWord
    } = cueWords;

    const opening = getInterpretationOpening(result?.theme || 'general', signals);
    const parts = [];

    if (forestWord) parts.push(`${forestWord}把你带进一片还没有完全看清的内在地带`);
    if (doorWord) parts.push(`${doorWord}像一道边界，也像一个已经在等你靠近的入口`);
    if (waterWord) parts.push(`${waterWord}让更深处的感受一直在里面推动你`);
    if (sinkingWord) parts.push(`${sinkingWord}说明熟悉的支撑正在变软，你不能再只靠旧的判断往前走`);
    if (lightWord && !forestWord) parts.push(`${lightWord}说明你其实已经感觉到某个方向在出现`);
    if (houseWord && !doorWord) parts.push(`${houseWord}让梦把视线带回你内心真正需要被整理的区域`);
    if (mirrorWord) parts.push(`${mirrorWord}让这场梦更像一次对自己的正面相遇`);

    const overview = buildInterpretationOverviewBody(parts, detail);
    const emotion = buildEmotionEnergyAnalysis(emotionLabel, signals);
    const emotionComposition = buildEmotionComposition(result?.emotions, emotionLabel, signals);
    const unconscious = buildUnconsciousTransmission(result?.theme || 'general', signals);

    return {
        lead: opening,
        overview,
        emotion,
        emotionComposition,
        unconscious
    };
}

function buildActionGuidance(result, rawText = '', emotionLabel = '') {
    const context = collectDreamSignalContext(result, rawText);
    const { signals, cueWords } = context;
    const doorWord = cueWords.doorWord || '那扇半开的门';
    const waterWord = cueWords.waterWord || '那道一直没停下的声音';
    const forestWord = cueWords.forestWord || '那片发光的森林';
    const sinkingWord = cueWords.sinkingWord || '脚下慢慢变软的感觉';

    if (signals.door && signals.water && signals.hesitation) {
        return {
            actionCue: '先写下一句：如果我真的靠近它，我最担心会发生什么？',
            actionBody: `今晚不用急着跨进去。给自己留十分钟安静时间，把 ${doorWord}、${waterWord} 和你停住脚步的那一刻写成一句完整的话。只写一句也够，它会让这份迟疑从模糊感觉，变成可以被看见的线索。`,
            directionCue: '接下来，继续留意那些你明明已经听见，却还停在门外的事。',
            directionBody: `这场梦更像在提醒你：变化并不是突然降临，而是早就以细小的方式靠近了。接下来不需要逼自己马上决定，只要留意现实里哪些事像门后的声音一样反复出现，哪些靠近会让你同时感到平静和迟疑。`
        };
    }

    if (signals.forest && signals.door) {
        return {
            actionCue: `把 ${forestWord} 里最清晰的一幕重新写下来，停在你最想再靠近一步的地方。`,
            actionBody: '不要急着把它解释成结论。只把那一幕留下来，并写下自己为什么会停在这里。这个动作会帮助你分辨，真正让你犹豫的究竟是未知本身，还是跨进去之后可能发生的变化。',
            directionCue: '接下来，留意你最近在现实里对哪些新方向既有吸引，也有保留。',
            directionBody: '这场梦提示你继续观察的，不是答案，而是边界。哪些地方你已经开始想走近，却还在反复确认自己是否准备好了，那通常就是这场梦在现实里的对应。'
        };
    }

    if (signals.water || signals.sinking) {
        return {
            actionCue: `把 ${waterWord} 或 ${sinkingWord} 对应到现实里最近反复出现的一件事。`,
            actionBody: '今晚可以只做一个很小的动作：记下它出现的场景、你当时的身体感觉，以及你本来想避开的那部分。这个记录不需要完整，只要足够真实，就能让梦里的张力开始落地。',
            directionCue: '接下来，继续留意那些不是突然爆发，而是一直在缓慢推进的变化。',
            directionBody: '这场梦更像在提醒你，真正重要的往往不是最响亮的情绪，而是那些持续存在、但你还没有正式承认的内在牵引。'
        };
    }

    if (emotionLabel === '宁静' || emotionLabel === '神秘' || emotionLabel === '好奇') {
        return {
            actionCue: '给这场梦留一句标题，写下它最想把你带去的方向。',
            actionBody: '不需要把整场梦重新复述，只写一句最贴近它的标题或问题。这个很轻的动作，会帮你把夜里的感受留到白天，而不是让它在醒来之后立刻散掉。',
            directionCue: '接下来，继续留意那些让你安静下来、却又忍不住回头看的画面。',
            directionBody: '这些画面通常不是无意义的装饰，而是潜意识在用更柔和的方式提醒你：某个方向已经开始对你发出召唤。'
        };
    }

    return {
        actionCue: '先记下一句此刻最不想轻轻带过的话。',
        actionBody: '不用急着把梦解释完整。只要把醒来后最残留的那一句感觉写下来，它就已经是在把梦里的信息慢慢带回现实。',
        directionCue: '接下来，继续留意那些反复出现、却还没被你认真回应的感受。',
        directionBody: '这场梦真正给出的不是任务，而是方向。只要你开始留意它在现实里对应的场景，这场梦就会继续告诉你下一步该靠近哪里。'
    };
}

/* ============================================================
   DOMContentLoaded 初始化
============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }

    // 字数统计
    const ta = getTextarea();
    if (ta) {
        const savedDraft = loadAnalyzeDraft();
        if (!ta.value && savedDraft) {
            ta.value = savedDraft;
        }
        syncCharCount(ta.value.length);
        ta.addEventListener('input', () => {
            syncCharCount(ta.value.length);
            persistAnalyzeDraft(ta.value);
            if (!ta.value.trim() && isExampleExpanded) {
                isExampleExpanded = false;
                syncExampleToggleUI();
            }
        });
    }

    syncExampleToggleUI();
    resetLoadingPhases();
    initDreamClueModuleInteractions();

    const bootRoute = readAnalyzeRouteState();
    if (typeof window.switchMode === 'function') {
        window.__dreamlensRouteHydrating = true;
        window.switchMode(bootRoute.mode);
        window.__dreamlensRouteHydrating = false;
    }

    restoreAnalyzeStateFromRoute({
        scroll: false,
        allowLoadingSequence: true,
        forceTop: bootRoute.view !== 'input'
    });

    window.addEventListener('popstate', () => {
        const route = readAnalyzeRouteState();
        restoreAnalyzeStateFromRoute({
            scroll: false,
            allowLoadingSequence: false,
            forceTop: route.view !== 'input'
        });
    });
});

/* ============================================================
   切换分析维度 chip
============================================================ */
function toggleChip(el) { el.classList.toggle('az-chip--active'); }

/* ============================================================
   选择醒来情绪
============================================================ */
function selectEmotion(el) {
    document.querySelectorAll('.az-emotion-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    selectedEmotion = el.dataset.emotion;
}

/* ============================================================
   插入示例
============================================================ */
function insertExampleDream() {
    const ta = getTextarea();
    if (!ta) return;

    if (typeof window.switchMode === 'function') window.switchMode('text');

    if (isExampleExpanded) {
        ta.value = '';
        isExampleExpanded = false;
        syncCharCount(0);
        persistAnalyzeDraft('');
        syncExampleToggleUI();
        ta.focus();
        return;
    }

    ta.value = INLINE_EXAMPLE_DREAM;
    isExampleExpanded = true;
    syncCharCount(ta.value.length);
    persistAnalyzeDraft(ta.value);
    syncExampleToggleUI();
    ta.focus();
    ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ============================================================
   开始解析
============================================================ */
function startAnalysis() {
    const input = getUnifiedDreamInput();
    const btn   = getAnalyzeButton();

    if (input.length < 20) {
        typeof showToast === 'function'
            ? showToast('请描述至少20个字的梦境内容～')
            : alert('请描述至少20个字的梦境内容～');
        return;
    }

    if (btn && btn.disabled) return;

    const inputSection   = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection  = document.getElementById('resultSection');

    setAnalyzeButtonLoading(true);
    if (inputSection) inputSection.classList.add('az-input-card--transitioning');
    resetLoadingPhases();
    persistAnalyzeDraft(input);
    updateAnalyzeRouteState({ view: 'loading' }, { replace: true });

    if (analysisTransitionTimer) clearTimeout(analysisTransitionTimer);

    analysisTransitionTimer = setTimeout(() => {
        analysisTransitionTimer = null;
        if (inputSection)   inputSection.style.display  = 'none';
        if (loadingSection) loadingSection.style.display = 'flex';
        if (resultSection)  resultSection.style.display  = 'none';
        if (inputSection)   inputSection.classList.remove('az-input-card--transitioning');
        startLoadingPhaseSequence(showResult);
    }, 680);
}

/* ============================================================
   显示解析结果（完全基于用户输入动态生成）
============================================================ */
function showResult() {
    const input = getUnifiedDreamInput();

    // 使用动态解析引擎，严格基于用户输入
    const result = analyzeUserDream(input);
    renderAnalysisResult(input, result);
}

function renderAnalysisResult(input, result, options = {}) {
    const { scroll = true, persist = true, refreshArt = persist } = options;
    analysisResult = result;

    const inputSection   = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection  = document.getElementById('resultSection');
    if (inputSection)   inputSection.style.display  = 'none';
    if (loadingSection) loadingSection.style.display = 'none';
    if (resultSection)  resultSection.style.display  = 'block';
    if (inputSection)   inputSection.classList.remove('az-input-card--transitioning');
    setAnalyzeViewState('result');
    clearLoadingPhaseTimers();
    setAnalyzeButtonLoading(false);

    const emotion = getEmotionCenter(result.emotions);
    const interpretation = buildDreamInterpretation(result, emotion.label, input);
    const actionGuidance = buildActionGuidance(result, input, emotion.label);

    // Hero
    const titleEl = document.getElementById('resultTitle');
    if (titleEl) titleEl.textContent = result.title;

    updateDreamClueModule(input, result, emotion.label);

    const dreamInterpretationLeadEl = document.getElementById('dreamInterpretationLead');
    if (dreamInterpretationLeadEl) dreamInterpretationLeadEl.textContent = interpretation.lead;

    const dreamInterpretationOverviewEl = document.getElementById('dreamInterpretationOverview');
    if (dreamInterpretationOverviewEl) dreamInterpretationOverviewEl.textContent = interpretation.overview;

    const dreamInterpretationEmotionEl = document.getElementById('dreamInterpretationEmotion');
    if (dreamInterpretationEmotionEl) dreamInterpretationEmotionEl.textContent = interpretation.emotion;

    const dreamInterpretationEmotionMixEl = document.getElementById('dreamInterpretationEmotionMix');
    if (dreamInterpretationEmotionMixEl) {
        dreamInterpretationEmotionMixEl.innerHTML = renderEmotionComposition(interpretation.emotionComposition);
    }

    const dreamInterpretationUnconsciousEl = document.getElementById('dreamInterpretationUnconscious');
    if (dreamInterpretationUnconsciousEl) dreamInterpretationUnconsciousEl.textContent = interpretation.unconscious;

    const dreamInterpretationPanelEl = document.getElementById('dreamInterpretationPanel');
    if (dreamInterpretationPanelEl) {
        dreamInterpretationPanelEl.classList.remove('is-refreshed');
        void dreamInterpretationPanelEl.offsetWidth;
        dreamInterpretationPanelEl.classList.add('is-refreshed');
    }

    // 行动建议
    const actionCueEl = document.getElementById('resultActionCue');
    if (actionCueEl) actionCueEl.textContent = actionGuidance.actionCue;

    const actionBodyEl = document.getElementById('resultActionBody');
    if (actionBodyEl) actionBodyEl.textContent = actionGuidance.actionBody;

    const directionCueEl = document.getElementById('resultDirectionCue');
    if (directionCueEl) directionCueEl.textContent = actionGuidance.directionCue;

    const directionBodyEl = document.getElementById('resultDirectionBody');
    if (directionBodyEl) directionBodyEl.textContent = actionGuidance.directionBody;

    // 结果页需要从页面顶部进入，避免 fixed 导航压住首个结果卡片
    if (scroll) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    persistAnalyzeDraft(input);
    if (persist) persistAnalyzeResultSnapshot(input, result);
    updateAnalyzeRouteState({ view: 'result' }, { replace: true });

    // 保存到本地：只在真实解析完成时写入，避免刷新结果页重复落库
    if (persist) {
        saveDreamToLocalStorage(input, result);
    }

    // 通知 AI 艺术模块
    if (refreshArt && typeof artOnAnalysisComplete === 'function') {
        artOnAnalysisComplete(input);
    }
}

/* ============================================================
   重置解析
============================================================ */
function resetAnalysis() {
    showAnalyzeInputView({ resetTop: true });
    updateAnalyzeRouteState({ view: 'input' }, { replace: true });
}

/* ============================================================
   保存梦境到本地存储（携带完整解析数据供日记页展示）
============================================================ */
function saveDreamToLocalStorage(text, analysis) {
    try {
        const dreams = JSON.parse(localStorage.getItem('dreamlens_diary') || '[]');
        const now    = new Date();
        const dateStr = now.toLocaleDateString('zh-CN');
        const isoDate = now.toISOString().split('T')[0];
        const ts      = Date.now();

        // 检测主题（与 diary.js 中的 detectThemeSimple 一致）
        const themeRules = [
            { theme:'water',  kws:['海','水','鱼','游','深'] },
            { theme:'chase',  kws:['追','跑','逃','腿','危'] },
            { theme:'fall',   kws:['坠落','落下','坠','飞'] },
            { theme:'forest', kws:['森林','树','门','迷'] },
            { theme:'house',  kws:['房子','家','房间','屋'] },
            { theme:'light',  kws:['光','星','亮'] }
        ];
        let theme = 'general';
        let bestScore = 0;
        for (const r of themeRules) {
            const s = r.kws.reduce((n, kw) => n + (text.includes(kw) ? 1 : 0), 0);
            if (s > bestScore) { bestScore = s; theme = r.theme; }
        }

        dreams.unshift({
            id:        String(ts),
            title:     analysis.title || '梦境解析记录',
            text:      text,                // 保存完整原文
            emotion:   selectedEmotion,
            date:      dateStr,
            isoDate:   isoDate,
            theme,
            timestamp: ts,
            // 完整 AI 解析数据（供日记页详情展示）
            analysis: {
                summary:    analysis.summary    || '',
                emotions:   analysis.emotions   || [],
                symbols:    analysis.symbols    || [],
                psychology: analysis.psychology || '',
                unconscious:analysis.unconscious|| '',
                advice:     analysis.advice     || ''
            }
        });

        if (dreams.length > 100) dreams.pop();
        localStorage.setItem('dreamlens_diary', JSON.stringify(dreams));
    } catch (e) { /* 忽略存储错误 */ }
}

/* ============================================================
   保存按钮（手动触发，跳转到日记页）
============================================================ */
function saveDream() {
    if (typeof showToast === 'function') showToast('✨ 已保存至梦境日记');
    // 延迟跳转，让 toast 显示后再跳
    setTimeout(() => { window.location.href = 'diary.html'; }, 1200);
}

function restoreAnalyzeStateFromRoute(options = {}) {
    const { scroll = false, allowLoadingSequence = false, forceTop = false } = options;
    const route = readAnalyzeRouteState();
    const ta = getTextarea();
    const snapshot = loadAnalyzeResultSnapshot();
    const storedDraft = loadAnalyzeDraft();

    if (forceTop && route.view !== 'input') {
        resetAnalyzeViewport();
    }

    if (ta && !ta.value && storedDraft) {
        ta.value = storedDraft;
        syncCharCount(ta.value.length);
    }

    if (typeof window.switchMode === 'function') {
        window.__dreamlensRouteHydrating = true;
        window.switchMode(route.mode);
        window.__dreamlensRouteHydrating = false;
    }

    const currentInput = getUnifiedDreamInput() || storedDraft || snapshot?.input || '';

    if (route.view === 'result') {
        const restored = snapshot?.result
            ? { input: snapshot.input || currentInput, result: snapshot.result }
            : (currentInput.length >= 20 ? { input: currentInput, result: analyzeUserDream(currentInput) } : null);

        if (restored) {
            if (snapshot?.selectedEmotion) selectedEmotion = snapshot.selectedEmotion;
            renderAnalysisResult(restored.input, restored.result, { scroll, persist: false });
            return;
        }
    }

    if (route.view === 'loading' && currentInput.length >= 20) {
        showAnalyzeLoadingView();
        if (allowLoadingSequence) {
            startLoadingPhaseSequence(showResult);
        } else {
            renderAnalysisResult(currentInput, snapshot?.result || analyzeUserDream(currentInput), { scroll, persist: false });
        }
        return;
    }

    showAnalyzeInputView({ scroll });
    if (route.view !== 'input') {
        updateAnalyzeRouteState({ view: 'input' }, { replace: true });
    }
}

function shareResult(platform) {
    const title = analysisResult ? `「${analysisResult.title}」` : '我的梦境';
    const url   = window.location.href;
    const text  = `我刚用 DreamLens 解析了一段梦境！${title} — 来探索你的潜意识吧：${url}`;
    if (platform === 'weibo') {
        window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}`, '_blank');
        if (typeof showToast === 'function') showToast('🔗 正在打开微博分享...');
    } else if (platform === 'wechat') {
        if (typeof showToast === 'function') showToast('📱 请截图后分享至朋友圈');
    }
}

function copyLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
            .then(() => { if (typeof showToast === 'function') showToast('✅ 链接已复制到剪贴板'); })
            .catch(() => { if (typeof showToast === 'function') showToast('✅ 链接已复制'); });
    } else {
        if (typeof showToast === 'function') showToast('✅ 链接已复制到剪贴板');
    }
}

function updateAnalyzeModeRoute(mode, options = {}) {
    updateAnalyzeRouteState({ mode }, { replace: options.replace !== false });
}

/* ============================================================
   暴露全局接口
============================================================ */
window.toggleChip    = toggleChip;
window.selectEmotion = selectEmotion;
window.insertExampleDream = insertExampleDream;
window.startAnalysis = startAnalysis;
window.resetAnalysis = resetAnalysis;
window.saveDream     = saveDream;
window.shareResult   = shareResult;
window.copyLink      = copyLink;
window.updateAnalyzeModeRoute = updateAnalyzeModeRoute;
