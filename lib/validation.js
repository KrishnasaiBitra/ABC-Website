const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://localhost',
  'https://127.0.0.1'
]);

const MAX_LENGTHS = {
  name: 100,
  email: 254,
  phone: 30,
  subject: 200,
  message: 2000,
  role: 200,
  department: 100,
  coverLetter: 4000,
  honeypot: 50
};

const ALLOWED_UPLOAD_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.ms-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 20
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"'`]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }[char]));
}

function normalizeString(value, { maxLength, allowEmpty = false } = {}) {
  if (typeof value !== 'string') {
    return allowEmpty ? '' : null;
  }

  const trimmed = value.trim();

  if (!trimmed && !allowEmpty) {
    return null;
  }

  if (maxLength && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

function isEmailValid(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getClientIp(headers = {}) {
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return headers['x-real-ip'] || headers['X-Real-Ip'] || 'local';
}

function getCorsHeaders(origin) {
  const headers = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function jsonResponse(statusCode, payload, origin, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...getCorsHeaders(origin),
    ...extraHeaders
  };

  return {
    statusCode,
    headers,
    body: JSON.stringify(payload)
  };
}

function createRateLimiter({ windowMs = RATE_LIMIT.windowMs, maxRequests = RATE_LIMIT.maxRequests } = {}) {
  const hits = new Map();

  return function checkLimit(ip) {
    const now = Date.now();
    const bucket = hits.get(ip) || [];
    const recent = bucket.filter((timestamp) => now - timestamp < windowMs);
    recent.push(now);
    hits.set(ip, recent);

    return {
      allowed: recent.length <= maxRequests,
      remaining: Math.max(0, maxRequests - recent.length),
      resetInMs: Math.max(0, windowMs - (now - recent[0]))
    };
  };
}

function parseBase64Upload(value, { maxBytes = 5 * 1024 * 1024 } = {}) {
  if (typeof value !== 'string') {
    return { ok: false, error: 'Resume upload is missing or invalid.' };
  }

  const match = value.match(/^data:([^;,]+);base64,(.+)$/i);
  if (!match) {
    return { ok: false, error: 'Resume upload must be a valid Base64 data URL.' };
  }

  const mime = match[1].toLowerCase();
  const data = match[2].replace(/\s+/g, '');

  if (!ALLOWED_UPLOAD_TYPES.has(mime)) {
    return { ok: false, error: 'Only PDF, DOC, and DOCX files are allowed.' };
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(data)) {
    return { ok: false, error: 'Resume upload contains malformed Base64 data.' };
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.length === 0 || buffer.length > maxBytes) {
    return { ok: false, error: 'Resume upload size must be between 1 byte and 5 MB.' };
  }

  const extensionMap = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.ms-word': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };

  return {
    ok: true,
    mime,
    extension: extensionMap[mime] || 'bin',
    buffer
  };
}

module.exports = {
  ALLOWED_ORIGINS,
  MAX_LENGTHS,
  RATE_LIMIT,
  escapeHtml,
  normalizeString,
  isEmailValid,
  getClientIp,
  getCorsHeaders,
  jsonResponse,
  createRateLimiter,
  parseBase64Upload
};
