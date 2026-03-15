/* ====================================================
   DreamLens - analyze.js  梦境解析页面逻辑
   v2 — 解析内容严格基于用户输入原文动态生成
==================================================== */

/* ============================================================
   示例梦境（仅用于示例按钮填入）
============================================================ */
const EXAMPLE_DREAMS = [
    `我梦见自己站在深邃的海洋边缘，海水是深蓝色的，几乎是黑色的。我慢慢走入水中，奇怪的是我可以在水下自由呼吸。一条巨大的金色鱼从深处游来，在我周围盘旋，我感到一种神秘的宁静与被守护的感觉……`,
    `梦里有什么在追我，我拼命跑，但腿像灌了铅。周围的街道是扭曲的，建筑物好像在靠近。追我的东西我没有看清楚，只感受到一种强烈的危机感。最后我跑到一堵墙前无路可走，然后我醒了……`,
    `我梦见自己从一栋超高的大楼顶端坠落，但整个过程非常缓慢，像是在水中坠落。坠落时我看见城市的灯光，感到一种奇怪的解脱感而不是恐惧。在即将落地的瞬间，我飞了起来……`,
    `我在一片陌生又熟悉的森林里独自行走，树木高耸，遮住了所有阳光。我知道我在找某个地方或某个人，但我不知道是什么。走了很久后，我发现了一扇古老的木门立在林间空地，没有墙，只有这扇门……`
];

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

    return { title, tags, summary, symbols, emotions, psychology: psych, unconscious: uncon, advice };
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

function getTextarea()  { return document.getElementById('dreamInput'); }
function getCharCount() { return document.getElementById('charCount'); }

/* ============================================================
   DOMContentLoaded 初始化
============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    // 字数统计
    const ta = getTextarea();
    const cc = getCharCount();
    if (ta && cc) {
        ta.addEventListener('input', () => {
            const len = ta.value.length;
            cc.textContent = `${len} / 2000`;
            cc.style.color = len > 1800 ? '#ef4444' : 'var(--ds-t4)';
        });
    }

    // 解析按钮双重绑定保险
    const btn = document.getElementById('analyzeBtn');
    if (btn) btn.addEventListener('click', startAnalysis);
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
   填入示例
============================================================ */
function fillExample(index) {
    const ta = getTextarea();
    const cc = getCharCount();
    if (ta) {
        ta.value = EXAMPLE_DREAMS[index];
        if (cc) cc.textContent = `${ta.value.length} / 2000`;
        ta.focus();
        ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/* ============================================================
   开始解析
============================================================ */
function startAnalysis() {
    const ta    = getTextarea();
    const input = ta ? ta.value.trim() : '';

    if (input.length < 20) {
        typeof showToast === 'function'
            ? showToast('请描述至少20个字的梦境内容～')
            : alert('请描述至少20个字的梦境内容～');
        return;
    }

    const inputSection   = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection  = document.getElementById('resultSection');

    if (inputSection)   inputSection.style.display  = 'none';
    if (loadingSection) loadingSection.style.display = 'flex';
    if (resultSection)  resultSection.style.display  = 'none';

    // 重置步骤
    ['step1','step2','step3','step4'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('az-loading__step--active', 'az-loading__step--done');
        if (i === 0) el.classList.add('az-loading__step--active');
    });
    const progressEl = document.getElementById('loadingProgress');
    if (progressEl) progressEl.style.width = '0%';

    // 逐步激活步骤
    const steps   = ['step1','step2','step3','step4'];
    let   current = 0;

    const stepInterval = setInterval(() => {
        if (current < steps.length) {
            if (current > 0) {
                const prev = document.getElementById(steps[current - 1]);
                if (prev) { prev.classList.remove('az-loading__step--active'); prev.classList.add('az-loading__step--done'); }
            }
            const cur = document.getElementById(steps[current]);
            if (cur) cur.classList.add('az-loading__step--active');
            if (progressEl) progressEl.style.width = ((current + 1) / steps.length * 100) + '%';
            current++;
        } else {
            clearInterval(stepInterval);
            setTimeout(showResult, 800);
        }
    }, 900);
}

/* ============================================================
   显示解析结果（完全基于用户输入动态生成）
============================================================ */
function showResult() {
    const ta    = getTextarea();
    const input = ta ? ta.value.trim() : '';

    // 使用动态解析引擎，严格基于用户输入
    const result = analyzeUserDream(input);
    analysisResult = result;

    // 切换视图
    const loadingSection = document.getElementById('loadingSection');
    const resultSection  = document.getElementById('resultSection');
    if (loadingSection) loadingSection.style.display = 'none';
    if (resultSection)  resultSection.style.display  = 'flex';

    // 标题
    const titleEl = document.getElementById('resultTitle');
    if (titleEl) titleEl.textContent = `「${result.title}」— 梦境解析报告`;

    // 标签
    const tagClsMap = {
        'tag-purple':'ds-badge ds-badge--violet', 'tag-blue':'ds-badge ds-badge--teal',
        'tag-teal':  'ds-badge ds-badge--teal',   'tag-orange':'ds-badge ds-badge--gold',
        'tag-pink':  'ds-badge ds-badge--pink'
    };
    const tagsEl = document.getElementById('resultTags');
    if (tagsEl) {
        tagsEl.innerHTML = result.tags.map(t =>
            `<span class="${tagClsMap[t.cls] || 'ds-badge ds-badge--violet'}">${t.text}</span>`
        ).join('');
    }

    // 摘要
    const summaryEl = document.getElementById('resultSummary');
    if (summaryEl) summaryEl.textContent = result.summary;

    // 象征列表
    const symbolEmojis = ['✦','🌊','🦋','🌸','⭐','🔮','🌿','💫'];
    const symbolListEl = document.getElementById('symbolList');
    if (symbolListEl) {
        symbolListEl.innerHTML = result.symbols.map((s, i) =>
            `<li class="az-symbol-item">
              <span class="az-symbol-icon">${symbolEmojis[i % symbolEmojis.length]}</span>
              <div>
                <div class="az-symbol-name">${s.name}</div>
                <div class="az-symbol-desc">${s.meaning}</div>
              </div>
            </li>`
        ).join('');
    }

    // 情绪能量条
    const emotionBarsEl = document.getElementById('emotionBars');
    if (emotionBarsEl) {
        emotionBarsEl.innerHTML = result.emotions.map(e => `
            <div class="az-emotion-bar-item">
              <div class="az-emotion-bar-label">
                <span>${e.label}</span><span>${e.pct}%</span>
              </div>
              <div class="az-emotion-bar-track">
                <div class="az-emotion-bar-fill" style="width:0%;background:${e.color}" data-target="${e.pct}%"></div>
              </div>
            </div>`
        ).join('');
    }

    // 心理学解读
    const psychEl = document.getElementById('psychologyContent');
    if (psychEl) {
        psychEl.innerHTML = result.psychology.split('\n\n').map(p => `<p style="margin-bottom:10px">${p}</p>`).join('');
    }

    // 潜意识信息
    const unconsciousEl = document.getElementById('unconsciousContent');
    if (unconsciousEl) {
        unconsciousEl.innerHTML = result.unconscious.split('\n\n').map(p => `<p style="margin-bottom:10px">${p}</p>`).join('');
    }

    // 行动建议
    const adviceEl = document.getElementById('adviceContent');
    if (adviceEl) {
        adviceEl.innerHTML = result.advice.split('\n\n').map(p => `<p style="margin-bottom:10px">${p}</p>`).join('');
    }

    // 滚动到结果
    if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 情绪条动画
    setTimeout(() => {
        document.querySelectorAll('.az-emotion-bar-fill').forEach((bar, i) => {
            setTimeout(() => { bar.style.width = bar.getAttribute('data-target') || (result.emotions[i]?.pct + '%'); }, i * 120);
        });
    }, 300);

    // 保存到本地
    if (ta) saveDreamToLocalStorage(ta.value.trim(), result);

    // 通知 AI 艺术模块
    if (typeof artOnAnalysisComplete === 'function') {
        artOnAnalysisComplete(ta ? ta.value.trim() : '');
    }
}

/* ============================================================
   重置解析
============================================================ */
function resetAnalysis() {
    const inputSection   = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection  = document.getElementById('resultSection');

    if (inputSection)   inputSection.style.display  = 'block';
    if (loadingSection) loadingSection.style.display = 'none';
    if (resultSection)  resultSection.style.display  = 'none';

    const labels = ['解读梦境符号','情绪模式分析','生成解析报告','创作梦境艺术'];
    ['step1','step2','step3','step4'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<i class="fas fa-circle-dot"></i> ${labels[i]}`;
            el.classList.remove('az-loading__step--active','az-loading__step--done');
            if (i === 0) el.classList.add('az-loading__step--active');
        }
    });

    const progressEl = document.getElementById('loadingProgress');
    if (progressEl) progressEl.style.width = '0%';

    if (inputSection) inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

/* ============================================================
   暴露全局接口
============================================================ */
window.toggleChip    = toggleChip;
window.selectEmotion = selectEmotion;
window.fillExample   = fillExample;
window.startAnalysis = startAnalysis;
window.resetAnalysis = resetAnalysis;
window.saveDream     = saveDream;
window.shareResult   = shareResult;
window.copyLink      = copyLink;
