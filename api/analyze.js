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
        '不要杜撰原文没有出现的具体情节，只能沿着原文里的画面、声音、情绪和动作做心理层面的延展。',
        '强调梦境感、夜色感、潜意识线索，但表达必须清楚。',
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
        '6. 输出必须是纯 JSON，不要有任何额外文本。'
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
    psychology: normalizeParagraph(payload.psychology, '从心理学角度看，这场梦正在把你最近反复出现的感受与意象重新组织成一个更完整的线索。'),
    unconscious: normalizeParagraph(payload.unconscious, '① 梦里反复出现的画面并不是随机的。\n\n② 它们正在替你保留那些白天还没被完整承认的感受。\n\n③ 真正重要的不是立刻得到答案，而是先把这份感觉留下来。'),
    advice: normalizeParagraph(payload.advice, '① 先写下最清晰的一幕。\n\n② 再写醒来后残留最久的感受。\n\n③ 明天回来看一遍，你会更容易看见它真正指向什么。'),
    interpretation: {
      lead: normalizeParagraph(interpretation.lead, '这场梦在说，有一部分新的感受已经开始靠近你，只是你还没有完全走进去。'),
      overview: normalizeParagraph(interpretation.overview, '原文里的意象不是单独出现的，它们在一起构成了一条更清楚的内在线索。'),
      emotion: normalizeParagraph(interpretation.emotion, '这场梦的情绪能量不是单一的，它更像几种感受同时在拉住你。'),
      emotionComposition: normalizeEmotionComposition(interpretation.emotionComposition, emotions),
      unconscious: normalizeParagraph(interpretation.unconscious, '潜意识真正想传达的，不只是一个结论，而是你已经感觉到某个方向正在浮现。')
    },
    actionGuidance: {
      actionCue: normalizeString(actionGuidance.actionCue, '先写下一句醒来后最不想轻轻带过的话。'),
      actionBody: normalizeParagraph(actionGuidance.actionBody, '今晚先把最清楚的一幕和醒来后的那份感觉写下来，不需要完整，只要足够真实。'),
      directionCue: normalizeString(actionGuidance.directionCue, '接下来，继续留意那些反复出现却还没被认真回应的感觉。'),
      directionBody: normalizeParagraph(actionGuidance.directionBody, '梦里的线索通常会在现实里继续出现。你不需要马上解释完，只需要开始留意它对应着什么。')
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
        temperature: 0.7,
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
