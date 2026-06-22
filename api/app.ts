import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';
import adminRouter from './routes/admin.js';
import sitemapRouter from './routes/sitemap.js';

const app = express();
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  process.env.APP_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(a => origin.startsWith(a))) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

// Rate limiting
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const adminLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

app.use(publicLimiter);
app.use('/api/analyze', aiLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api/admin/login', loginLimiter);

// Webhook (raw body required for signature verification)
app.use('/api/webhooks/creem', express.raw({ type: 'application/json' }), (req, _res, next) => {
  if (Buffer.isBuffer(req.body)) {
    (req as any).rawBody = req.body.toString('utf8');
    req.body = JSON.parse((req as any).rawBody);
  }
  next();
}, webhookRouter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api', sitemapRouter);

// Sitemap redirect
app.get('/sitemap.xml', async (_req, res) => {
  res.redirect(301, '/api/sitemap.xml');
});

// Robots.txt
app.get('/robots.txt', async (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Disallow: /admin
Disallow: /api

Sitemap: https://visa-appeal.vercel.app/sitemap.xml
`);
});

// Guides redirect
app.use('/guides', async (_req, res) => {
  res.redirect(301, '/blog');
});

// Health check (minimal in production)
app.get('/api/health', async (_req, res) => {
  if (process.env.VERCEL_ENV === 'production') {
    return res.json({ status: 'ok' });
  }
  const { runAllChecks } = await import('./validate.js');
  const checks = await runAllChecks();
  const allPassed = checks.every(c => c.status === 'PASS');
  res.json({ status: allPassed ? 'ok' : 'degraded', checks });
});

export default app;
