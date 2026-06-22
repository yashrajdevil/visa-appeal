import app from './app.js';
console.log('BOOT 1 - api entry');

const geminiKey = process.env.GEMINI_API_KEY;
console.log('ENV VERCEL_ENV=', process.env.VERCEL_ENV);
console.log('ENV GEMINI_API_KEY prefix:', geminiKey?.slice(0, 15));
console.log('ENV GEMINI_API_KEY suffix:', geminiKey?.slice(-5));
console.log('ENV GEMINI_API_KEY length:', geminiKey?.length);
console.log('ENV GEMINI_API_KEY startsWith AIza:', geminiKey?.startsWith('AIza'));
console.log('ENV GEMINI_API_KEY startsWith AQ.:', geminiKey?.startsWith('AQ.'));

// List all env vars whose name contains API or GEMINI to catch name collisions
const allKeys = Object.keys(process.env).filter(k => /api|gemini/i.test(k));
console.log('ENV all matching vars:', JSON.stringify(allKeys));
for (const k of allKeys) {
  const v = process.env[k];
  console.log(`ENV ${k}= prefix:${v?.slice(0, 10)} length:${v?.length}`);
}

console.log('FIREBASE_PROJECT_ID=', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL=', process.env.FIREBASE_CLIENT_EMAIL);
export default app;
