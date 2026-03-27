const http = require('http');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number.parseInt(process.env.PORT || '3010', 10);
const ROOT = __dirname;

function loadEnvFile(filePath) {
  if (!fsSync.existsSync(filePath)) return;
  const raw = fsSync.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    if (!key || process.env[key]) return;
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

loadEnvFile(path.join(ROOT, '.env.local'));
loadEnvFile(path.join(ROOT, '.env'));

const imageHandler = require('./api/image');
const feedbackHandler = require('./api/feedback');
const analyzeHandler = require('./api/analyze');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8'
};

function augmentResponse(res) {
  res.status = function status(code) {
    res.statusCode = code;
    return res;
  };

  res.json = function json(payload) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(payload));
  };

  return res;
}

async function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return null;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return null;
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return null;

  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return raw;
    }
  }

  return raw;
}

async function handleApi(req, res, handler) {
  req.body = await readBody(req);
  return handler(req, augmentResponse(res));
}

function isSafePath(resolvedPath) {
  const relative = path.relative(ROOT, resolvedPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function resolveStaticPath(urlPathname) {
  let pathname = decodeURIComponent(urlPathname);
  if (pathname === '/') pathname = '/index.html';

  const normalized = pathname.replace(/^\/+/, '');
  let resolved = path.join(ROOT, normalized);

  try {
    const stat = await fs.stat(resolved);
    if (stat.isDirectory()) {
      resolved = path.join(resolved, 'index.html');
    }
  } catch (_) {
    if (!path.extname(resolved)) {
      const htmlCandidate = `${resolved}.html`;
      try {
        const stat = await fs.stat(htmlCandidate);
        if (stat.isFile()) resolved = htmlCandidate;
      } catch (_) {}
    }
  }

  if (!isSafePath(resolved)) return null;
  return resolved;
}

async function serveStatic(req, res, pathname) {
  const filePath = await resolveStaticPath(pathname);
  if (!filePath) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.end(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.statusCode = 500;
    res.end(error.message || 'Server error');
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  const pathname = parsedUrl.pathname;

  try {
    if (pathname === '/api/image') {
      await handleApi(req, res, imageHandler);
      return;
    }

    if (pathname === '/api/feedback') {
      await handleApi(req, res, feedbackHandler);
      return;
    }

    if (pathname === '/api/analyze') {
      await handleApi(req, res, analyzeHandler);
      return;
    }

    await serveStatic(req, res, pathname);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: error.message || 'Server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`DreamLens local server running at http://127.0.0.1:${PORT}`);
  console.log(process.env.FAL_KEY
    ? 'DreamLens image mode: real fal image generation enabled'
    : 'DreamLens image mode: real fal image generation unavailable (missing FAL_KEY)');
  console.log(process.env.DEEPSEEK_API_KEY
    ? 'DreamLens analyze mode: real DeepSeek analysis enabled'
    : 'DreamLens analyze mode: real DeepSeek analysis unavailable (missing DEEPSEEK_API_KEY)');
});
