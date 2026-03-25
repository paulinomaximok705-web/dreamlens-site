const fs = require('fs/promises');
const path = require('path');

const STORE_PATH = path.join(process.cwd(), 'data', 'feedback.json');
const MAX_FEEDBACK_LENGTH = 500;
const MAX_COMMENT_LENGTH = 240;
const MAX_NICKNAME_LENGTH = 24;

function json(res, status, payload) {
  res.status(status).json(payload);
}

function createId(prefix = 'fb') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, maxLength) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

function normalizeNickname(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NICKNAME_LENGTH);
}

function createAnonymousName(seed = Date.now()) {
  const prefixes = ['雾中旅人', '夜航者', '月下访客', '静默回声', '梦境观测者', '微光拾梦者'];
  const suffix = String(seed).slice(-3);
  return `${prefixes[seed % prefixes.length]}${suffix}`;
}

async function ensureStore() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch (_) {
    await fs.writeFile(STORE_PATH, JSON.stringify({ feedbacks: [] }, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, 'utf8');
  const parsed = JSON.parse(raw || '{"feedbacks":[]}');
  if (!Array.isArray(parsed.feedbacks)) {
    return { feedbacks: [] };
  }
  return parsed;
}

async function writeStore(data) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function sortFeedbacks(feedbacks) {
  return [...feedbacks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item) => ({
    ...item,
    comments: Array.isArray(item.comments)
      ? [...item.comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      : []
  }));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const store = await readStore();
      json(res, 200, { feedbacks: sortFeedbacks(store.feedbacks) });
    } catch (error) {
      json(res, 500, { error: error.message || '读取反馈失败' });
    }
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await parseBody(req);
    const type = body.type;
    const store = await readStore();

    if (type === 'feedback') {
      const content = normalizeText(body.content, MAX_FEEDBACK_LENGTH);
      const nickname = normalizeNickname(body.nickname) || createAnonymousName(Date.now());

      if (content.length < 6) {
        json(res, 400, { error: '反馈内容至少需要 6 个字' });
        return;
      }

      const feedback = {
        id: createId('fb'),
        nickname,
        content,
        createdAt: new Date().toISOString(),
        comments: []
      };

      store.feedbacks.unshift(feedback);
      await writeStore(store);
      json(res, 201, { feedback });
      return;
    }

    if (type === 'comment') {
      const feedbackId = String(body.feedbackId || '').trim();
      const content = normalizeText(body.content, MAX_COMMENT_LENGTH);
      const nickname = normalizeNickname(body.nickname) || createAnonymousName(Date.now());

      if (!feedbackId) {
        json(res, 400, { error: '缺少反馈 ID' });
        return;
      }

      if (content.length < 2) {
        json(res, 400, { error: '评论内容至少需要 2 个字' });
        return;
      }

      const target = store.feedbacks.find((item) => item.id === feedbackId);
      if (!target) {
        json(res, 404, { error: '反馈不存在' });
        return;
      }

      const comment = {
        id: createId('cm'),
        feedbackId,
        nickname,
        content,
        createdAt: new Date().toISOString()
      };

      if (!Array.isArray(target.comments)) target.comments = [];
      target.comments.push(comment);
      await writeStore(store);
      json(res, 201, { comment });
      return;
    }

    json(res, 400, { error: '未知的请求类型' });
  } catch (error) {
    json(res, 500, { error: error.message || '反馈请求失败' });
  }
};
