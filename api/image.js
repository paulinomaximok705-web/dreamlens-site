const FAL_KEY = process.env.FAL_KEY;
const DAILY_IMAGE_LIMIT = 3;
const usageStore = globalThis.__dreamlensImageUsageStore || new Map();
const FAL_MODEL_ID = 'fal-ai/flux/schnell';

if (!globalThis.__dreamlensImageUsageStore) {
  globalThis.__dreamlensImageUsageStore = usageStore;
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getResetAtIso(date = new Date()) {
  const resetAt = new Date(date);
  resetAt.setUTCHours(24, 0, 0, 0);
  return resetAt.toISOString();
}

function getClientIdentifier(req) {
  const headerId = req.headers['x-dreamlens-client-id'];
  if (typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim().slice(0, 120);
  }

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'anonymous';
}

function pruneUsageStore(todayKey) {
  for (const key of usageStore.keys()) {
    if (!key.endsWith(`:${todayKey}`)) {
      usageStore.delete(key);
    }
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Dreamlens-Client-Id');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!FAL_KEY) {
    res.status(500).json({ error: 'Missing FAL_KEY' });
    return;
  }

  const { prompt, size = '1024x1024', quality = 'low' } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const todayKey = getDateKey();
  const resetAt = getResetAtIso();
  const clientId = getClientIdentifier(req);
  const usageKey = `${clientId}:${todayKey}`;
  pruneUsageStore(todayKey);

  const usedToday = usageStore.get(usageKey) || 0;
  if (usedToday >= DAILY_IMAGE_LIMIT) {
    res.status(429).json({
      error: 'DAILY_LIMIT_REACHED',
      message: `单用户每日最多生成 ${DAILY_IMAGE_LIMIT} 次图片，请明天再试`,
      limit: DAILY_IMAGE_LIMIT,
      remaining: 0,
      resetAt
    });
    return;
  }

  try {
    const [width, height] = String(size)
      .split('x')
      .map((value) => Number.parseInt(value, 10));

    const response = await fetch(`https://fal.run/${FAL_MODEL_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${FAL_KEY}`
      },
      body: JSON.stringify({
        prompt,
        image_size: Number.isFinite(width) && Number.isFinite(height)
          ? { width, height }
          : { width: 1024, height: 1024 },
        num_images: 1,
        output_format: 'png',
        enable_safety_checker: true,
        sync_mode: true,
        num_inference_steps: quality === 'high' ? 4 : 2
      })
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data.error || data });
      return;
    }

    const imageUrl = data?.images?.[0]?.url;
    if (!imageUrl) {
      res.status(502).json({ error: 'No image returned from fal' });
      return;
    }

    const nextUsed = usedToday + 1;
    usageStore.set(usageKey, nextUsed);

    res.status(200).json({
      imageUrl,
      provider: 'fal',
      model: FAL_MODEL_ID,
      limit: DAILY_IMAGE_LIMIT,
      remaining: Math.max(0, DAILY_IMAGE_LIMIT - nextUsed),
      resetAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Image generation failed' });
  }
};
