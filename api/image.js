const FAL_MODEL_ID = 'fal-ai/flux/schnell';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseImageSize(size) {
  const [rawWidth, rawHeight] = String(size || '1024x1024')
    .split('x')
    .map((value) => Number.parseInt(value, 10));

  const width = Number.isFinite(rawWidth) ? clamp(rawWidth, 512, 1792) : 1024;
  const height = Number.isFinite(rawHeight) ? clamp(rawHeight, 512, 1792) : 1024;
  return { width, height };
}

module.exports = async (req, res) => {
  const falKey = process.env.FAL_KEY;
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

  const { prompt, size = '1024x1024', quality = 'medium', count = 1 } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  if (!falKey) {
    res.status(500).json({ error: 'Missing FAL_KEY' });
    return;
  }

  try {
    const { width, height } = parseImageSize(size);
    const qualityKey = String(quality || 'medium').toLowerCase();
    const qualitySteps = {
      low: 2,
      medium: 3,
      high: 4,
      '1080p': 2,
      '2k': 3,
      '4k': 4
    };

    const imageCount = clamp(Number.parseInt(count, 10) || 1, 1, 4);

    const response = await fetch(`https://fal.run/${FAL_MODEL_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${falKey}`
      },
      body: JSON.stringify({
        prompt,
        image_size: { width, height },
        num_images: imageCount,
        output_format: 'png',
        enable_safety_checker: true,
        sync_mode: true,
        num_inference_steps: qualitySteps[qualityKey] || 3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const errorText = data?.error?.message || data?.error || data;
      res.status(response.status).json({ error: errorText });
      return;
    }

    const imageUrls = Array.isArray(data?.images)
      ? data.images.map((item) => item?.url).filter(Boolean)
      : [];
    const imageUrl = imageUrls[0];
    if (!imageUrl) {
      res.status(502).json({ error: 'No image returned from fal' });
      return;
    }

    res.status(200).json({
      imageUrl,
      imageUrls,
      provider: 'fal',
      model: FAL_MODEL_ID
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Image generation failed' });
  }
};
