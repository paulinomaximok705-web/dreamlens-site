const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_PRIMARY_MAX_TOKENS = Number.parseInt(process.env.DEEPSEEK_ANALYZE_MAX_TOKENS || '760', 10);
const DEEPSEEK_RECOVERY_MAX_TOKENS = Number.parseInt(process.env.DEEPSEEK_ANALYZE_RECOVERY_MAX_TOKENS || '620', 10);
const DEEPSEEK_REFINEMENT_MAX_TOKENS = Number.parseInt(process.env.DEEPSEEK_ANALYZE_REFINEMENT_MAX_TOKENS || '720', 10);
const DEEPSEEK_REPAIR_MAX_TOKENS = Number.parseInt(process.env.DEEPSEEK_ANALYZE_REPAIR_MAX_TOKENS || '520', 10);
const DEEPSEEK_RESCUE_MAX_TOKENS = Number.parseInt(process.env.DEEPSEEK_ANALYZE_RESCUE_MAX_TOKENS || '560', 10);

const ALLOWED_THEMES = new Set(['water', 'chase', 'fall', 'fly', 'forest', 'house', 'death', 'light', 'general']);
const ALLOWED_EMOTION_LABELS = ['宁静', '焦虑', '神秘', '自由', '迷惘', '恐惧', '好奇', '压迫'];
const DEFAULT_TAGS = ['梦境记录', '潜意识', '夜间片段'];
const DEFAULT_SYMBOLS = [
  { name: '梦境场景', meaning: '梦里的空间与环境，往往映照你当下最需要被看见的内在处境。' },
  { name: '情绪残留', meaning: '醒来后留下来的感觉，通常比情节本身更接近这场梦真正想说的话。' },
  { name: '行动边界', meaning: '梦里那些靠近、停下或反复出现的动作，常常对应现实里的心理边界。' }
];
const DEFAULT_EMOTIONS = [
  { label: '神秘', pct: 31 },
  { label: '宁静', pct: 27 },
  { label: '迷惘', pct: 22 },
  { label: '好奇', pct: 20 }
];
const DEFAULT_INTERPRETATION_COMPOSITION = [
  { key: 'attraction', label: '被吸引', pct: 30, tone: 'violet' },
  { key: 'calm', label: '平静', pct: 24, tone: 'moon' },
  { key: 'hesitation', label: '迟疑', pct: 24, tone: 'slate' },
  { key: 'curiosity', label: '好奇', pct: 22, tone: 'cyan' }
];
const COMPOSITION_PRESETS = {
  calm: { key: 'calm', label: '平静', tone: 'moon' },
  unease: { key: 'unease', label: '轻微不安', tone: 'ember' },
  attraction: { key: 'attraction', label: '被吸引', tone: 'violet' },
  hesitation: { key: 'hesitation', label: '迟疑', tone: 'slate' },
  pressure: { key: 'pressure', label: '压力', tone: 'ember' },
  vigilance: { key: 'vigilance', label: '防御', tone: 'ember' },
  release: { key: 'release', label: '舒展', tone: 'pearl' },
  curiosity: { key: 'curiosity', label: '好奇', tone: 'cyan' }
};
const EMOTION_TO_COMPOSITION = {
  宁静: COMPOSITION_PRESETS.calm,
  焦虑: COMPOSITION_PRESETS.unease,
  神秘: COMPOSITION_PRESETS.attraction,
  自由: COMPOSITION_PRESETS.release,
  迷惘: COMPOSITION_PRESETS.hesitation,
  恐惧: COMPOSITION_PRESETS.vigilance,
  好奇: COMPOSITION_PRESETS.curiosity,
  压迫: COMPOSITION_PRESETS.pressure
};

function normalizeString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeParagraph(value, fallback = '') {
  const text = normalizeString(value, fallback).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return text;
}

function normalizeTheme(value, fallback = 'general') {
  const theme = normalizeString(value, fallback);
  return ALLOWED_THEMES.has(theme) ? theme : fallback;
}

function normalizeTags(value, fallback = DEFAULT_TAGS) {
  const tags = Array.isArray(value)
    ? value.map((item) => normalizeString(item)).filter(Boolean)
    : [];
  return (tags.length ? tags : fallback).slice(0, 4);
}

function normalizeScaffoldInterpretation(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    lead: normalizeString(value.lead),
    overview: normalizeString(value.overview),
    emotion: normalizeString(value.emotion),
    emotionComposition: Array.isArray(value.emotionComposition) ? value.emotionComposition : [],
    unconscious: normalizeString(value.unconscious)
  };
}

function normalizeScaffoldActionGuidance(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    actionCue: normalizeString(value.actionCue),
    actionBody: normalizeString(value.actionBody),
    directionCue: normalizeString(value.directionCue),
    directionBody: normalizeString(value.directionBody)
  };
}

function normalizeSymbols(value, fallback = DEFAULT_SYMBOLS) {
  const symbols = Array.isArray(value)
    ? value
      .map((item) => ({
        name: normalizeString(item?.name),
        meaning: normalizeString(item?.meaning)
      }))
      .filter((item) => item.name && item.meaning)
    : [];

  const merged = [...symbols];
  for (const fallbackItem of fallback) {
    if (merged.length >= 4) break;
    if (!merged.some((item) => item.name === fallbackItem.name)) {
      merged.push(fallbackItem);
    }
  }

  return merged.slice(0, 4);
}

function normalizePercentArray(items) {
  const safe = Array.isArray(items)
    ? items
      .map((item) => ({
        ...item,
        pct: Number.isFinite(Number(item?.pct)) ? Number(item.pct) : 0
      }))
      .filter((item) => item.pct > 0)
    : [];

  if (!safe.length) return [];
  const total = safe.reduce((sum, item) => sum + item.pct, 0);
  if (!total) return [];

  let running = 0;
  const normalized = safe.map((item, index) => {
    if (index === safe.length - 1) {
      return { ...item, pct: Math.max(1, 100 - running) };
    }
    const pct = Math.max(1, Math.round((item.pct / total) * 100));
    running += pct;
    return { ...item, pct };
  });

  const diff = 100 - normalized.reduce((sum, item) => sum + item.pct, 0);
  if (diff && normalized[0]) normalized[0].pct = Math.max(1, normalized[0].pct + diff);
  return normalized;
}

function normalizeEmotions(value, fallback = DEFAULT_EMOTIONS) {
  const emotions = Array.isArray(value)
    ? value
      .map((item) => ({
        label: normalizeString(item?.label),
        pct: Number(item?.pct)
      }))
      .filter((item) => ALLOWED_EMOTION_LABELS.includes(item.label) && Number.isFinite(item.pct))
    : [];

  const normalized = normalizePercentArray(emotions);
  return (normalized.length ? normalized : fallback).slice(0, 4);
}

function normalizeEmotionComposition(value, emotionFallback = DEFAULT_EMOTIONS) {
  const items = Array.isArray(value)
    ? value
      .map((item) => {
        const preset = COMPOSITION_PRESETS[normalizeString(item?.key)] || null;
        const label = normalizeString(item?.label, preset?.label || '');
        const tone = normalizeString(item?.tone, preset?.tone || '');
        const key = normalizeString(item?.key, preset?.key || '');
        const pct = Number(item?.pct);
        if (!label || !key || !tone || !Number.isFinite(pct)) return null;
        return { key, label, tone, pct };
      })
      .filter(Boolean)
    : [];

  const normalized = normalizePercentArray(items);
  if (normalized.length >= 3) return normalized.slice(0, 4);

  const derived = normalizePercentArray(
    emotionFallback
      .map((item) => {
        const preset = EMOTION_TO_COMPOSITION[item.label];
        if (!preset) return null;
        return { ...preset, pct: item.pct };
      })
      .filter(Boolean)
  );

  return (derived.length ? derived : DEFAULT_INTERPRETATION_COMPOSITION).slice(0, 4);
}

function parseJsonContent(content) {
  if (!content) return null;
  const raw = String(content).trim();
  const candidates = [raw];

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    candidates.push(fenceMatch[1].trim());
  }

  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }

  for (const candidate of candidates) {
    const repaired = repairJsonLikeContent(candidate);
    if (!repaired) continue;
    try {
      return JSON.parse(repaired);
    } catch (_) {}
  }

  return null;
}

function repairJsonLikeContent(content) {
  const raw = normalizeString(content);
  if (!raw) return '';

  return raw
    .replace(/\uFEFF/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
    .replace(/([{,]\s*)'([^'\\]+?)'(\s*:)/g, '$1"$2"$3')
    .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'(?=\s*[,}\]])/g, (_, value) => `: ${JSON.stringify(value)}`);
}

function collectMessageContent(result) {
  const content = normalizeString(result?.content);
  if (!content) return '';
  return content;
}

function summarizeDebugContent(content) {
  return normalizeString(content)
    .replace(/\s+/g, ' ')
    .slice(0, 220);
}

function summarizeDebugTail(content) {
  return normalizeString(content)
    .replace(/\s+/g, ' ')
    .slice(-120);
}

const FRAMEWORK_MARKERS = [
  '荣格', '周公', '东方', '阴阳', '五行', '阈限', '阴影', '自性', '人格面具', '阿尼玛', '阿尼姆斯', '家宅', '门槛', '山水'
];

const ANALYSIS_SYSTEM_RULES = [
  '你是 DreamLens 的梦境解析助手，需要基于用户原文输出结果页直接可用的结构化 JSON。',
  '只允许输出合法 JSON，不要输出 Markdown、解释、标题、代码块。',
  '语言必须是简体中文，语气细腻、安静、直接、有洞察力，但不要玄学化、不要广告化、不要空泛鸡汤。',
  '解读必须尽量贴着梦本身来写：优先抓原文中的画面、声音、动作、空间关系、颜色变化和醒来后的感受，不要先讲大而空的道理。',
  '不要杜撰原文没有出现的具体情节，只能沿着原文里的意象和动作做心理层面的延展。',
  '解析必须融合三个层次：东方象征意义、荣格分析心理学、周公解梦中的传统意象语义；不要只提理论名字，必须说明它们如何对应梦里的具体画面。',
  '引用周公解梦时，不要写宿命式吉凶断语，不要直接说“预示发财”“必有灾祸”之类的话；要把它转写为传统文化中的象征含义，再和现代心理线索对照。',
  '引用荣格时，优先使用有原文支撑的具体概念，例如阴影、阈限、人格面具、阿尼玛/阿尼姆斯、自性、个体化、自我与无意识的关系；不要空喊“潜意识”“原型”却不解释。',
  '引用东方象征时，可结合阴阳、五行、山水、家宅、门槛、桥路、方位、颜色、动物、月夜、水火等传统语义，但必须和梦里的实际细节一一对应。',
  '每个主要意象至少回答三件事：它在梦里是怎样出现的；它在某个文化/心理框架里意味着什么；把它放回这场梦，更像哪一种现实中的情绪冲突、关系压力或内在拉扯。',
  '如果原文细节不足，不要硬凑三套理论；宁可只抓 1 到 2 个核心意象做扎实解释，也不要泛泛铺开。',
  '少用套话，避免反复出现“这场梦在说”“潜意识在提醒你”“某个方向正在浮现”“你需要学会”这类空泛句式。',
  '尽量少谈宽泛的人生成长、疗愈、自我觉察，除非它能被梦里的具体细节明确支撑。',
  '每一段最好都能落回梦里的具体线索，例如门、森林、水声、楼梯、追逐、停下、回头、醒来后的残留感。',
  '强调梦境感、夜色感、潜意识线索，但表达必须清楚、克制、具体。',
  '宁可短一些，也不要拖成长段套话；能用更少的话说清楚，就不要写长。',
  '不要把任何参数、UI、按钮、模型信息写进输出。'
];

const ANALYSIS_USER_REQUIREMENTS = [
  '1. theme 必须是指定枚举之一。',
  '2. tags 只输出简短中文标签。',
  '3. emotions 输出 4 项左右，百分比总和约为 100。',
  '4. interpretation.emotionComposition 需要输出 4 项左右，总和约为 100。',
  '5. 如果原文明显包含森林、门、海浪、下沉、平静与迟疑这些线索，请优先准确反映。',
  '6. summary 必须直接点出梦里最关键的 1 到 2 个画面，以及这些画面之间最具体的心理张力。',
  '7. symbols 至少覆盖 3 个关键意象，优先写最反复、最异常、最有情绪重量的意象。meaning 要具体写出它在东方象征、荣格或周公语义中的对应，不要只写“代表成长”“象征变化”这种空话。',
  '8. psychology 尽量写成 3 段：第一段偏荣格心理学，第二段偏东方象征或周公传统，第三段把两者收束回做梦者当下的真实处境。每段都必须引用梦里细节，不要空谈理论。',
  '9. unconscious / advice / interpretation.* 要尽量少套话，多落回梦里的具体意象、动作、情绪和关系位置。',
  '10. actionGuidance 也要具体，不要写成空泛建议；优先给出能立即执行的小动作，例如记录哪个意象、回想哪一幕、补写哪种醒后感受。',
  '11. 如果用到传统解梦或原型概念，必须解释为什么它和这场梦有关，不能只报术语名称。',
  '12. 整体文字预算要克制，优先把 summary、overview、advice 写短，不要为了完整性把每个字段都拉长。',
  '13. 输出必须是纯 JSON，不要有任何额外文本。'
];

const RECOVERY_SYSTEM_RULES = [
  '你是 DreamLens 的梦境解析助手。',
  '上一次输出没有成功解析，这一次请只返回合法 JSON，不要输出任何解释、Markdown、代码块或多余文字。',
  '所有字段都可以写得更短、更直接，但必须完整。',
  '优先根据梦里最明确的画面、动作、声音、空间关系和醒来后的感受来写，不要套话。',
  '仍然要融入荣格心理学、东方象征和周公解梦中的传统意象语义，但只能写和原文细节直接对应的部分。',
  '周公相关内容只作为传统文化象征参考，不要写宿命吉凶判断。',
  '如果某个字段拿不准，就写得克制、简短，也不要离开梦本身。'
];

const RECOVERY_USER_REQUIREMENTS = [
  '1. summary 要直接点明最关键的梦中画面。',
  '2. symbols 的 meaning 不要空泛，至少落到一个具体框架或具体心理冲突。',
  '3. psychology 尽量覆盖荣格角度 + 东方/周公角度，并回到现实心理处境。',
  '4. advice 只给具体可执行的小动作。',
  '5. 所有字段写短一点也可以，但必须完整，尤其不要把 summary 和 interpretation 拉太长。',
  '6. 只返回 JSON。'
];

function buildRepairMessages(rawContent, dreamText, scaffold = {}) {
  const compactSchema = {
    title: '梦境标题',
    theme: 'water/chase/fall/fly/forest/house/death/light/general 之一',
    tags: ['简短中文标签'],
    summary: '1段总结',
    symbols: [{ name: '意象名', meaning: '具体含义' }],
    emotions: [{ label: '情绪名', pct: 30 }],
    psychology: '3段心理分析',
    unconscious: '3小段',
    advice: '3小段',
    interpretation: {
      lead: '一句核心判断',
      overview: '补充正文',
      emotion: '情绪分析',
      emotionComposition: [{ key: 'pressure', label: '压迫', pct: 30, tone: 'ember' }],
      unconscious: '潜意识传达'
    },
    actionGuidance: {
      actionCue: '一句行动提示',
      actionBody: '行动正文',
      directionCue: '一句继续观察提示',
      directionBody: '继续观察正文'
    }
  };

  return [
    {
      role: 'system',
      content: [
        '你是 JSON 修复助手。',
        '下面会给你一段 DreamLens 解析模型输出的原始文本，它不是合法 JSON。',
        '请保留其中有价值的解析内容，修复为合法 JSON。',
        '如果原始文本里缺少某些字段，就根据梦境原文和 scaffold 补全，但不要脱离原梦。',
        '只返回合法 JSON，不要输出解释、Markdown、代码块。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        '梦境原文：',
        dreamText,
        '',
        'scaffold：',
        JSON.stringify(scaffold, null, 2),
        '',
        '需要修复的原始文本：',
        rawContent,
        '',
        '目标 JSON 结构：',
        JSON.stringify(compactSchema, null, 2)
      ].join('\n')
    }
  ];
}

function buildRescueMessages(dreamText, scaffold = {}) {
  const miniSchema = {
    title: '梦境标题，2到10字',
    theme: 'water/chase/fall/fly/forest/house/death/light/general 之一',
    tags: ['3个简短中文标签'],
    summary: '55到80字',
    symbols: [{ name: '意象名', meaning: '24到42字，必须具体' }],
    emotions: [{ label: '情绪名', pct: 30 }],
    psychology: '3段，总计120到180字',
    unconscious: '3小段，总计80到120字',
    advice: '3小段，总计80到120字'
  };

  return [
    {
      role: 'system',
      content: [
        '你是 DreamLens 的救援解析助手。',
        '前面的输出没有成功，现在请只生成最核心且稳定的 JSON 字段。',
        '必须具体、贴近梦的画面，必须带荣格、东方象征或周公语义中的至少两个明确对应。',
        '只返回合法 JSON，不要输出解释、Markdown、代码块。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        '请根据这段梦境生成一份稳定、具体的最小可用 JSON：',
        '',
        '梦境原文：',
        dreamText,
        '',
        'scaffold：',
        JSON.stringify(scaffold, null, 2),
        '',
        '目标 JSON 结构：',
        JSON.stringify(miniSchema, null, 2)
      ].join('\n')
    }
  ];
}

function normalizeComparableText(value) {
  return normalizeString(value)
    .replace(/[\s\u3000]/g, '')
    .replace(/[，。、“”‘’：:；;、,.!?！？（）()【】《》<>—\-]/g, '')
    .toLowerCase();
}

function isSummaryTooCloseToDream(summary, dreamText) {
  const normalizedSummary = normalizeComparableText(summary);
  const normalizedDream = normalizeComparableText(dreamText);

  if (!normalizedSummary || !normalizedDream) return false;
  if (normalizedSummary === normalizedDream) return true;

  const shorter = normalizedSummary.length < normalizedDream.length ? normalizedSummary : normalizedDream;
  const longer = shorter === normalizedSummary ? normalizedDream : normalizedSummary;
  return shorter.length >= 18 && longer.includes(shorter) && shorter.length / longer.length > 0.6;
}

function countFrameworkBackedSymbols(symbols) {
  if (!Array.isArray(symbols)) return 0;
  return symbols
    .slice(0, 3)
    .filter((item) => FRAMEWORK_MARKERS.some((marker) => normalizeString(item?.meaning).includes(marker)))
    .length;
}

function countParagraphs(text) {
  return normalizeParagraph(text)
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .length;
}

function needsQualityRefinement(payload, dreamText) {
  if (!payload || typeof payload !== 'object') return false;

  const summaryTooClose = isSummaryTooCloseToDream(payload.summary, dreamText);
  const symbolSpecificityTooLow = countFrameworkBackedSymbols(payload.symbols) < 2;
  const psychologyTooThin = countParagraphs(payload.psychology) < 3;

  return summaryTooClose || symbolSpecificityTooLow || psychologyTooThin;
}

function buildRefinementMessages(dreamText, scaffold = {}, payload = {}) {
  return [
    {
      role: 'system',
      content: [
        '你是 DreamLens 的梦境解析助手，现在需要在保留 JSON 结构的前提下，把一份过于泛化的解析改写得更具体、更有理论支撑。',
        '只返回合法 JSON，不要输出解释、Markdown、代码块。',
        'summary 不能只是复述用户原梦，必须提炼梦里最关键的心理张力。',
        '前 3 个 symbols.meaning 至少有 2 个要明确写出荣格、东方象征或周公语义中的具体对应，并落回这场梦里的情绪、关系或行动冲突。',
        'psychology 请写成 3 段：第一段偏荣格，第二段偏东方象征/周公，第三段回到这位做梦者当下的具体处境。',
        '周公语义只能作为传统文化象征参考，不要写吉凶预言。',
        '不要空话，不要模板句，不要只说“象征变化”“代表成长”“提示你关注自己”。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        '请重写下面这份解析 JSON，让它更具体：',
        '',
        '梦境原文：',
        dreamText,
        '',
        '本地结构线索：',
        JSON.stringify(scaffold, null, 2),
        '',
        '当前过于泛化的 JSON：',
        JSON.stringify(payload, null, 2),
        '',
        '重写要求：',
        '1. 保持字段结构不变，仍然输出完整 JSON。',
        '2. title / theme / tags 可以微调，但不要脱离原梦。',
        '3. summary 必须是提炼，不是照抄。',
        '4. symbols.meaning 要更具体，至少有两个写出明确框架及其在这场梦里的含义。',
        '5. psychology 必须三段分明，并且每段都要引用原梦里的具体线索，例如场景、门槛、动物、水、追逐、停下、回头、醒后感受等对应部分。',
        '6. unconscious / advice / interpretation.* 也要更贴近梦里的动作和情绪，不要空泛。',
        '7. 只返回 JSON。'
      ].join('\n')
    }
  ];
}

function buildMessages(dreamText, scaffold = {}) {
  const scaffoldSummary = JSON.stringify({
    title: scaffold.title || '',
    theme: scaffold.theme || 'general',
    tags: Array.isArray(scaffold.tags) ? scaffold.tags : [],
    symbols: Array.isArray(scaffold.symbols) ? scaffold.symbols : [],
    emotions: Array.isArray(scaffold.emotions) ? scaffold.emotions : []
  }, null, 2);

  const schema = {
    title: '梦境标题，2到12个字',
    theme: '只能是 water/chase/fall/fly/forest/house/death/light/general 之一',
    tags: ['3个简短中文标签'],
    summary: '1段总结，40到68字',
    symbols: [{ name: '意象名', meaning: '该意象的心理含义，18到34字，要点出具体框架或心理冲突' }],
    emotions: [{ label: '宁静/焦虑/神秘/自由/迷惘/恐惧/好奇/压迫 之一', pct: 30 }],
    psychology: '3段，整体96到156字，用\\n\\n分段',
    unconscious: '3小段，用①②③开头，总体66到108字',
    advice: '3小段，用①②③开头，总体66到108字',
    interpretation: {
      lead: '统一解读核心判断，16到28字',
      overview: '统一解读补充正文，28到56字',
      emotion: '情绪能量分析，32到60字',
      emotionComposition: [
        { key: 'attraction/hesitation/calm/unease/pressure/vigilance/release/curiosity', label: '中文情绪名', pct: 30, tone: 'violet/slate/moon/ember/pearl/cyan' }
      ],
      unconscious: '潜意识传达，32到60字'
    },
    actionGuidance: {
      actionCue: '现在就能做的一句提示，12到20字',
      actionBody: '具体的小动作，22到52字',
      directionCue: '继续留意的一句提示，12到20字',
      directionBody: '继续观察的方向，22到52字'
    }
  };

  return [
    {
      role: 'system',
      content: ANALYSIS_SYSTEM_RULES.join('\n')
    },
    {
      role: 'user',
      content: [
        '请分析这段梦境原文，并返回指定 JSON：',
        '',
        '梦境原文：',
        dreamText,
        '',
        '本地识别出的结构线索（仅供参考，不要机械复述）：',
        scaffoldSummary,
        '',
        '输出 JSON 的字段结构：',
        JSON.stringify(schema, null, 2),
        '',
        '额外要求：',
        ...ANALYSIS_USER_REQUIREMENTS
      ].join('\n')
    }
  ];
}

function buildRecoveryMessages(dreamText, scaffold = {}) {
  const scaffoldSummary = JSON.stringify({
    title: scaffold.title || '',
    theme: scaffold.theme || 'general',
    tags: Array.isArray(scaffold.tags) ? scaffold.tags : [],
    symbols: Array.isArray(scaffold.symbols) ? scaffold.symbols : [],
    emotions: Array.isArray(scaffold.emotions) ? scaffold.emotions : []
  }, null, 2);

  const compactSchema = {
    title: '梦境标题，2到10字',
    theme: 'water/chase/fall/fly/forest/house/death/light/general 之一',
    tags: ['3个简短中文标签'],
    summary: '1段总结，36到60字',
    symbols: [{ name: '意象名', meaning: '心理含义，18到30字，要带具体框架' }],
    emotions: [{ label: '宁静/焦虑/神秘/自由/迷惘/恐惧/好奇/压迫 之一', pct: 30 }],
    psychology: '3段，整体90到138字，用\\n\\n分段',
    unconscious: '3小段，用①②③开头，总体60到96字',
    advice: '3小段，用①②③开头，总体60到96字',
    interpretation: {
      lead: '统一解读核心判断，16到26字',
      overview: '统一解读补充正文，26到48字',
      emotion: '情绪能量分析，28到52字',
      emotionComposition: [
        { key: 'attraction/hesitation/calm/unease/pressure/vigilance/release/curiosity', label: '中文情绪名', pct: 30, tone: 'violet/slate/moon/ember/pearl/cyan' }
      ],
      unconscious: '潜意识传达，28到52字'
    },
    actionGuidance: {
      actionCue: '现在就能做的一句提示，12到20字',
      actionBody: '具体的小动作，20到46字',
      directionCue: '继续留意的一句提示，12到20字',
      directionBody: '继续观察的方向，20到46字'
    }
  };

  return [
    {
      role: 'system',
      content: RECOVERY_SYSTEM_RULES.join('\n')
    },
    {
      role: 'user',
      content: [
        '请重新分析这段梦境原文，并严格返回合法 JSON：',
        '',
        '梦境原文：',
        dreamText,
        '',
        '本地识别出的结构线索（仅供参考，不要机械复述）：',
        scaffoldSummary,
        '',
        '输出 JSON 的字段结构：',
        JSON.stringify(compactSchema, null, 2),
        '',
        '额外要求：',
        ...RECOVERY_USER_REQUIREMENTS
      ].join('\n')
    }
  ];
}

async function requestDeepSeek(apiKey, messages, options = {}) {
  const attempts = Math.max(1, Number.parseInt(String(options.attempts ?? 2), 10) || 2);
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          temperature: options.temperature ?? 0.35,
          max_tokens: options.maxTokens ?? 1050,
          response_format: { type: 'json_object' },
          messages
        })
      });

      const rawText = await response.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (_) {
        data = null;
      }

      const result = {
        response,
        data,
        content: data?.choices?.[0]?.message?.content || '',
        finishReason: normalizeString(data?.choices?.[0]?.finish_reason)
      };

      if (response.ok || attempt === attempts - 1 || ![408, 409, 429, 500, 502, 503, 504].includes(response.status)) {
        return result;
      }

      lastError = new Error(data?.error?.message || data?.error || `DeepSeek temporary error ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1) throw error;
    }

    await delay(320 * (attempt + 1));
  }

  throw lastError || new Error('DeepSeek analyze request failed');
}

async function tryParseOrRepair(apiKey, rawContent, dreamText, scaffold = {}) {
  return parseJsonContent(rawContent);
}

function normalizeAnalysisPayload(payload = {}, scaffold = {}, meta = {}) {
  const useScaffoldNarrativeFallback = meta.source === 'stable-fallback' || meta.provider === 'local' || meta.usedFallback;
  const fallbackTheme = normalizeTheme(scaffold.theme, 'general');
  const fallbackTitle = normalizeString(scaffold.title, '梦境解析');
  const fallbackTags = normalizeTags(scaffold.tags, DEFAULT_TAGS);
  const fallbackSymbols = normalizeSymbols(scaffold.symbols, DEFAULT_SYMBOLS);
  const fallbackEmotions = normalizeEmotions(scaffold.emotions, DEFAULT_EMOTIONS);
  const fallbackInterpretation = useScaffoldNarrativeFallback ? normalizeScaffoldInterpretation(scaffold.interpretation) : null;
  const fallbackActionGuidance = useScaffoldNarrativeFallback ? normalizeScaffoldActionGuidance(scaffold.actionGuidance) : null;
  const fallbackSummary = useScaffoldNarrativeFallback
    ? normalizeString(scaffold.summary, '这场梦把一些白天还没说清的感受重新带回了你面前。')
    : '这场梦把一些白天还没说清的感受重新带回了你面前。';
  const fallbackPsychology = useScaffoldNarrativeFallback
    ? normalizeString(scaffold.psychology, '这场梦里最反复的画面、声音和动作，往往比结论更接近你当下真正卡住或在意的位置。')
    : '这场梦里最反复的画面、声音和动作，往往比结论更接近你当下真正卡住或在意的位置。';
  const fallbackUnconscious = useScaffoldNarrativeFallback
    ? normalizeString(scaffold.unconscious, '① 先看梦里反复出现的画面。\n\n② 再看你在梦里是靠近、停下，还是绕开它。\n\n③ 这些动作通常比抽象结论更接近这场梦真正的重心。')
    : '① 先看梦里反复出现的画面。\n\n② 再看你在梦里是靠近、停下，还是绕开它。\n\n③ 这些动作通常比抽象结论更接近这场梦真正的重心。';
  const fallbackAdvice = useScaffoldNarrativeFallback
    ? normalizeString(scaffold.advice, '① 先写下梦里最清楚的一幕。\n\n② 再补一句醒来后残留最久的感受。\n\n③ 只记录具体细节，先不要急着替它下结论。')
    : '① 先写下梦里最清楚的一幕。\n\n② 再补一句醒来后残留最久的感受。\n\n③ 只记录具体细节，先不要急着替它下结论。';

  const emotions = normalizeEmotions(payload.emotions, fallbackEmotions);
  const interpretation = payload.interpretation || {};
  const actionGuidance = payload.actionGuidance || {};

  return {
    source: meta.source || 'deepseek',
    provider: meta.provider || 'deepseek',
    model: meta.model || DEEPSEEK_MODEL,
    _usedFallback: !!meta.usedFallback,
    _fallbackMessage: normalizeString(meta.fallbackMessage),
    title: normalizeString(payload.title, fallbackTitle),
    theme: normalizeTheme(payload.theme, fallbackTheme),
    tags: normalizeTags(payload.tags, fallbackTags),
    summary: normalizeParagraph(payload.summary, fallbackSummary),
    symbols: normalizeSymbols(payload.symbols, fallbackSymbols),
    emotions,
    psychology: normalizeParagraph(payload.psychology, fallbackPsychology),
    unconscious: normalizeParagraph(payload.unconscious, fallbackUnconscious),
    advice: normalizeParagraph(payload.advice, fallbackAdvice),
    interpretation: {
      lead: normalizeParagraph(interpretation.lead, normalizeString(fallbackInterpretation?.lead, '这场梦把最关键的画面放在你面前，让你看见自己正在靠近什么，又为什么会停一下。')),
      overview: normalizeParagraph(interpretation.overview, normalizeString(fallbackInterpretation?.overview, '梦里的画面不是分开的：场景、声音和动作连在一起，才能看出它真正聚焦的心理位置。')),
      emotion: normalizeParagraph(interpretation.emotion, normalizeString(fallbackInterpretation?.emotion, '这场梦里的情绪不是单一的，它通常会跟着画面和动作一起变化。')),
      emotionComposition: normalizeEmotionComposition(interpretation.emotionComposition, normalizeEmotions(payload.emotions, fallbackEmotions)),
      unconscious: normalizeParagraph(interpretation.unconscious, normalizeString(fallbackInterpretation?.unconscious, '梦里最反复的细节，通常不是为了给出漂亮结论，而是为了把真正重要的那一点留在你面前。'))
    },
    actionGuidance: {
      actionCue: normalizeString(actionGuidance.actionCue, normalizeString(fallbackActionGuidance?.actionCue, '先记下梦里最具体的一个细节。')),
      actionBody: normalizeParagraph(actionGuidance.actionBody, normalizeString(fallbackActionGuidance?.actionBody, '先把那一幕写下来：它发生在哪里，里面有什么声音、光线、动作，醒来后你身体里还留着什么感觉。')),
      directionCue: normalizeString(actionGuidance.directionCue, normalizeString(fallbackActionGuidance?.directionCue, '接下来，继续留意梦里那个最反复的意象。')),
      directionBody: normalizeParagraph(actionGuidance.directionBody, normalizeString(fallbackActionGuidance?.directionBody, '先不要急着把它解释成某种大道理。只要观察它在现实里会不会以相似的情绪、场景或动作再次出现。'))
    }
  };
}

module.exports = async (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const debug = requestUrl.searchParams.get('debug') === '1' || req.headers['x-dreamlens-debug'] === '1';
  const trace = [];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { dreamText = '', scaffold = {} } = req.body || {};
  const normalizedDreamText = normalizeString(dreamText);

  if (normalizedDreamText.length < 20) {
    res.status(400).json({ error: 'Dream text is too short' });
    return;
  }

  if (!apiKey) {
    res.status(500).json({ error: 'Missing DEEPSEEK_API_KEY' });
    return;
  }

  try {
    const primary = await requestDeepSeek(apiKey, buildMessages(normalizedDreamText, scaffold), {
      temperature: 0.18,
      maxTokens: DEEPSEEK_PRIMARY_MAX_TOKENS,
      attempts: 2
    });
    const primaryContent = collectMessageContent(primary);
    let payload = primary.response.ok
      ? await tryParseOrRepair(apiKey, primaryContent, normalizedDreamText, scaffold)
      : null;

    if (debug) {
      trace.push({
        step: 'primary',
        status: primary.response.status,
        parsed: !!payload,
        finishReason: primary.finishReason,
        contentLength: primaryContent.length,
        contentPreview: payload ? '' : summarizeDebugContent(primaryContent),
        contentTail: payload ? '' : summarizeDebugTail(primaryContent)
      });
    }

    if (!payload) {
      const recovery = await requestDeepSeek(apiKey, buildRecoveryMessages(normalizedDreamText, scaffold), {
        temperature: 0.1,
        maxTokens: DEEPSEEK_RECOVERY_MAX_TOKENS,
        attempts: 1
      });
      const recoveryContent = collectMessageContent(recovery);

      if (recovery.response.ok) {
        payload = await tryParseOrRepair(apiKey, recoveryContent, normalizedDreamText, scaffold);
      }

      if (debug) {
        trace.push({
          step: 'recovery',
          status: recovery.response.status,
          parsed: !!payload,
          finishReason: recovery.finishReason,
          contentLength: recoveryContent.length,
          contentPreview: payload ? '' : summarizeDebugContent(recoveryContent),
          contentTail: payload ? '' : summarizeDebugTail(recoveryContent)
        });
      }
    }

    if (!payload) {
      const fallbackResponse = normalizeAnalysisPayload({}, scaffold, {
        source: 'stable-fallback',
        provider: 'local',
        model: 'local-fallback',
        usedFallback: true,
        fallbackMessage: '云端深度解析这次没有稳定完成，已回退为结构化基础解析。'
      });

      if (debug) fallbackResponse._debug = trace;
      res.status(200).json(fallbackResponse);
      return;
    }

    const successResponse = normalizeAnalysisPayload(payload, scaffold);
    if (debug) successResponse._debug = trace;
    res.status(200).json(successResponse);
  } catch (error) {
    const fallbackResponse = normalizeAnalysisPayload({}, scaffold, {
      source: 'stable-fallback',
      provider: 'local',
      model: 'local-fallback',
      usedFallback: true,
      fallbackMessage: error.message || 'Dream analysis failed'
    });

    if (debug) {
      trace.push({
        step: 'exception',
        message: error.message || 'Dream analysis failed'
      });
      fallbackResponse._debug = trace;
    }

    res.status(200).json(fallbackResponse);
  }
};
