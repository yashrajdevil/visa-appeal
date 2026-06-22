import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';
import { runAllChecks } from './validate.js';
console.log('BOOT 2 - app.ts all imports resolved');

const app = express();

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/webhook', express.raw({ type: 'application/json' }), (req, _res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString('utf8'));
  }
  next();
}, webhookRouter);

app.use(express.json());

app.use('/api/analyze', analyzeRouter);
app.use('/api/checkout', checkoutRouter);

app.get('/api/health', async (_req, res) => {
  const checks = await runAllChecks();
  const allPassed = checks.every(c => c.status === 'PASS');
  res.json({
    status: allPassed ? 'ok' : 'degraded',
    checks,
  });
});

app.get('/api/debug-gemini-key', (_req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const trimmed = key?.trim();
  res.json({
    length: key?.length ?? 0,
    trimmedLength: trimmed?.length ?? 0,
    lastCharCode: key ? key.charCodeAt(key.length - 1) : null,
    startsWithAIza: key?.startsWith('AIza') ?? false,
    containsNewline: key?.includes('\n') ?? false,
  });
});

app.post('/api/test-gemini', async (_req, res) => {
  const rawKey = process.env.GEMINI_API_KEY;
  console.log('TEST-GEMINI raw length:', rawKey?.length);
  console.log('TEST-GEMINI last char code:', rawKey?.charCodeAt(rawKey.length - 1));
  console.log('TEST-GEMINI key prefix:', rawKey?.slice(0, 15));

  const key = rawKey?.trim() ?? '';
  console.log('TEST-GEMINI trimmed length:', key.length);

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  console.log('TEST-GEMINI model:', model);
  console.log('TEST-GEMINI URL (redacted):', url.replace(key, '***REDACTED***'));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'hello' }] }],
      }),
    });

    const text = await response.text();
    console.log('TEST-GEMINI status:', response.status);
    console.log('TEST-GEMINI response:', text.slice(0, 1000));

    res.json({
      status: response.status,
      ok: response.ok,
      body: text,
    });
  } catch (err: any) {
    console.error('TEST-GEMINI error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

console.log('BOOT 5 - app export');
export default app;
