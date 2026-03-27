const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

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

  try {
    return JSON.parse(raw);
  } catch (_) {}

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {}
  }

  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch (_) {}
  }

  return null;
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
    tags: ['3到4个简短中文标签'],
    summary: '1段总结，80到150字',
    symbols: [{ name: '意象名', meaning: '该意象的心理含义，18到50字' }],
    emotions: [{ label: '宁静/焦虑/神秘/自由/迷惘/恐惧/好奇/压迫 之一', pct: 30 }],
    psychology: '2到3段，整体160到320字，用\\n\\n分段',
    unconscious: '3小段，用①②③开头，总体120到220字',
    advice: '3小段，用①②③开头，总体120到220字',
    interpretation: {
      lead: '统一解读核心判断，24到60字',
      overview: '统一解读补充正文，45到120字',
      emotion: '情绪能量分析，60到140字',
      emotionComposition: [
        { key: 'attraction/hesitation/calm/unease/pressure/vigilance/release/curiosity', label: '中文情绪名', pct: 30, tone: 'violet/slate/moon/ember/pearl/cyan' }
      ],
      unconscious: '潜意识传达，60到140字'
    },
    actionGuidance: {
      actionCue: '现在就能做的一句提示，16到36字',
      actionBody: '具体的小动作，45到110字',
      directionCue: '继续留意的一句提示，16到36字',
      directionBody: '继续观察的方向，45到110字'
    }
  };

  return [
    {
      role: 'system',
      content: [
        '你是 DreamLens 的梦境解析助手，需要基于用户原文输出结果页直接可用的结构化 JSON。',
        '只允许输出合法 JSON，不要输出 Markdown、解释、标题、代码块。',
        '语言必须是简体中文，语气细腻、安静、直接、有洞察力，但不要玄学化、不要广告化、不要空泛鸡汤。',
        '解读必须尽量贴着梦本身来写：优先抓原文中的画面、声音、动作、空间关系和醒来后的感受，不要先讲大而空的道理。',
        '不要杜撰原文没有出现的具体情节，只能沿着原文里的意象和动作做心理层面的延展。',
        '少用套话，避免反复出现“这场梦在说”“潜意识在提醒你”“某个方向正在浮现”“你需要学会”这类空泛句式。',
        '尽量少谈宽泛的人生成长、疗愈、自我觉察，除非它能被梦里的具体细节明确支撑。',
        '每一段最好都能落回梦里的具体线索，例如门、森林、水声、楼梯、追逐、停下、回头、醒来后的残留感。',
        '强调梦境感、夜色感、潜意识线索，但表达必须清楚、克制、具体。',
        '不要把任何参数、UI、按钮、模型信息写进输出。'
      ].join('\n')
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
        '1. theme 必须是指定枚举之一。',
        '2. tags 只输出简短中文标签。',
        '3. emotions 输出 4 项左右，百分比总和约为 100。',
        '4. interpretation.emotionComposition 需要输出 4 项左右，总和约为 100。',
        '5. 如果原文明显包含森林、门、海浪、下沉、平静与迟疑这些线索，请优先准确反映。',
        '6. summary / psychology / unconscious / interpretation.* 要尽量少套话，多落回梦里的具体意象和动作。',
        '7. actionGuidance 也要具体，不要写成空泛建议；优先给出能立即执行的小动作。',
        '8. 输出必须是纯 JSON，不要有任何额外文本。'
      ].join('\n')
    }
  ];
}

function normalizeAnalysisPayload(payload = {}, scaffold = {}) {
  const fallbackTheme = normalizeTheme(scaffold.theme, 'general');
  const fallbackTitle = normalizeString(scaffold.title, '梦境解析');
  const fallbackTags = normalizeTags(scaffold.tags, DEFAULT_TAGS);
  const fallbackSymbols = normalizeSymbols(scaffold.symbols, DEFAULT_SYMBOLS);
  const fallbackEmotions = normalizeEmotions(scaffold.emotions, DEFAULT_EMOTIONS);

  const emotions = normalizeEmotions(payload.emotions, fallbackEmotions);
  const interpretation = payload.interpretation || {};
  const actionGuidance = payload.actionGuidance || {};

  return {
    source: 'deepseek',
    provider: 'deepseek',
    model: DEEPSEEK_MODEL,
    title: normalizeString(payload.title, fallbackTitle),
    theme: normalizeTheme(payload.theme, fallbackTheme),
    tags: normalizeTags(payload.tags, fallbackTags),
    summary: normalizeParagraph(payload.summary, '这场梦把一些白天还没说清的感受重新带回了你面前。'),
    symbols: normalizeSymbols(payload.symbols, fallbackSymbols),
    emotions,
    psychology: normalizeParagraph(payload.psychology, '这场梦里最反复的画面、声音和动作，往往比结论更接近你当下真正卡住或在意的位置。'),
    unconscious: normalizeParagraph(payload.unconscious, '① 先看梦里反复出现的画面。\n\n② 再看你在梦里是靠近、停下，还是绕开它。\n\n③ 这些动作通常比抽象结论更接近这场梦真正的重心。'),
    advice: normalizeParagraph(payload.advice, '① 先写下梦里最清楚的一幕。\n\n② 再补一句醒来后残留最久的感受。\n\n③ 只记录具体细节，先不要急着替它下结论。'),
    interpretation: {
      lead: normalizeParagraph(interpretation.lead, '这场梦把最关键的画面放在你面前，让你看见自己正在靠近什么，又为什么会停一下。'),
      overview: normalizeParagraph(interpretation.overview, '梦里的画面不是分开的：场景、声音和动作连在一起，才能看出它真正聚焦的心理位置。'),
      emotion: normalizeParagraph(interpretation.emotion, '这场梦里的情绪不是单一的，它通常会跟着画面和动作一起变化。'),
      emotionComposition: normalizeEmotionComposition(interpretation.emotionComposition, emotions),
      unconscious: normalizeParagraph(interpretation.unconscious, '梦里最反复的细节，通常不是为了给出漂亮结论，而是为了把真正重要的那一点留在你面前。')
    },
    actionGuidance: {
      actionCue: normalizeString(actionGuidance.actionCue, '先记下梦里最具体的一个细节。'),
      actionBody: normalizeParagraph(actionGuidance.actionBody, '先把那一幕写下来：它发生在哪里，里面有什么声音、光线、动作，醒来后你身体里还留着什么感觉。'),
      directionCue: normalizeString(actionGuidance.directionCue, '接下来，继续留意梦里那个最反复的意象。'),
      directionBody: normalizeParagraph(actionGuidance.directionBody, '先不要急着把它解释成某种大道理。只要观察它在现实里会不会以相似的情绪、场景或动作再次出现。')
    }
  };
}

module.exports = async (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;

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
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.45,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: buildMessages(normalizedDreamText, scaffold)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorText = data?.error?.message || data?.error || 'DeepSeek analyze request failed';
      res.status(response.status).json({ error: errorText });
      return;
    }

    const content = data?.choices?.[0]?.message?.content || '';
    const payload = parseJsonContent(content);

    if (!payload) {
      res.status(502).json({ error: 'DeepSeek returned invalid JSON content' });
      return;
    }

    res.status(200).json(normalizeAnalysisPayload(payload, scaffold));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Dream analysis failed' });
  }
};
