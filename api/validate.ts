import { getDb, getAuth } from './firebase.js';
console.log('BOOT TRACE - api/validate.ts loaded');

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message?: string;
}

const REQUIRED_ENV_VARS = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'GEMINI_API_KEY',
  'CREEM_API_KEY',
  'CREEM_WEBHOOK_SECRET',
  'CREEM_STARTER_PRICE_ID',
  'CREEM_STANDARD_PRICE_ID',
  'CREEM_PREMIUM_PRICE_ID',
];

function checkEnvVars(): CheckResult[] {
  const missing: string[] = [];
  for (const v of REQUIRED_ENV_VARS) {
    if (!process.env[v]) {
      missing.push(v);
    }
  }
  if (missing.length > 0) {
    return [{
      name: 'Environment Variables',
      status: 'FAIL',
      message: `Missing: ${missing.join(', ')}`,
    }];
  }
  return [{
    name: 'Environment Variables',
    status: 'PASS',
  }];
}

async function checkFirebaseAdmin(): Promise<CheckResult> {
  try {
    const auth = getAuth();
    const projectId = process.env.FIREBASE_PROJECT_ID;
    return {
      name: 'Firebase Admin SDK',
      status: 'PASS',
      message: `Project: ${projectId}`,
    };
  } catch (err: any) {
    return {
      name: 'Firebase Admin SDK',
      status: 'FAIL',
      message: err.message,
    };
  }
}

async function checkFirestoreWrite(): Promise<CheckResult> {
  try {
    const testDoc = getDb().collection('_validations').doc('_test');
    await testDoc.set({ timestamp: new Date().toISOString(), ttl: 1 });
    await testDoc.delete();
    return { name: 'Firestore Write', status: 'PASS' };
  } catch (err: any) {
    return { name: 'Firestore Write', status: 'FAIL', message: err.message };
  }
}

async function checkFirestoreRead(): Promise<CheckResult> {
  try {
    const testDoc = getDb().collection('_validations').doc('_test');
    await testDoc.get();
    return { name: 'Firestore Read', status: 'PASS' };
  } catch (err: any) {
    return { name: 'Firestore Read', status: 'FAIL', message: err.message };
  }
}

async function checkGemini(): Promise<CheckResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('CHECK-GEMINI key prefix:', apiKey?.slice(0, 15));
  console.log('CHECK-GEMINI key length:', apiKey?.length);
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log('CHECK-GEMINI model:', model);
  console.log('CHECK-GEMINI URL (redacted):', url.replace(apiKey || '', '***REDACTED***'));
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'respond with the word OK' }] }] }),
    });
    if (response.ok) {
      return { name: 'Gemini API', status: 'PASS' };
    }
    const errText = await response.text();
    if (response.status === 429) {
      return { name: 'Gemini API', status: 'PASS', message: 'Rate limited (quota exceeded), API key is valid' };
    }
    return { name: 'Gemini API', status: 'FAIL', message: `HTTP ${response.status}: ${errText}` };
  } catch (err: any) {
    return { name: 'Gemini API', status: 'FAIL', message: err.message };
  }
}

async function checkCreemApi(): Promise<CheckResult> {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    return { name: 'Creem API', status: 'FAIL', message: 'CREEM_API_KEY is not set' };
  }
  if (!apiKey.startsWith('creem_')) {
    return { name: 'Creem API', status: 'FAIL', message: 'CREEM_API_KEY has invalid format (should start with creem_)' };
  }
  return { name: 'Creem API', status: 'PASS', message: 'API key format valid' };
}

function checkWebhookSecret(): CheckResult {
  if (process.env.CREEM_WEBHOOK_SECRET) {
    return { name: 'Webhook Secret', status: 'PASS' };
  }
  return { name: 'Webhook Secret', status: 'FAIL', message: 'CREEM_WEBHOOK_SECRET is not set' };
}

export async function runAllChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  results.push(...checkEnvVars());
  results.push(await checkFirebaseAdmin());
  results.push(await checkFirestoreWrite());
  results.push(await checkFirestoreRead());
  results.push(await checkGemini());
  results.push(await checkCreemApi());
  results.push(checkWebhookSecret());
  return results;
}

export async function validateStartup(): Promise<void> {
  const results = await runAllChecks();
  const failed = results.filter(r => r.status === 'FAIL');

  console.log('\n=== Startup Validation ===');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    console.log(`  ${icon} ${r.name}: ${r.status}${r.message ? ` (${r.message})` : ''}`);
  }
  console.log('==========================\n');

  if (failed.length > 0) {
    throw new Error(`Startup validation failed: ${failed.map(f => f.name).join(', ')}`);
  }
}
