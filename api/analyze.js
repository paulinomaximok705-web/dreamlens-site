const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_PRIMARY_MAX_TOKENS = Math.max(1800, Number.parseInt(process.env.DEEPSEEK_ANALYZE_MAX_TOKENS || '1800', 10) || 1800);
const DEEPSEEK_RECOVERY_MAX_TOKENS = Math.max(1500, Number.parseInt(process.env.DEEPSEEK_ANALYZE_RECOVERY_MAX_TOKENS || '1500', 10) || 1500);
const DEEPSEEK_REFINEMENT_MAX_TOKENS = Math.max(1300, Number.parseInt(process.env.DEEPSEEK_ANALYZE_REFINEMENT_MAX_TOKENS || '1300', 10) || 1300);
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

  if (symbols.length >= 3) {
    return symbols.slice(0, 4);
  }

  const merged = [...symbols];
  for (const fallbackItem of fallback) {
    if (merged.length >= 3) break;
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

const MIN_DREAM_TEXT_LENGTH = 8;
const LIMITED_DREAM_TEXT_LENGTH = 38;
const BANNED_STYLE_MARKERS = [
  '集体无意识', '命运召唤', '能量值', '情绪占比', '潜意识警告', '五行相克', '重大心理危机', '注定', '预示'
];
const OVERCONFIDENT_MARKERS = [
  '你就是', '说明你一定', '这证明', '显然是', '毫无疑问', '注定', '一定会', '必然', '已经说明'
];
const REALITY_MARKERS = [
  '现实', '生活', '最近', '平时', '白天', '关系', '沟通', '家庭', '工作', '边界', '表达', '靠近', '退回', '停住', '迟疑'
];
const ACTION_MARKERS = [
  '写下', '记下', '补一句', '圈出', '留意', '观察', '回想', '对照', '问自己', '记一笔'
];

const ANALYSIS_SYSTEM_PROMPT = [
  '你是一名帮助用户整理梦境体验的中文写作助手。',
  '你的任务不是给出神秘、权威、确定的“梦的答案”，而是基于用户提供的梦境描述，做出贴近文本、克制、清楚、有边界感的整理与解释。',
  '只返回合法 JSON，不要输出 Markdown、标题、解释、代码块或任何额外文字。',
  '梦没有标准答案，不要把单个符号固定翻译成单一含义，不要把“门、海浪、森林、下沉、房间、陌生人”等直接套进固定词典。',
  '优先分析用户原文里能直接看到的内容：场景、动作、距离感、阻碍方式、声音、空间关系、情绪变化、醒来后的余韵。',
  '先描述，再解释；先证据，再推测。每个结论都尽量能在原文里找到依据。',
  '推测性的内容必须明确保留余地，使用“可能、也许、像是、另一种理解是、也不排除”这类表达，不要写成定论。',
  '不要做心理诊断，不要假装知道用户现实中一定发生了什么，不要自动推断事业、关系、童年创伤、人格转变等宏大主题，除非原文非常支持。',
  '不要为了“深刻感”堆砌词藻，不要反复换词说同一个意思，不要制造玄学气氛。',
  '不要使用会制造权威感但缺乏约束的词，例如“集体无意识、能量、命运召唤、潜意识警告、五行定性、重大心理危机、注定、预示”。',
  '不要输出百分比、情绪占比、分值、能量条解释，也不要做伪量化判断。',
  '当梦更像普通压力梦、白天情绪延续或感官残留时，可以直接这样说，不要强行拔高成重大象征。',
  '对醒来后的感受给予高权重，因为它通常比单个符号更可靠。',
  '写作风格可以有一点文学感，但核心必须清楚、节制、可读、可核对。',
  '如果用户描述较少，必须明确提示“描述较少，下面只能给出非常初步的整理”，并减少延伸，不要硬分析。'
].join('\n');

function normalizeComparableText(value) {
  return normalizeString(value)
    .replace(/[\s\u3000]/g, '')
    .replace(/[，。、“”‘’：:；;、,.!?！？（）()【】《》<>—\-]/g, '')
    .toLowerCase();
}

function countReadableSentences(text) {
  return normalizeParagraph(text)
    .split(/[。！？!?]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .length;
}

function isLimitedDreamText(dreamText) {
  const text = normalizeString(dreamText);
  if (!text) return true;
  if (text.length < LIMITED_DREAM_TEXT_LENGTH) return true;
  return text.length < 60 && countReadableSentences(text) <= 1;
}

function getQualityNotice(dreamText) {
  return isLimitedDreamText(dreamText)
    ? '描述较少，下面只能给出非常初步的整理。'
    : '';
}

function buildPromptSchema(limitedInput = false) {
  return {
    qualityNotice: limitedInput ? '描述较少，下面只能给出非常初步的整理。' : '',
    reading: {
      coreFeeling: '对应页面里的“核心感受”，1段，45到95字，描述最突出的情绪基调，不夸张',
      keyTensions: [
        {
          contrast: '对应页面里的“画面里的关键张力”，短语形式，例如“靠近 vs 下沉”',
          evidence: '12到38字，说明这个对照关系为什么能从原文里看出来'
        }
      ],
      groundedInterpretation: '对应页面里的“一种较稳妥的解释”，1到2段，总体80到170字，必须先贴着文本，再给出克制解释',
      otherPossibleExplanations: [
        '对应页面里的“还可能有的其他解释”，2到3条，每条28到72字，明确是其他可能，不是定论'
      ],
      realityQuestions: [
        '对应页面里的“和现实的连接问题”，固定3条，都要是真问题，帮助用户自我对照'
      ],
      boundaryNote: '对应页面里的“边界提示”，一句短提醒，18到36字'
    },
    actionGuidance: {
      actionCue: '一句小标题，10到18字',
      actionBody: '一个现在可以做的小动作，35到88字，必须紧贴前面的核心张力，不要凭空扩展现实背景',
      directionCue: '一句继续观察方向的小标题，10到18字',
      directionBody: '一个接下来可以留意的方向，35到88字，仍然只围绕梦里已有线索'
    }
  };
}

function buildPromptRequirements(limitedInput = false) {
  return [
    '1. 输出必须是纯 JSON，不要有任何额外文本。',
    '2. qualityNotice 只有在描述较少时才填写固定句子，否则留空字符串。',
    '3. reading.keyTensions 输出 2 到 4 条，优先写动作、距离、阻碍、情绪反差，不要写空泛对照。',
    '4. reading.groundedInterpretation 先说文本里能支持的观察，再给较稳妥的解释；不要反向先下结论再套符号。',
    '5. reading.otherPossibleExplanations 输出 2 到 3 条，并明确它们只是其他可能。',
    '6. reading.realityQuestions 固定输出 3 条，问题要具体、可自我核对，不要像鸡汤。',
    '7. reading.boundaryNote 必须提醒“这不是事实判断，只是观察线索”这一层意思。',
    '8. actionGuidance 必须顺着前面已经抓住的张力来写，不要另起炉灶，不要举“新项目、新关系、换工作”这类原文没有支撑的例子。',
    '9. 不要写百分比，不要写“能量”“命运”“预示”“重大转变”之类词。',
    limitedInput
      ? '10. 因为描述较少，请主动减少延伸，宁可承认信息不足，也不要硬把普通画面说成重大主题。'
      : '10. 当现实连接拿不准时，可以只写成“像是最近某种靠近又停住的感觉”，不要假装知道用户真实处境。'
  ];
}

function buildScaffoldReference(scaffold = {}) {
  return JSON.stringify({
    title: scaffold.title || '',
    theme: scaffold.theme || 'general',
    tags: Array.isArray(scaffold.tags) ? scaffold.tags : [],
    symbols: Array.isArray(scaffold.symbols) ? scaffold.symbols : [],
    reading: scaffold.reading || null
  }, null, 2);
}

function buildMessages(dreamText, scaffold = {}) {
  const limitedInput = isLimitedDreamText(dreamText);
  return [
    {
      role: 'system',
      content: ANALYSIS_SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: [
        '请根据下面这段梦境原文，输出一份“梦境整理与可能解释”的 JSON。',
        '',
        '梦境原文：',
        dreamText,
        '',
        '本地整理出的线索（仅供参考，不要照抄，也不要把这些线索当成定论）：',
        buildScaffoldReference(scaffold),
        '',
        '输出 JSON 结构：',
        JSON.stringify(buildPromptSchema(limitedInput), null, 2),
        '',
        '写作与输出要求：',
        ...buildPromptRequirements(limitedInput)
      ].join('\n')
    }
  ];
}

function buildRecoveryMessages(dreamText, scaffold = {}) {
  const limitedInput = isLimitedDreamText(dreamText);
  return [
    {
      role: 'system',
      content: [
        ANALYSIS_SYSTEM_PROMPT,
        '上一次输出没有成功解析。这一次请更简洁、更稳、更克制，只保留最必要的内容。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        '请重新输出合法 JSON。',
        '',
        '梦境原文：',
        dreamText,
        '',
        '本地参考线索：',
        buildScaffoldReference(scaffold),
        '',
        '输出 JSON 结构：',
        JSON.stringify(buildPromptSchema(limitedInput), null, 2),
        '',
        '补充要求：',
        '1. 如果拿不准，就写得更短、更保守。',
        '2. 不要重复同一个意思的换词扩写。',
        '3. 不要输出任何百分比或伪精确判断。',
        '4. 如果像普通压力梦或感官残留，可以直接这么写。',
        ...buildPromptRequirements(limitedInput)
      ].join('\n')
    }
  ];
}

function buildRepairMessages(rawContent, dreamText, scaffold = {}) {
  const limitedInput = isLimitedDreamText(dreamText);
  return [
    {
      role: 'system',
      content: [
        '你是 JSON 修复助手。',
        '下面会给你一段不是合法 JSON 的模型输出。请尽量保留其中贴近文本、克制、可核对的部分，修成合法 JSON。',
        '不要擅自补写夸张、玄学或伪精确内容。缺失字段可以参考梦境原文和 scaffold 谨慎补全。',
        '只返回合法 JSON。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        '梦境原文：',
        dreamText,
        '',
        '本地参考线索：',
        buildScaffoldReference(scaffold),
        '',
        '目标 JSON 结构：',
        JSON.stringify(buildPromptSchema(limitedInput), null, 2),
        '',
        '需要修复的原始文本：',
        rawContent
      ].join('\n')
    }
  ];
}

function buildRescueMessages(dreamText, scaffold = {}) {
  const limitedInput = isLimitedDreamText(dreamText);
  return [
    {
      role: 'system',
      content: [
        ANALYSIS_SYSTEM_PROMPT,
        '前面的输出没有成功。现在请只生成最小可用、最稳妥的一版 JSON，宁可少一点，也不要玄、满、假确定。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        '请生成一份最小可用 JSON。',
        '',
        '梦境原文：',
        dreamText,
        '',
        '本地参考线索：',
        buildScaffoldReference(scaffold),
        '',
        '输出 JSON 结构：',
        JSON.stringify(buildPromptSchema(limitedInput), null, 2),
        '',
        '额外要求：',
        '1. keyTensions 可以只写 2 条，但必须是原文里真的能看到的张力。',
        '2. groundedInterpretation 最多 2 段，不要展开成长叙事。',
        '3. 只返回 JSON。'
      ].join('\n')
    }
  ];
}

function countRealityAnchors(payload = {}) {
  const reading = payload?.reading || {};
  const text = [
    reading.coreFeeling,
    reading.groundedInterpretation,
    ...(Array.isArray(reading.otherPossibleExplanations) ? reading.otherPossibleExplanations : []),
    ...(Array.isArray(reading.realityQuestions) ? reading.realityQuestions : []),
    payload?.actionGuidance?.actionBody,
    payload?.actionGuidance?.directionBody
  ]
    .map((item) => normalizeString(item))
    .join('\n');

  if (!text) return 0;
  return REALITY_MARKERS.filter((marker) => text.includes(marker)).length;
}

function countActionMarkers(payload = {}) {
  const text = [
    payload?.actionGuidance?.actionBody,
    payload?.actionGuidance?.directionBody
  ]
    .map((item) => normalizeString(item))
    .join('\n');

  if (!text) return 0;
  return ACTION_MARKERS.filter((marker) => text.includes(marker)).length;
}

function countDreamAnchors(payload = {}, dreamText = '') {
  const text = [
    ...(Array.isArray(payload?.reading?.keyTensions) ? payload.reading.keyTensions.map((item) => `${item?.contrast || ''} ${item?.evidence || ''}`) : []),
    payload?.reading?.groundedInterpretation,
    ...(Array.isArray(payload?.reading?.otherPossibleExplanations) ? payload.reading.otherPossibleExplanations : []),
    payload?.actionGuidance?.actionBody,
    payload?.actionGuidance?.directionBody
  ]
    .map((item) => normalizeString(item))
    .join('\n');

  if (!text) return 0;

  const anchors = [
    ...(dreamText.includes('门') ? ['门'] : []),
    ...(dreamText.includes('海') || dreamText.includes('水') ? ['海', '水'] : []),
    ...(dreamText.includes('森林') || dreamText.includes('树') ? ['森林', '树'] : []),
    ...(dreamText.includes('下沉') || dreamText.includes('坠落') ? ['下沉', '坠落'] : []),
    ...(dreamText.includes('房') || dreamText.includes('家') ? ['房', '家'] : []),
    ...(dreamText.includes('平静') ? ['平静'] : []),
    ...(dreamText.includes('迟疑') || dreamText.includes('犹豫') ? ['迟疑', '犹豫'] : []),
    ...(dreamText.includes('哭') || dreamText.includes('眼泪') ? ['哭', '眼泪'] : [])
  ];

  const uniqueAnchors = [...new Set(anchors.filter(Boolean))];
  return uniqueAnchors.filter((anchor) => text.includes(anchor)).length;
}

function containsBannedStyle(text) {
  const content = normalizeString(text);
  return BANNED_STYLE_MARKERS.some((marker) => content.includes(marker))
    || OVERCONFIDENT_MARKERS.some((marker) => content.includes(marker))
    || /%/.test(content);
}

function needsQualityRefinement(payload, dreamText) {
  if (!payload || typeof payload !== 'object') return false;

  const reading = payload.reading || {};
  const keyTensions = Array.isArray(reading.keyTensions) ? reading.keyTensions : [];
  const alternatives = Array.isArray(reading.otherPossibleExplanations) ? reading.otherPossibleExplanations : [];
  const realityQuestions = Array.isArray(reading.realityQuestions) ? reading.realityQuestions : [];
  const combinedText = [
    reading.coreFeeling,
    ...keyTensions.map((item) => `${item?.contrast || ''} ${item?.evidence || ''}`),
    reading.groundedInterpretation,
    ...alternatives,
    ...realityQuestions,
    reading.boundaryNote,
    payload?.actionGuidance?.actionBody,
    payload?.actionGuidance?.directionBody
  ].join('\n');

  return !normalizeString(reading.coreFeeling)
    || keyTensions.length < 2
    || normalizeString(reading.groundedInterpretation).length < 55
    || alternatives.length < 2
    || realityQuestions.length < 3
    || countRealityAnchors(payload) < 1
    || countDreamAnchors(payload, dreamText) < 2
    || countActionMarkers(payload) < 2
    || containsBannedStyle(combinedText);
}

function buildRefinementMessages(dreamText, scaffold = {}, payload = {}) {
  const limitedInput = isLimitedDreamText(dreamText);
  return [
    {
      role: 'system',
      content: [
        ANALYSIS_SYSTEM_PROMPT,
        '现在需要把一份仍然偏泛、偏像模板的 JSON 改写得更贴近原文、更克制、更有层次。'
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        '请重写下面这份 JSON，但保持字段结构不变。',
        '',
        '梦境原文：',
        dreamText,
        '',
        '本地参考线索：',
        buildScaffoldReference(scaffold),
        '',
        '当前 JSON：',
        JSON.stringify(payload, null, 2),
        '',
        '重写要求：',
        '1. reading.keyTensions 要更像原文里真的存在的对照关系，不要写成抽象命题。',
        '2. groundedInterpretation 先落回文本，再做保守解释，不要神秘化。',
        '3. otherPossibleExplanations 要明确写成“其他可能”，不能像隐藏结论。',
        '4. realityQuestions 必须是帮助用户自我核对的问题，不是建议句。',
        '5. actionGuidance 必须只围绕前面已经抓到的画面和张力。',
        limitedInput
          ? '6. 因为描述较少，请进一步压缩延伸，宁可承认信息有限。'
          : '6. 当现实连接拿不准时，只写成“像最近某种感觉”即可，不要假装知道真实处境。',
        '7. 不要出现任何百分比、能量、预示、命运、注定、重大危机等说法。',
        '8. 只返回 JSON。'
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
  const parsed = parseJsonContent(rawContent);
  if (parsed) return parsed;

  const repairSource = normalizeString(rawContent).slice(0, 5000);
  if (!apiKey || !repairSource) return null;

  try {
    const repair = await requestDeepSeek(apiKey, buildRepairMessages(repairSource, dreamText, scaffold), {
      temperature: 0,
      maxTokens: Math.min(DEEPSEEK_REPAIR_MAX_TOKENS, 420),
      attempts: 1
    });

    if (!repair.response.ok) return null;
    return parseJsonContent(collectMessageContent(repair));
  } catch (_) {
    return null;
  }
}

function normalizeKeyTensions(value, fallback = []) {
  const items = Array.isArray(value)
    ? value
      .map((item) => ({
        contrast: normalizeString(item?.contrast || item?.pair || item?.title),
        evidence: normalizeParagraph(item?.evidence || item?.basis || item?.detail)
      }))
      .filter((item) => item.contrast && item.evidence)
    : [];

  const normalized = [];
  for (const item of [...items, ...fallback]) {
    const contrast = normalizeString(item?.contrast);
    const evidence = normalizeParagraph(item?.evidence);
    if (!contrast || !evidence) continue;
    if (normalized.some((entry) => entry.contrast === contrast)) continue;
    normalized.push({ contrast, evidence });
    if (normalized.length >= 4) break;
  }

  return normalized;
}

function normalizeStringArray(value, fallback = [], min = 0, max = 3) {
  const items = Array.isArray(value)
    ? value.map((item) => normalizeParagraph(item)).filter(Boolean)
    : [];

  const merged = [];
  for (const item of [...items, ...fallback]) {
    const text = normalizeParagraph(item);
    if (!text || merged.includes(text)) continue;
    merged.push(text);
    if (merged.length >= max) break;
  }

  if (merged.length >= min) return merged.slice(0, max);
  return fallback.slice(0, max).map((item) => normalizeParagraph(item)).filter(Boolean);
}

function normalizeReading(value, fallback = {}, limitedInput = false) {
  const reading = value && typeof value === 'object' ? value : {};
  const fallbackReading = fallback && typeof fallback === 'object' ? fallback : {};
  const defaultBoundaryNote = '梦的解读不是事实判断，它更适合作为自我观察的线索。';
  const defaultQuestions = [
    '梦里最让我停住的一幕，放到白天更像哪种熟悉感觉？',
    '如果不急着解释这个梦，我最想先确认的是哪一点？',
    '醒来后的余韵更靠近想靠近、想退回，还是只是单纯疲惫？'
  ];
  const fallbackTensions = normalizeKeyTensions(fallbackReading.keyTensions, []);

  return {
    coreFeeling: normalizeParagraph(
      reading.coreFeeling,
      normalizeParagraph(
        fallbackReading.coreFeeling,
        limitedInput
          ? '这段描述里最明显的是一小股还没完全说清的感受。因为信息不多，这里更适合先把它当成一次初步整理，而不是下更大的判断。'
          : '这场梦最突出的不是戏剧性，而是一种被画面牵住、又没有完全走进去的感受。醒来后剩下来的情绪，往往比单个符号更接近它真正的重心。'
      )
    ),
    keyTensions: normalizeKeyTensions(reading.keyTensions, fallbackTensions),
    groundedInterpretation: normalizeParagraph(
      reading.groundedInterpretation,
      normalizeParagraph(
        fallbackReading.groundedInterpretation,
        limitedInput
          ? '因为原文信息有限，这里更稳妥的做法，是先承认这场梦只呈现出一种模糊但真实的感受轮廓，而不是急着把它解释成更大的主题。'
          : '更稳妥的理解，通常要先回到梦里反复出现的动作、阻碍和醒来后的余韵，再决定它更像哪种还在整理中的现实感受。'
      )
    ),
    otherPossibleExplanations: normalizeStringArray(
      reading.otherPossibleExplanations,
      normalizeStringArray(fallbackReading.otherPossibleExplanations, [
        limitedInput
          ? '也不排除这只是白天残留情绪在夜里被重新排了一次，所以画面清楚，但能下的结论还不多。'
          : '也可能这场梦只是把白天已经有的牵挂重新排了一遍，让那股感觉在夜里变得更容易被看见。',
        limitedInput
          ? '另一种可能是，你只记住了最醒目的片段，真正重要的线索还没有被完整写出来。'
          : '另一种可能是，梦并不在要求你立刻决定什么，而是在让你看见自己靠近时最容易卡住的位置。'
      ], 2, 3),
      2,
      3
    ),
    realityQuestions: normalizeStringArray(
      reading.realityQuestions,
      normalizeStringArray(fallbackReading.realityQuestions, defaultQuestions, 3, 3),
      3,
      3
    ),
    boundaryNote: normalizeParagraph(
      reading.boundaryNote,
      normalizeParagraph(fallbackReading.boundaryNote, defaultBoundaryNote)
    )
  };
}

function normalizeActionGuidance(value, fallback = {}) {
  const action = value && typeof value === 'object' ? value : {};
  const fallbackAction = fallback && typeof fallback === 'object' ? fallback : {};
  return {
    actionCue: normalizeString(action.actionCue, normalizeString(fallbackAction.actionCue, '如果你想继续整理')),
    actionBody: normalizeParagraph(
      action.actionBody,
      normalizeParagraph(fallbackAction.actionBody, '先写下一句最清楚的画面，再补一句醒来后残留最久的感觉。这个动作不需要完整，但能帮你把梦里的重点留在白天。')
    ),
    directionCue: normalizeString(action.directionCue, normalizeString(fallbackAction.directionCue, '接下来可以留意')),
    directionBody: normalizeParagraph(
      action.directionBody,
      normalizeParagraph(fallbackAction.directionBody, '接下来只要留意现实里哪些时刻会让你出现和梦里相近的靠近、停住、退回或松一口气，不必急着立刻解释完。')
    )
  };
}

function normalizeAnalysisPayload(payload = {}, scaffold = {}, meta = {}) {
  const useScaffoldNarrativeFallback = meta.source === 'stable-fallback' || meta.provider === 'local' || meta.usedFallback;
  const fallbackTheme = normalizeTheme(scaffold.theme, 'general');
  const fallbackTitle = normalizeString(scaffold.title, '梦境整理');
  const fallbackTags = normalizeTags(scaffold.tags, DEFAULT_TAGS);
  const fallbackSymbols = normalizeSymbols(scaffold.symbols, DEFAULT_SYMBOLS);
  const fallbackEmotions = normalizeEmotions(scaffold.emotions, DEFAULT_EMOTIONS);
  const limitedInput = isLimitedDreamText(meta.dreamText || '');
  const fallbackReading = useScaffoldNarrativeFallback && scaffold.reading && typeof scaffold.reading === 'object'
    ? scaffold.reading
    : {};
  const fallbackActionGuidance = useScaffoldNarrativeFallback && scaffold.actionGuidance && typeof scaffold.actionGuidance === 'object'
    ? scaffold.actionGuidance
    : {};

  const emotions = normalizeEmotions(payload.emotions, fallbackEmotions);
  const reading = normalizeReading(payload.reading, fallbackReading, limitedInput);
  const actionGuidance = normalizeActionGuidance(payload.actionGuidance, fallbackActionGuidance);
  const qualityNotice = normalizeString(payload.qualityNotice, getQualityNotice(meta.dreamText || ''));

  return {
    source: meta.source || 'deepseek',
    provider: meta.provider || 'deepseek',
    model: meta.model || DEEPSEEK_MODEL,
    _usedFallback: !!meta.usedFallback,
    _fallbackMessage: normalizeString(meta.fallbackMessage),
    title: normalizeString(payload.title, fallbackTitle),
    theme: normalizeTheme(payload.theme, fallbackTheme),
    tags: normalizeTags(payload.tags, fallbackTags),
    symbols: normalizeSymbols(payload.symbols, fallbackSymbols),
    emotions,
    qualityNotice,
    reading,
    actionGuidance,
    summary: reading.coreFeeling,
    psychology: reading.groundedInterpretation,
    unconscious: reading.otherPossibleExplanations.map((item, index) => `${['①', '②', '③'][index] || '-'} ${item}`).join('\n\n'),
    advice: [actionGuidance.actionBody, actionGuidance.directionBody].filter(Boolean).join('\n\n')
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

  if (normalizedDreamText.length < MIN_DREAM_TEXT_LENGTH) {
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
        fallbackMessage: '云端整理这次没有稳定完成，已回退为基于原文的初步整理。',
        dreamText: normalizedDreamText
      });

      if (debug) fallbackResponse._debug = trace;
      res.status(200).json(fallbackResponse);
      return;
    }

    if (needsQualityRefinement(payload, normalizedDreamText)) {
      const refinement = await requestDeepSeek(apiKey, buildRefinementMessages(normalizedDreamText, scaffold, payload), {
        temperature: 0.14,
        maxTokens: DEEPSEEK_REFINEMENT_MAX_TOKENS,
        attempts: 1
      });
      const refinementContent = collectMessageContent(refinement);

      if (refinement.response.ok) {
        const refinedPayload = await tryParseOrRepair(apiKey, refinementContent, normalizedDreamText, scaffold);
        if (refinedPayload) {
          payload = refinedPayload;
        }
      }

      if (debug) {
        trace.push({
          step: 'refinement',
          status: refinement.response.status,
          parsed: !!payload,
          finishReason: refinement.finishReason,
          contentLength: refinementContent.length,
          contentPreview: '',
          contentTail: ''
        });
      }
    }

    const successResponse = normalizeAnalysisPayload(payload, scaffold, {
      dreamText: normalizedDreamText
    });
    if (debug) successResponse._debug = trace;
    res.status(200).json(successResponse);
  } catch (error) {
    const fallbackResponse = normalizeAnalysisPayload({}, scaffold, {
      source: 'stable-fallback',
      provider: 'local',
      model: 'local-fallback',
      usedFallback: true,
      fallbackMessage: error.message || 'Dream analysis failed',
      dreamText: normalizedDreamText
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
