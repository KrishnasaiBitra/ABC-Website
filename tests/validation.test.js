const test = require('node:test');
const assert = require('node:assert/strict');

const {
  escapeHtml,
  normalizeString,
  isEmailValid,
  jsonResponse,
  parseBase64Upload,
  createRateLimiter
} = require('../lib/validation');

test('escapeHtml escapes HTML special chars', () => {
  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('normalizeString trims and length-limits values', () => {
  assert.equal(normalizeString('  hello  '), 'hello');
  assert.equal(normalizeString('abcdefghijklmnopqrstuvwxyz', { maxLength: 5 }), 'abcde');
});

test('isEmailValid rejects malformed email addresses', () => {
  assert.equal(isEmailValid('user@example.com'), true);
  assert.equal(isEmailValid('bad-email'), false);
});

test('jsonResponse adds consistent JSON headers', () => {
  const response = jsonResponse(200, { ok: true }, 'http://localhost:3001');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'application/json; charset=utf-8');
  assert.equal(response.headers['Access-Control-Allow-Origin'], 'http://localhost:3001');
});

test('parseBase64Upload validates PDF payloads', () => {
  const pdfBase64 = Buffer.from('%PDF-1.4\n%\n').toString('base64');
  const result = parseBase64Upload(`data:application/pdf;base64,${pdfBase64}`);
  assert.equal(result.ok, true);
  assert.equal(result.extension, 'pdf');
});

test('parseBase64Upload rejects unsupported upload types', () => {
  const png = Buffer.from('PNG').toString('base64');
  const result = parseBase64Upload(`data:image/png;base64,${png}`);
  assert.equal(result.ok, false);
  assert.match(result.error, /Only PDF, DOC, and DOCX/);
});

test('rate limiter blocks requests after max threshold', () => {
  const limit = createRateLimiter({ windowMs: 60000, maxRequests: 2 });
  const ip = '1.2.3.4';
  assert.equal(limit(ip).allowed, true);
  assert.equal(limit(ip).allowed, true);
  assert.equal(limit(ip).allowed, false);
});
