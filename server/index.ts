import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze';
import checkoutRouter from './routes/checkout';
import webhookRouter from './routes/webhook';
import { runAllChecks } from './validate';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));

// Raw body for webhook signature verification
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

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const results = await runAllChecks();
    console.log('\n=== Dependency Health ===');
    for (const r of results) {
      const icon = r.status === 'PASS' ? '✓' : '✗';
      console.log(`  ${icon} ${r.name}: ${r.status}${r.message ? ` (${r.message})` : ''}`);
    }
    console.log('=========================\n');

    const failed = results.filter(r => r.status === 'FAIL');
    if (failed.length > 0) {
      console.warn(`WARNING: ${failed.length} dependency check(s) failed. Server will start but some features may not work.`);
    } else {
      console.log('All dependencies passed.');
    }
  } catch (err: any) {
    console.error('Validation error:', err.message);
  }
});
