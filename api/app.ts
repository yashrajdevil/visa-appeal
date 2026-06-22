import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';
import adminRouter from './routes/admin.js';
import sitemapRouter from './routes/sitemap.js';
import { runAllChecks } from './validate.js';
import { MODEL_FALLBACKS, getModelDiagnostics } from './services/gemini.js';
console.log('BOOT 2 - app.ts all imports resolved');

const app = express();

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/webhooks/creem', express.raw({ type: 'application/json' }), (req, _res, next) => {
  if (Buffer.isBuffer(req.body)) {
    (req as any).rawBody = req.body.toString('utf8');
    req.body = JSON.parse((req as any).rawBody);
  }
  next();
}, webhookRouter);

// Temporary GET route to verify webhook route is alive
app.get('/api/webhooks/creem', (_req, res) => {
  console.log('CREEM WEBHOOK HIT (GET test)');
  res.json({ status: 'webhook route alive' });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/checkout', checkoutRouter);

app.use('/api', sitemapRouter);
app.get('/sitemap.xml', async (_req, res) => {
  res.redirect(301, '/api/sitemap.xml');
});

app.get('/api/health', async (_req, res) => {
  const checks = await runAllChecks();
  const allPassed = checks.every(c => c.status === 'PASS');
  res.json({
    status: allPassed ? 'ok' : 'degraded',
    checks,
  });
});

app.get('/api/debug-gemini', (_req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const trimmed = key?.trim() ?? '';
  const model = MODEL_FALLBACKS[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const requestUrlWithoutKey = `${url}?key=***REDACTED***`;

  res.json({
    model,
    keyLength: key?.length ?? 0,
    keyTrimmedLength: trimmed.length,
    keyPrefix: key?.slice(0, 10) ?? null,
    keySuffix: key ? key.slice(-5) : null,
    lastCharCode: key ? key.charCodeAt(key.length - 1) : null,
    firstCharCode: key ? key.charCodeAt(0) : null,
    startsWithAIza: key?.startsWith('AIza') ?? false,
    containsNewline: key?.includes('\n') ?? false,
    containsSpace: key?.includes(' ') ?? false,
    containsTab: key?.includes('\t') ?? false,
    trimmedEqualsRaw: key === trimmed,
    requestUrlWithoutKey,
    environment: process.env.VERCEL_ENV ?? 'local',
  });
});

app.post('/api/test-gemini', async (_req, res) => {
  const rawKey = process.env.GEMINI_API_KEY;
  console.log('TEST-GEMINI raw length:', rawKey?.length);
  console.log('TEST-GEMINI last char code:', rawKey?.charCodeAt(rawKey.length - 1));
  console.log('TEST-GEMINI first 10:', rawKey?.slice(0, 10));
  console.log('TEST-GEMINI last 5:', rawKey?.slice(-5));

  const key = rawKey?.trim() ?? '';
  console.log('TEST-GEMINI trimmed length:', key.length);

  const model = MODEL_FALLBACKS[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: 'hello' }] }],
  });
  console.log('TEST-GEMINI model:', model);
  console.log('TEST-GEMINI full URL:', url.replace(key, '***REDACTED***'));
  console.log('TEST-GEMINI request body:', body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body,
    });

    console.log('TEST-GEMINI response status:', response.status);
    console.log('TEST-GEMINI response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    const text = await response.text();
    console.log('TEST-GEMINI response body:', text.slice(0, 2000));

    res.json({
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      body: text,
    });
  } catch (err: any) {
    console.error('TEST-GEMINI error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debug-gemini-project', async (_req, res) => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const keyPrefix = key.slice(0, 10);
  const keySuffix = key.slice(-5);

  // 1) models list (v1beta, same version as generateContent)
  const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  console.log('DEBUG-PROJECT key prefix:', keyPrefix);
  console.log('DEBUG-PROJECT models URL (redacted):', modelsUrl.replace(key, '***REDACTED***'));

  let modelsStatus: number | null = null;
  let modelsHeaders: Record<string, string> = {};
  let modelsBody: string | null = null;

  try {
    const resp = await fetch(modelsUrl);
    modelsStatus = resp.status;
    modelsHeaders = Object.fromEntries(resp.headers.entries());
    modelsBody = await resp.text();
    console.log('DEBUG-PROJECT models status:', modelsStatus);
    console.log('DEBUG-PROJECT models headers:', JSON.stringify(modelsHeaders));
    console.log('DEBUG-PROJECT models body (first 1000):', modelsBody?.slice(0, 1000));
  } catch (err: any) {
    console.error('DEBUG-PROJECT models error:', err.message);
  }

  // 2) generateContent minimal (to compare quota behavior)
  const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FALLBACKS[0]}:generateContent?key=${key}`;
  const genPayload = { contents: [{ parts: [{ text: 'hello' }] }] };

  let genStatus: number | null = null;
  let genHeaders: Record<string, string> = {};
  let genBody: string | null = null;

  try {
    const resp = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(genPayload),
    });
    genStatus = resp.status;
    genHeaders = Object.fromEntries(resp.headers.entries());
    genBody = await resp.text();
    console.log('DEBUG-PROJECT generate status:', genStatus);
    console.log('DEBUG-PROJECT generate headers:', JSON.stringify(genHeaders));
    console.log('DEBUG-PROJECT generate body:', genBody?.slice(0, 1000));
  } catch (err: any) {
    console.error('DEBUG-PROJECT generate error:', err.message);
  }

  res.json({
    key: { prefix: keyPrefix, suffix: keySuffix, length: key.length },
    modelsList: {
      status: modelsStatus,
      headers: modelsHeaders,
      body: modelsBody,
    },
    generateContent: {
      status: genStatus,
      headers: genHeaders,
      body: genBody,
      requestPayload: genPayload,
    },
  });
});

app.get('/api/test-generate-minimal', async (_req, res) => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const model = MODEL_FALLBACKS[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const fullUrl = `${url}?key=${key}`;
  const payload = {
    contents: [
      {
        parts: [
          {
            text: 'hello',
          },
        ],
      },
    ],
  };
  const body = JSON.stringify(payload);

  console.log('TEST-MINIMAL URL:', fullUrl.replace(key, '***REDACTED***'));
  console.log('TEST-MINIMAL model:', model);
  console.log('TEST-MINIMAL payload:', body);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body,
    });

    const text = await response.text();
    const headers = Object.fromEntries(response.headers.entries());

    console.log('TEST-MINIMAL status:', response.status);
    console.log('TEST-MINIMAL headers:', JSON.stringify(headers));
    console.log('TEST-MINIMAL body:', text);

    res.json({
      status: response.status,
      headers,
      body: text,
      exactUrl: fullUrl.replace(key, '***REDACTED***'),
      exactPayload: payload,
    });
  } catch (err: any) {
    console.error('TEST-MINIMAL error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/test-gemini-direct', async (_req, res) => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const model = MODEL_FALLBACKS[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const fullUrl = `${url}?key=${key}`;
  const payload = { contents: [{ parts: [{ text: 'Say OK' }] }] };
  const body = JSON.stringify(payload);

  console.log('DIRECT URL:', fullUrl.replace(key, '***REDACTED***'));
  console.log('DIRECT model:', model);
  console.log('DIRECT payload:', body);

  try {
    const resp = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body,
    });
    const text = await resp.text();
    const headers = Object.fromEntries(resp.headers.entries());
    console.log('DIRECT status:', resp.status);
    console.log('DIRECT headers:', JSON.stringify(headers));
    console.log('DIRECT body:', text);
    res.json({ status: resp.status, headers, body: text, exactUrl: fullUrl.replace(key, '***REDACTED***'), exactPayload: payload });
  } catch (err: any) {
    console.error('DIRECT error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debug-model', (_req, res) => {
  res.json(getModelDiagnostics());
});

console.log('BOOT 5 - app export');
export default app;
