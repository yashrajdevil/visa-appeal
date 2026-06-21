import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze';
import checkoutRouter from './routes/checkout';
import webhookRouter from './routes/webhook';
import { runAllChecks } from './validate';

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

export default app;
