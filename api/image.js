const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = async (req, res) => {
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

  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    return;
  }

  const { prompt, size = '1024x1024', quality = 'low' } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt,
        size,
        quality,
        response_format: 'b64_json'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data.error || data });
      return;
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      res.status(502).json({ error: 'No image returned' });
      return;
    }

    res.status(200).json({ b64 });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Image generation failed' });
  }
};
